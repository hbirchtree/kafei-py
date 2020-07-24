package dev.birchy.kafei;

import java.io.IOException;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.ext.Provider;

import static com.google.common.net.HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS;
import static com.google.common.net.HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS;
import static com.google.common.net.HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN;
import static com.google.common.net.HttpHeaders.ORIGIN;

@Provider
public final class DisableCORSNonsense implements ContainerResponseFilter {
    @Override
    public void filter(
            ContainerRequestContext requestContext,
            ContainerResponseContext responseContext) throws IOException {
        responseContext.getHeaders().putSingle(ACCESS_CONTROL_ALLOW_ORIGIN, "*");
        responseContext.getHeaders().putSingle(ACCESS_CONTROL_ALLOW_METHODS, "GET,PUT,POST,DELETE,OPTIONS,HEAD");
        responseContext.getHeaders().putSingle(ACCESS_CONTROL_ALLOW_HEADERS, "Accept,Content-Type,Content-Length");
    }
}
