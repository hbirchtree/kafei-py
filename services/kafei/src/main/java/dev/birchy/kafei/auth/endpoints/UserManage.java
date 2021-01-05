package dev.birchy.kafei.auth.endpoints;

import org.jdbi.v3.core.Jdbi;
import org.joda.time.DateTime;

import java.util.Optional;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

import dev.birchy.kafei.auth.AccessScope;
import dev.birchy.kafei.auth.AuthDao;
import dev.birchy.kafei.auth.responses.AccessManifest;
import dev.birchy.kafei.auth.responses.AuthApproval;
import dev.birchy.kafei.auth.responses.TokenApproval;
import dev.birchy.kafei.auth.responses.UserData;
import dev.birchy.kafei.auth.responses.UserRegistered;
import dev.birchy.kafei.responses.Result;
import io.dropwizard.auth.Auth;
import lombok.extern.slf4j.Slf4j;

import static dev.birchy.kafei.auth.AccessScope.PERM_READ;
import static dev.birchy.kafei.auth.AccessScope.PERM_WRITE;
import static dev.birchy.kafei.auth.AccessScope.USER_MANAGE;
import static dev.birchy.kafei.auth.AccessScope.USER_READ_ACCESS;

@Slf4j
@Path("/v2/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public final class UserManage {
    @Inject
    @Named
    private Jdbi authDb;

    private final static String TOKEN_HEADER = "Authorization";

    private TokenApproval getToken(String headerValue) {
        if(headerValue == null || !headerValue.startsWith("Bearer "))
            return null;

        return new TokenApproval(
                null,
                null,
                headerValue.substring("Bearer ".length()));
    }

    private Response unauthorizedAccess() {
        return Result
                .error(Response.Status.UNAUTHORIZED)
                .withCode(Response.Status.UNAUTHORIZED)
                .build();
    }

    @POST
    @Path("register")
    public Response registerUser(UserData user) {
        Optional<Long> userId = Optional.ofNullable(
                authDb.withExtension(AuthDao.class, (auth) -> auth.addUser(user)));

        return userId.map((id) -> Result
                .ok(new UserRegistered(user.getUsername(), null))
                .withCode(Response.Status.OK)
                .build())
            .orElseGet(this::unauthorizedAccess);
    }

    @POST
    @Path("checkAuthenticate")
    public Response checkAuthenticate(TokenApproval token) {
        Optional<AuthApproval> approval = Optional.ofNullable(
                authDb.withExtension(AuthDao.class, (auth) -> auth.checkToken(token)));

        return approval.map((app) -> Result
                .ok()
                .wrapped())
            .orElseGet(this::unauthorizedAccess);
    }

    @POST
    @Path("authenticate")
    public Response authenticate(UserData user) {
        Optional<AuthApproval> approval = authDb.withExtension(AuthDao.class, (auth) ->
                auth.authenticateUser(user)
        );

        log.debug("{}", approval);

        return approval.map((app) -> {
            Optional<String> tokenOpt = Optional.ofNullable(authDb.withExtension(AuthDao.class, (auth) ->
                auth.generateToken(app.getUserId(), "main", DateTime.now().plusDays(14))));

            return tokenOpt.map((token) -> Result
                    .ok(new TokenApproval(user.getUsername(), "main", token))
                    .withCode(Response.Status.OK)
                    .cookie(new NewCookie("Kafei-Api-Token", token))
                    .build())
                .orElseGet(this::unauthorizedAccess);
        }).orElseGet(this::unauthorizedAccess);
    }

    @GET
    @Path("access/{scope}")
    @RolesAllowed(USER_READ_ACCESS + "+" + PERM_READ)
    public Response getAccess(
            @PathParam("scope") String scope_,
            @QueryParam("perm") String permission_,
            @Auth @HeaderParam(TOKEN_HEADER) String token_) {
        TokenApproval token = getToken(token_);

        if(token == null)
            return unauthorizedAccess();

        AccessScope scope = new AccessScope(scope_, permission_);

        scope.validate();

        Optional<AccessManifest> manifest = Optional.ofNullable(
                authDb.withExtension(AuthDao.class, (auth) ->
                        auth.checkScopePermission(token, scope)));

        return manifest.map((accept) -> Result
                .ok()
                .withCode(Response.Status.OK)
                .build()
        ).orElseGet(this::unauthorizedAccess);
    }

    @PUT
    @Path("access/{scope}")
    @RolesAllowed(USER_MANAGE + "+" + PERM_WRITE)
    public Response putAccess(
            @PathParam("scope") String scope_,
            @QueryParam("perm") String permission_,
            @HeaderParam(TOKEN_HEADER) String token_) {
        TokenApproval token = getToken(token_);

        AccessScope scope = new AccessScope(scope_, permission_);

        scope.validate();

        boolean success = authDb.withExtension(AuthDao.class, (auth) ->
            auth.addScopePermission(token, scope));

        if(success)
            return Result
                    .ok()
                    .withCode(Response.Status.OK)
                    .build();
        else
            return Result
                    .error(Response.Status.CONFLICT)
                    .withCode(Response.Status.CONFLICT)
                    .build();
    }

    @DELETE
    @Path("access/{scope}")
    @RolesAllowed(USER_MANAGE + "+" + PERM_WRITE)
    public Response removeAccess(
            @PathParam("scope") String scope_,
            @QueryParam("perm") String permission_,
            @Auth @HeaderParam(TOKEN_HEADER) String token_) {
        TokenApproval token = getToken(token_);

        if(token == null)
            return unauthorizedAccess();

        AccessScope scope = new AccessScope(scope_, permission_);

        scope.validate();

        boolean success = authDb.withExtension(AuthDao.class, (auth) ->
                auth.removeScopePermission(token, scope));

        if(success)
            return Result
                    .ok()
                    .withCode(Response.Status.OK)
                    .build();
        else
            return Result
                    .error(Response.Status.NOT_FOUND)
                    .withCode(Response.Status.NOT_FOUND)
                    .build();
    }
}
