package dev.birchy.kafei.crash.endpoints;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.jdbi.v3.core.Jdbi;
import org.joda.time.DateTime;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import dev.birchy.kafei.CORSData;
import dev.birchy.kafei.RespondsWith;
import dev.birchy.kafei.crash.CrashSummary;
import dev.birchy.kafei.crash.dao.CrashDao;
import dev.birchy.kafei.responses.Result;
import dev.birchy.kafei.responses.ShortLink;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Path("/v2/crash")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.MULTIPART_FORM_DATA)
public final class CrashSubmission {
    @Inject
    @Named
    private Jdbi crashDb;

    @Context
    private UriInfo uriInfo;

    @Inject
    private CORSData corsData;

    @Inject
    private ObjectMapper mapper;

    private Response.ResponseBuilder addCORS(Response.ResponseBuilder r) {
        if(corsData != null)
            return r.header("Access-Control-Allow-Origin", corsData.getAllowOrigin());
        else
            return r.header("Access-Control-Allow-Origin", "*");
    }

    @POST
    @RespondsWith(CrashSummary.class)
    public Response postCrash(FormDataMultiPart outputs) {
        if(!outputs.getFields().containsKey("stdout") && !outputs.getFields().containsKey("stderr"))
            return Result
                    .error(Response.Status.BAD_REQUEST)
                    .withCode(Response.Status.BAD_REQUEST)
                    .build();

        long crashId = crashDb.withExtension(CrashDao.class, (crash -> {
            String profile =  outputs.getFields().containsKey("profile")
                    ? outputs.getField("profile").getValue()
                    : null;

            if(profile != null) {
                try {
                    mapper.readTree(profile);
                } catch (JsonParseException e) {
                    profile = profile + "{}]}";
                } catch (IOException e) {
                }
            }

            return crash.addCrash(
                    new DateTime(),
                    outputs.getField("stdout").getValue().getBytes(),
                    outputs.getField("stderr").getValue().getBytes(),
                    profile != null ? profile.getBytes() : null);
        }));

        return Result.ok(new CrashSummary(crashId, null))
                .withLinks(Arrays.asList(
                        ShortLink.fromResource(CrashSubmission.class)
                                .path(crashId + "")
                                .requestMethod("GET")
                                .build(),
                        ShortLink.fromResource(CrashSubmission.class)
                                .path(crashId + "/stdout")
                                .requestMethod("GET")
                                .build(),
                        ShortLink.fromResource(CrashSubmission.class)
                                .path(crashId + "/stderr")
                                .requestMethod("GET")
                                .build(),
                        ShortLink.fromResource(CrashSubmission.class)
                                .path(crashId + "/profile")
                                .requestMethod("GET")
                                .build()))
                .withCode(Response.Status.CREATED)
                .build();
    }

    @GET
    @RespondsWith(CrashSummary.class)
    public Response getCrashes() {
        return addCORS(Result
                .ok(crashDb.withExtension(CrashDao.class, crashDao -> crashDao.getCrashes())
                        .stream()
                        .map((crash ->
                            Result.ok(crash).withLinks(
                                    Arrays.asList(
                                            ShortLink.fromResource(CrashSubmission.class)
                                                    .path(crash.getCrashId() + "")
                                                    .requestMethod("GET")
                                                    .build(),
                                            ShortLink.fromResource(CrashSubmission.class)
                                                    .path(crash.getCrashId() + "/stdout")
                                                    .requestMethod("GET")
                                                    .build(),
                                            ShortLink.fromResource(CrashSubmission.class)
                                                    .path(crash.getCrashId() + "/stderr")
                                                    .requestMethod("GET")
                                                    .build(),
                                            ShortLink.fromResource(CrashSubmission.class)
                                                    .path(crash.getCrashId() + "/profile")
                                                    .requestMethod("GET")
                                                    .build()
                                    )).removeMessage())))
                .withCode(Response.Status.OK))
                .build();
    }

    @GET
    @Path("{id}")
    @RespondsWith(CrashSummary.class)
    public Response getCrash(@PathParam("id") long id) {
        return crashDb.withExtension(CrashDao.class, (crash) -> crash.getCrash(id))
                .map((crashInfo) -> addCORS(Result.ok(crashInfo).withCode(Response.Status.OK)).build())
                .orElseGet(() -> addCORS(Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND))
                        .build());
    }

    @GET
    @Path("{id}/stdout")
    @RespondsWith(String.class)
    public Response getCrashOut(@PathParam("id") long id) {
        Optional<byte[]> output =
                crashDb.withExtension(CrashDao.class, (crash) -> crash.getCrashOut(id));

        return output.map((out) -> addCORS(Response.ok(out).type(MediaType.TEXT_PLAIN)).build())
                .orElseGet(() -> addCORS(Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND))
                        .build());
    }

    @GET
    @Path("{id}/stderr")
    @RespondsWith(String.class)
    public Response getCrashErr(@PathParam("id") long id) {
        Optional<byte[]> output =
                crashDb.withExtension(CrashDao.class, (crash) -> crash.getCrashErr(id));

        return output
                .map((out) -> addCORS(Response.ok(out).type(MediaType.TEXT_PLAIN)).build())
                .orElseGet(() -> addCORS(Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND))
                        .build());
    }

    @GET
    @Path("{id}/profile")
    @RespondsWith(String.class)
    public Response getCrashProfile(@PathParam("id") long id) {
        Optional<byte[]> output =
                crashDb.withExtension(CrashDao.class, (crash) -> crash.getCrashProfile(id));

        return output
                .map((out) -> addCORS(Response.ok(out).type(MediaType.TEXT_PLAIN)).build())
                .orElseGet(() -> addCORS(Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND))
                        .build());
    }
}
