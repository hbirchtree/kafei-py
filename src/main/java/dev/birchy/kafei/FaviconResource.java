package dev.birchy.kafei;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Path("/")
@Produces("image/x-icon")
public final class FaviconResource {
    @GET
    @Path("favicon.ico")
    public Response rootFavicon() {
        return Response
                .status(Response.Status.OK)
                .entity(getClass().getClassLoader().getResourceAsStream("assets/kafei.ico"))
                .build();
    }
    @GET
    @Path("v2/reportSink/favicon.ico")
    public Response sinkFavicon() {
        return Response
                .status(Response.Status.OK)
                .entity(getClass().getClassLoader().getResourceAsStream("assets/kafei.ico"))
                .build();
    }
    @GET
    @Path("v2/crash/favicon.ico")
    public Response crashFavicon() {
        return Response
                .status(Response.Status.OK)
                .entity(getClass().getClassLoader().getResourceAsStream("assets/kafei.ico"))
                .build();
    }
}
