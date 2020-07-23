package dev.birchy.kafei.auth;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.joda.time.DateTime;

import java.util.List;
import java.util.Optional;

import dev.birchy.kafei.auth.responses.AuthApproval;
import dev.birchy.kafei.auth.responses.TokenApproval;
import dev.birchy.kafei.auth.responses.UserData;
import dev.birchy.kafei.auth.responses.AccessManifest;

public interface AuthDao {
    @SqlUpdate(
            "insert into auth.users" +
                " (username, password)" +
                " values(:username, crypt(:password, gen_salt('bf')))" +
            " on conflict do nothing" +
            " returning user_id")
    @GetGeneratedKeys
    Long addUser(
            @BindBean UserData user);

    @SqlQuery(
            "select user_id from auth.users where" +
                " username = :username and" +
                " password = crypt(:password, password)")
    @RegisterBeanMapper(AuthApproval.class)
    Optional<AuthApproval> authenticateUser(
            @BindBean UserData user);

    @SqlUpdate(
            "insert into auth.tokens" +
                " (user_id, expiry, utility, token)" +
                " values(:userId, :expiry, :utility, crypt(:expiry, gen_salt('bf')))" +
            " on conflict on constraint USER_NAME_UNIQUENESS" +
                " do update set expiry = :expiry, token = crypt(:expiry, gen_salt('bf')) " +
            " returning token")
    @GetGeneratedKeys
    String generateToken(
            @Bind("userId") long userId,
            @Bind("utility") String utility,
            @Bind("expiry") DateTime expiry);

    @SqlQuery(
            "select user_id from auth.tokens" +
            " inner join auth.users using (user_id)" +
            " where" +
                " token = :token")
    @RegisterBeanMapper(AuthApproval.class)
    AuthApproval checkToken(
            @BindBean TokenApproval token);

    @SqlUpdate(
            "insert into auth.access" +
            " (user_id, utility, scope, permission)" +
            " values(" +
                " (select user_id from auth.tokens where token = :token)," +
                " (select utility from auth.tokens where token = :token)," +
                " :scope," +
                " :permission)" +
            " on conflict do nothing")
    boolean addScopePermission(
            @BindBean TokenApproval token,
            @BindBean AccessScope scope);

    @SqlUpdate(
            "delete from auth.access ACC" +
            " where" +
                " :token = (select token from auth.tokens" +
                    " where acc.user_id = user_id and acc.utility = utility) and" +
                " scope = :scope")
    boolean removeScopePermission(
            @BindBean TokenApproval token,
            @BindBean AccessScope scope);

    @SqlQuery(
            "select token, scope, permission from auth.access" +
            " where" +
                " :token = (select token from auth.tokens" +
                    " where ACC.user_id = user_id, acc.utility = utility) and" +
                " scope = :scope and" +
                " permission = :permission")
    @RegisterBeanMapper(AccessManifest.class)
    AccessManifest checkScopePermission(
            @BindBean TokenApproval token,
            @BindBean AccessScope scope);

    @SqlQuery(
            "select scope, permission from auth.access" +
            " inner join auth.tokens using (user_id, utility)" +
            " where" +
                " token = :token")
    @RegisterBeanMapper(AccessScope.class)
    List<AccessScope> getScopes(@Bind("token") String token);

    @SqlQuery(
            "select username from auth.users" +
            " inner join auth.tokens using (user_id)" +
            " where" +
                " token = :token")
    Optional<String> getUsername(@Bind("token") String token);
}
