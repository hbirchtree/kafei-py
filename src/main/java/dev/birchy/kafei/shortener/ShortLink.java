package dev.birchy.kafei.shortener;

import org.glassfish.jersey.client.internal.HttpUrlConnector;
import org.jdbi.v3.core.Jdbi;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.util.Optional;

import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;
import javax.ws.rs.core.UriInfo;

import dev.birchy.kafei.responses.Result;
import dev.birchy.kafei.shortener.dao.ShortDao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Path("/short")
public final class ShortLink {
    @Inject
    private UriInfo uriInfo;

    @Inject
    @Named
    private Jdbi shortenDb;

    @Data
    @AllArgsConstructor
    public static class LinkDescription
    {
        private String name;
        private String url;
    }

    private Optional<URI> createConnection(final String name)
    {
        return shortenDb.withExtension(ShortDao.class, (shorts) -> shorts.getLink(name))
                .map(URI::create);
    }

    @POST
    @Path("create/{newName}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createLink(@PathParam("newName") final String newName, final String url)
    {
        URI validateUrl = URI.create(url);

        shortenDb.useExtension(ShortDao.class, (shorts) -> {
            shorts.addLink(newName, validateUrl.toString());
        });

        return Result.ok().wrapped();
    }

    @GET
    @Path("create/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response emptyLink()
    {
        return Result.ok().wrapped();
    }

    @GET
    @Path("inspect/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getLink(@PathParam("name") final String name)
    {
        return createConnection(name).map(url -> Response.ok(new LinkDescription(name, url.toString())))
                .orElse(Response.status(Response.Status.NOT_FOUND))
                .build();
    }

    @GET
    @Path("{name}")
    public Response requestGet(@PathParam("name") final String name)
    {
        return createConnection(name)
                .map(url -> Response.status(Response.Status.FOUND).location(url))
                .orElse(Result.error(Response.Status.NOT_FOUND).withCode(Response.Status.NOT_FOUND))
                .build();
    }

    @POST
    @Path("{name}")
    public Response requestPost(@PathParam("name") final String name)
    {
        return createConnection(name)
                .map(url -> Response.status(Response.Status.FOUND).location(url))
                .orElse(Result.error(Response.Status.NOT_FOUND).withCode(Response.Status.NOT_FOUND))
                .build();
    }
}
