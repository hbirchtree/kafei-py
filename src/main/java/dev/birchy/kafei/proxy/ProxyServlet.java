package dev.birchy.kafei.proxy;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.URLConnection;

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
            final HttpServletResponse resp) {
        resp.setStatus(Response.Status.OK.getStatusCode());

        UriBuilder builder = config.getUriBase();

        for(String param : config.getParameters().keySet()) {
            builder = builder.replaceQueryParam(
                    config.getParameters().get(param),
                    req.getParameter(param));
        }

        URI path = builder.build().normalize();

        log.debug("Request to: {}", path.toString());

        try {
            HttpURLConnection connection =
                    (HttpURLConnection) path.toURL().openConnection();
            connection.setRequestMethod(method);

            connection.connect();

            int code = connection.getResponseCode();

            log.debug("Response: {}", code);
        } catch (IOException e) {
            e.printStackTrace();
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
