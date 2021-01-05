package dev.birchy.kafei.endpoints;

import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;
import javax.ws.rs.core.UriInfo;

import dev.birchy.kafei.proxy.ProxyConfig;
import dev.birchy.kafei.responses.Result;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Produces(MediaType.APPLICATION_JSON)
public final class WebProxy {
//    private ProxyConfig config;
//
//    @Context
//    private UriInfo uriInfo;
//
//    @GET
//    public Response proxyPass() {
//        log.debug("{} + {}",
//                uriBase != null ? uriBase.toTemplate() : null,
//                config.getParameters());
//        log.debug("{}", this);
//
//        return Result.ok()
//                .withCode(Response.Status.BAD_GATEWAY)
//                .build();
//    }
}
