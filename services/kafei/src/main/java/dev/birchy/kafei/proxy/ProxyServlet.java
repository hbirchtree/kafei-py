package dev.birchy.kafei.proxy;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.HttpMethod;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class ProxyServlet extends HttpServlet {
    private ProxyConfig config;

    public ProxyServlet(final ProxyConfig config) {
        this.config = config;
    }

    private void proxyRequest(
            final String method,
            final HttpServletRequest req,
            final HttpServletResponse resp) throws IOException {
        resp.setStatus(Response.Status.OK.getStatusCode());

        UriBuilder builder = config.getUriBase();

        for(String param : config.getParameters().keySet()) {
            builder = builder.replaceQueryParam(
                    config.getParameters().get(param),
                    req.getParameter(param));
        }

        URI path = builder.build().normalize();

        log.debug("Request to: {}", path.toString());

        HttpURLConnection connection =
                (HttpURLConnection) path.toURL().openConnection();
        connection.setRequestProperty("Accept", "application/json");
        try {
            connection.setRequestMethod(method);
            connection.connect();

            byte[] data = new byte[connection.getContentLength()];
            connection.getInputStream().read(data, 0, connection.getContentLength());

            int code = connection.getResponseCode();
            resp.setStatus(code);
            resp.setContentType(connection.getContentType());
            resp.getOutputStream().write(data);

        } catch (IOException e) {
            /* If we can, forward the proxied host's message */
            if(connection.getResponseCode() != 0)
            {
                byte[] body = new byte[connection.getContentLength()];
                connection.getInputStream().read(body);

                resp.sendError(connection.getResponseCode(), connection.getResponseMessage());
                resp.getOutputStream().write(body);
            }else {
                resp.setStatus(Response.Status.BAD_GATEWAY.getStatusCode());

                resp.getOutputStream().write(
                        String.format("{\"message\":\"%s\",\"code\":502}",
                                e.getMessage()).getBytes());
            }
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        proxyRequest(HttpMethod.GET, req, resp);
    }

    @Override
    protected void doHead(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        proxyRequest(HttpMethod.HEAD, req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        proxyRequest(HttpMethod.POST, req, resp);
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        proxyRequest(HttpMethod.PUT, req, resp);
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        proxyRequest(HttpMethod.DELETE, req, resp);
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        proxyRequest(HttpMethod.OPTIONS, req, resp);
    }

    @Override
    protected long getLastModified(HttpServletRequest req) {
        // TODO: Implement optional caching
        return super.getLastModified(req);
    }
}
