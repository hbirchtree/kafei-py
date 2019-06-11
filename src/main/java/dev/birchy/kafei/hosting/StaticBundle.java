package dev.birchy.kafei.hosting;

import org.apache.commons.io.FilenameUtils;
import org.apache.tika.Tika;
import org.glassfish.hk2.utilities.binding.AbstractBinder;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.HttpHeaders;

import io.dropwizard.Bundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class StaticBundle implements Bundle {
    @Slf4j
    private static class StaticServlet extends HttpServlet {
        private StaticSource source;
        private Tika tika;

        public StaticServlet(final StaticSource source) {
            this.source = source;
            this.tika = new Tika();
        }

        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            final String subPath = Optional
                    .of(req.getPathInfo() != null
                            ? req.getPathInfo()
                            : source.getDefaultFile())
                    // This deduplicates slashes and relativizes all paths
                    // .. in the URL doesn't transfer
                    .map((path) -> path
                            .replaceAll("/{2,}", "/")
                            .replaceAll("^/", "")
                            .replaceAll("\\.\\./?", ""))
                    .filter((path) -> !path.isEmpty())
                    .orElse(source.getDefaultFile());

            Path targetPath = source.getSourceDir().resolve(Paths.get(subPath));

            log.info("Searching for path {} -> {}", subPath, targetPath);

            File file = targetPath.toFile();

            if(file == null || !file.exists()) {
                log.debug("No files found for {}", subPath);
                resp.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            if(file.length() == 0) {
                resp.sendError(HttpServletResponse.SC_NO_CONTENT);
                return;
            }

            byte[] out = new byte[(int)file.length()];

            try {
                new FileInputStream(file).read(out);

                final Map<String, String> mimeTypes = source.getExtraMimeTypes();
                final String ext = FilenameUtils.getExtension(subPath);

                if(mimeTypes != null && mimeTypes.containsKey(ext))
                    resp.setHeader(HttpHeaders.CONTENT_TYPE, mimeTypes.get(ext));
                else
                    resp.setHeader(HttpHeaders.CONTENT_TYPE, tika.detect(file));
                resp.setHeader(HttpHeaders.CONTENT_LENGTH, "" + file.length());

                resp.getOutputStream().write(out);
            } catch (IOException e) {
                log.debug("{}", e);
            }

            log.debug("{}", resp.getHeaderNames());
        }
    }

    @Data
    public static class StaticSource {
        private Path sourceDir;
        private String defaultFile = "index.html";
        private Map<String, String> extraMimeTypes;

        public static StaticSource from(final String source) {
            StaticSource out = new StaticSource();
            out.setSourceDir(Paths.get(source));
            return out;
        }

        public StaticSource defaultTo(final String defaultFile) {
            setDefaultFile(defaultFile);
            return this;
        }

        public StaticSource addType(final String ext, final String type) {
            if(extraMimeTypes == null)
                extraMimeTypes = new HashMap<>();

            extraMimeTypes.put(ext, type);
            return this;
        }
    }

    private StaticSource source;
    private String targetPath;
    private String name;

    public StaticBundle(final String source, final String target, final String defaultFile, final String name) {
        this.source = new StaticSource();
        this.targetPath = target;
        this.name = name;

        this.source.setSourceDir(Paths.get(source));

        if(defaultFile != null)
            this.source.setDefaultFile(defaultFile);
    }

    public StaticBundle(final StaticSource source, final String target, final String name) {
        this.source = source;
        this.targetPath = target;
        this.name = name;
    }

    @Override
    public void initialize(Bootstrap<?> bootstrap) {
    }

    @Override
    public void run(Environment environment) {
        log.info("Current files: {}", Arrays.toString(source.getSourceDir().toFile().listFiles()));
        log.info("Registering StaticBundle with name: {} for path {}", name, targetPath);
        environment.servlets()
                .addServlet(name, new StaticServlet(source))
                .addMapping(targetPath + "/*");
    }
}
