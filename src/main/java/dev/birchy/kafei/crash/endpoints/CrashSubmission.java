package dev.birchy.kafei.crash.endpoints;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.eclipse.paho.client.mqttv3.MqttException;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.jdbi.v3.core.Jdbi;
import org.joda.time.DateTime;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.util.Arrays;
import java.util.Optional;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;
import javax.ws.rs.core.UriInfo;

import dev.birchy.kafei.RespondsWith;
import dev.birchy.kafei.crash.CrashSummary;
import dev.birchy.kafei.crash.CrashDao;
import dev.birchy.kafei.mqtt.GlobalTopics;
import dev.birchy.kafei.mqtt.MqttPublisher;
import dev.birchy.kafei.responses.Result;
import dev.birchy.kafei.responses.ShortLink;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import static dev.birchy.kafei.auth.AccessScope.DIAGNOSTICS_CRASHES;
import static dev.birchy.kafei.auth.AccessScope.PERM_WRITE;

@Slf4j
@Path("/v2/crash")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public final class CrashSubmission {
    @Inject
    @Named
    private Jdbi crashDb;

    @Inject
    private MqttPublisher publisher;

    @Context
    private UriInfo uriInfo;

    @Inject
    private ObjectMapper mapper;

    private byte[] cleanTerminalOutput(byte[] input_) {
        String input = new String(input_);

        while(true)
        {
            /* Find the start of the control code, indicated by 0x1b or \033 */
            int index = input.indexOf(0x1b);

            if(index == -1)
                break;

            /* Find the end, indicated by 0x6d or 'm' */
            int end = input.indexOf(0x6d, index);

            if(end != -1)
            {
                input = input.substring(0, index) + input.substring(end + 1);
            }
        }

        return input.getBytes();
    }

    private InputStream fileToStream(File f) throws FileNotFoundException {
        return new FileInputStream(f);
    }

    public enum CrashChange {
        ADDED,
        MODIFIED,
        DELETED,
    };

    @Data
    @AllArgsConstructor
    public static final class CrashUpdate {
        private long crashId;
        private CrashChange change;
    }

    @POST
    @RespondsWith(CrashSummary.class)
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response postCrash(
            @Context HttpHeaders headers,
            @FormDataParam("stdout") File stdout,
            @FormDataParam("stderr") File stderr,
            @FormDataParam("exitCode") int exitCode,
            @FormDataParam("profile") File profile,
            @FormDataParam("machineProfile") File machineInfo,
            @FormDataParam("stacktrace") File stacktrace
//            FormDataMultiPart outputs
    )
            throws MqttException, JsonProcessingException, MalformedURLException, FileNotFoundException {

        if(stdout == null || stderr == null) {
            return Result
                    .error(Response.Status.BAD_REQUEST)
                    .withMessage("Missing fields stdout and stderr")
                    .withCode(Response.Status.BAD_REQUEST)
                    .build();
        }

        long crashId = crashDb.inTransaction((t -> {
            CrashDao crash = t.attach(CrashDao.class);

            try {
                return crash.addCrash(
                        new DateTime(),
                        fileToStream(stdout),
                        fileToStream(stderr),
                        fileToStream(profile),
                        fileToStream(machineInfo),
                        fileToStream(stacktrace),
                        exitCode);
            } catch (FileNotFoundException e) {
                return new Long(-1);
            }
        }));

//        if(!outputs.getFields().containsKey("stdout") && !outputs.getFields().containsKey("stderr"))
//            return Result
//                    .error(Response.Status.BAD_REQUEST)
//                    .withMessage("Fields \"stdout\" and \"stderr\" are required")
//                    .withCode(Response.Status.BAD_REQUEST)
//                    .build();
//
//        int exitCode = outputs.getFields().containsKey("exitCode")
//                ? Integer.parseInt(outputs.getField("exitCode").getValue())
//                : 0;
//
//        long crashId = crashDb.withExtension(CrashDao.class, (crash -> {
//            String profile =  outputs.getFields().containsKey("profile")
//                    ? outputs.getField("profile").getValue()
//                    : null;
//
//            String machineInfo = outputs.getFields().containsKey("machineProfile")
//                    ? outputs.getField("machineProfile").getValue()
//                    : null;
//
//            String stacktrace = outputs.getFields().containsKey("stacktrace")
//                    ? outputs.getField("stacktrace").getValue()
//                    : null;
//
//            if(profile != null) {
//                try {
//                    mapper.readTree(profile);
//                } catch (JsonParseException e) {
//                    profile = profile + "{}]}";
//                } catch (IOException e) {
//                }
//            }
//
//            return crash.addCrash(
//                    new DateTime(),
//                    outputs.getField("stdout"),
//                    outputs.getField("stderr").getValue().getBytes(),
//                    profile != null ? profile.getBytes() : null,
//                    machineInfo != null ? machineInfo.getBytes() : null,
//                    stacktrace != null ? stacktrace.getBytes() : null,
//                    exitCode);
//        }));

        publisher.publish(GlobalTopics.CRASH_UPDATE, new CrashUpdate(crashId, CrashChange.ADDED));

        log.debug("Parameters: abs={}, req={} headers={}",
                uriInfo.getAbsolutePath(), uriInfo.getRequestUri(), headers.getRequestHeaders());

        final String linkTo = headers.getHeaderString("X-Link-To");

        return Result.ok(new CrashSummary(crashId, null, exitCode))
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
                                .build(),
                        ShortLink.fromResource(CrashSubmission.class)
                                .path(crashId + "/machine")
                                .requestMethod("GET")
                                .build()))
                .withCreated(Optional
                        .ofNullable(linkTo != null ? UriBuilder.fromUri(linkTo) : null)
                        .orElse(uriInfo.getAbsolutePathBuilder())
                        .path(crashId + "")
                        .build())
                .build();
    }

    @GET
    @RespondsWith(CrashSummary.class)
    public Response getCrashes() {
        return Result
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
                                                    .build(),
                                            ShortLink.fromResource(CrashSubmission.class)
                                                    .path(crash.getCrashId() + "/machine")
                                                    .requestMethod("GET")
                                                    .build(),
                                            ShortLink.fromResource(CrashSubmission.class)
                                                    .path(crash.getCrashId() + "/stacktrace")
                                                    .requestMethod("GET")
                                                    .build()
                                    )).removeMessage())))
                .withCode(Response.Status.OK)
                .build();
    }

    @GET
    @Path("{id}")
    @RespondsWith(CrashSummary.class)
    public Response getCrash(@PathParam("id") long id) {
        return crashDb.withExtension(CrashDao.class, (crash) -> crash.getCrash(id))
                .map((crashInfo) -> Result.ok(crashInfo).withCode(Response.Status.OK).build())
                .orElseGet(() -> Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND)
                        .build());
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed(DIAGNOSTICS_CRASHES + "+" + PERM_WRITE)
    public Response deleteCrash(@PathParam("id") long crashId) throws MqttException, JsonProcessingException {
        int deleted = crashDb.withExtension(CrashDao.class, (crash) ->
                        crash.deleteCrash(crashId));

        if(deleted > 1)
            throw new WebApplicationException("deleted more than one element");

        if(deleted == 1)
            publisher.publish(GlobalTopics.CRASH_UPDATE, new CrashUpdate(crashId, CrashChange.DELETED));

        return deleted == 1 ? Result
                .ok()
                .withCode(Response.Status.OK)
                .build()
                : Result
                .error(Response.Status.NOT_FOUND)
                .withCode(Response.Status.NOT_FOUND)
                .build();
    }

    @GET
    @Path("{id}/stdout")
    @RespondsWith(String.class)
    public Response getCrashOut(@PathParam("id") long id) {
        Optional<InputStream> output = Optional.ofNullable(
                crashDb.inTransaction((t) -> t.attach(CrashDao.class).getCrashOut(id)));

        return output.map((out) -> Response.ok(out).type(MediaType.TEXT_PLAIN).build())
                .orElseGet(() -> Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND)
                        .build());
    }

    @GET
    @Path("{id}/stderr")
    @RespondsWith(String.class)
    public Response getCrashErr(@PathParam("id") long id) {
        Optional<InputStream> output = Optional.ofNullable(
                crashDb.inTransaction((t) -> t.attach(CrashDao.class).getCrashErr(id)));

        return output
                .map((out) -> Response.ok(out).type(MediaType.TEXT_PLAIN).build())
                .orElseGet(() -> Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND)
                        .build());
    }

    @GET
    @Path("{id}/profile")
    @RespondsWith(String.class)
    public Response getCrashProfile(@PathParam("id") long id) {
        Optional<InputStream> output = Optional.ofNullable(
                crashDb.inTransaction((t) -> t.attach(CrashDao.class).getCrashProfile(id)));

        return output
                .map((out) -> Response.ok(out).type(MediaType.APPLICATION_JSON).build())
                .orElseGet(() -> Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND)
                        .build());
    }

    @GET
    @Path("{id}/machine")
    @RespondsWith(String.class)
    public Response getCrashMachine(@PathParam("id") long id) {
        Optional<InputStream> output = Optional.ofNullable(
                crashDb.inTransaction((t) -> t.attach(CrashDao.class).getCrashMachine(id)));

        return output
                .map((out) -> Response.ok(out).type(MediaType.APPLICATION_JSON).build())
                .orElseGet(() -> Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND)
                        .build());
    }

    @GET
    @Path("{id}/stacktrace")
    @RespondsWith(String.class)
    public Response getCrashStacktrace(@PathParam("id") long id) {
        Optional<InputStream> output = Optional.ofNullable(
                crashDb.inTransaction((t) -> t.attach(CrashDao.class).getCrashStacktrace(id)));

        return output.map((out) -> Response.ok(out).type(MediaType.APPLICATION_JSON).build())
                .orElseGet(() -> Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND)
                        .build());
    }
}
