package dev.birchy.kafei.auth.authenticate;

import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import dev.birchy.kafei.responses.Result;
import io.dropwizard.auth.UnauthorizedHandler;

public final class UnauthenticatedHandler implements UnauthorizedHandler {
    @Override
    public Response buildResponse(String prefix, String realm) {
        return Result
                .error(Response.Status.UNAUTHORIZED)
                .withCode(Response.Status.UNAUTHORIZED)
                .type(MediaType.APPLICATION_JSON_TYPE)
                .build();
    }
}
