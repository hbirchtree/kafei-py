package dev.birchy.kafei.hosting;

import org.apache.tika.Tika;
import org.glassfish.hk2.utilities.binding.AbstractBinder;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;
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
                    .map((path) -> path.replaceAll("/{2,}", "/").replaceAll("^/", ""))
                    .filter((path) -> !path.isEmpty())
                    .orElse(source.getDefaultFile());

            log.info("Searching for path {}", subPath);

            File[] files = source.getSourceDir()
                    .listFiles((file, s) -> s.equals(subPath));

            if(files == null || files.length == 0) {
                log.debug("No files found for {}", subPath);
                resp.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            for(File f : files) {
                if(f.length() == 0) {
                    resp.sendError(HttpServletResponse.SC_NO_CONTENT);
                    return;
                }
            }

            Arrays.stream(files).findFirst().ifPresent((file) -> {
                byte[] out = new byte[(int)file.length()];

                try {
                    new FileInputStream(file).read(out);

                    resp.setHeader(HttpHeaders.CONTENT_TYPE, tika.detect(file));
                    resp.getOutputStream().write(out);

                } catch (IOException e) {
                    log.debug("{}", e);
                }
            });

            log.debug("{}", resp.getHeaderNames());
        }
    }

    @Data
    public static class StaticSource {
        private File sourceDir;
        private String defaultFile;
    }

    private StaticSource source;
    private String targetPath;
    private String name;

    public StaticBundle(final String source, final String target, final String defaultFile, final String name) {
        this.source = new StaticSource();
        this.targetPath = target;
        this.name = name;

        this.source.setSourceDir(new File(source));
        this.source.setDefaultFile(defaultFile != null ? defaultFile : "index.html");
    }

    @Override
    public void initialize(Bootstrap<?> bootstrap) {
    }

    @Override
    public void run(Environment environment) {
        log.info("Current files: {}", source.getSourceDir().listFiles());
        log.info("Registering StaticBundle with name: {} for path {}", name, targetPath);
        environment.servlets()
                .addServlet(name, new StaticServlet(source))
                .addMapping(targetPath + "/*");

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(source).to(StaticSource.class);
            }
        });
    }
}
