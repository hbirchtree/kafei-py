package dev.birchy.kafei.github.endpoints;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.apache.commons.codec.digest.HmacAlgorithms;
import org.apache.commons.codec.digest.HmacUtils;
import org.jdbi.v3.core.Jdbi;
import org.joda.time.DateTime;

import java.io.IOException;

import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import dev.birchy.kafei.github.GitHubSettings;
import dev.birchy.kafei.github.dao.GithubDao;
import dev.birchy.kafei.github.responses.GitRelease;
import dev.birchy.kafei.github.responses.GitUpdate;
import dev.birchy.kafei.responses.Result;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Path("/github")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public final class GithubReleases {
    @Inject
    private GitHubSettings settings;
    @Inject
    private ObjectMapper mapper;
    @Inject
    @Named
    private Jdbi githubDb;

    @GET
    @Path("/latestRelease")
    public Response getLatest() {
        return githubDb
                .withExtension(GithubDao.class, (git) -> git.getReleases().stream().findFirst())
                .map((release) ->
                {
                    try {
                        return Result
                                .ok(mapper.readValue(release.getRequest(), ObjectNode.class))
                                .wrapped();
                    } catch (IOException e) {
                        log.error("{}", e);
                        return Result.error(Response.Status.INTERNAL_SERVER_ERROR).wrapped();
                    }
                })
                .orElse(Result.error(Response.Status.NOT_FOUND).wrapped());
    }

    @GET
    @Path("/updateInfo")
    public Response getUpdate() {
        return githubDb
                .withExtension(GithubDao.class, (git) -> git.getUpdates().stream().findFirst())
                .map((update) -> {
                    try {
                        return Result.ok(mapper.readValue(update.getRequest(), ObjectNode.class)).wrapped();
                    } catch (IOException e) {
                        log.error("{}", e);
                        return Result.error(Response.Status.INTERNAL_SERVER_ERROR).wrapped();
                    }
                }).orElse(Result.error(Response.Status.NOT_FOUND).wrapped());
    }

    private boolean verifyHmac(String signature, String payload) {
        String calculatedSignature =
                new HmacUtils(HmacAlgorithms.HMAC_SHA_1, settings.getSecret().getBytes())
                        .hmacHex(payload);

        log.info("{} ?= {}", calculatedSignature, signature);
        return calculatedSignature.equals(signature);
    }

    @POST
    @Path("/hook")
    public Response receiveHook(
            @HeaderParam("X-GitHub-Event") String event,
            @HeaderParam("X-Hub-Signature") String signature,
            String payload_) throws IOException {

        if(!verifyHmac(signature.split("=")[1], payload_))
            return Result.error(Response.Status.UNAUTHORIZED).wrapped();

        ObjectNode payload = (ObjectNode) mapper.readTree(payload_);

        switch(event) {
            case "release": {
                githubDb.useExtension(GithubDao.class, (git) -> {
                    GitRelease release = new GitRelease();
                    release.setUpdateTime(
                            new DateTime(payload.get("release").get("published_at").asText()));
                    release.setRequest(mapper.writeValueAsBytes(payload));

                    git.insertRelease(release);

                    git.cleanReleases(release.getUpdateTime());
                });
                break;
            }
            case "push": {
                githubDb.useExtension(GithubDao.class, (git) -> {
                    GitUpdate update = new GitUpdate();
                    update.setUpdateTime(
                            new DateTime(payload.get("head_commit").get("timestamp").asText()));
                    update.setRequest(mapper.writeValueAsBytes(payload));

                    git.insertUpdate(update);

                    git.cleanUpdates(update.getUpdateTime());
                });
                break;
            }
            default: {
                return Result.error(Response.Status.BAD_REQUEST).wrapped();
            }
        }

        return Result.ok().wrapped();
    }
}
