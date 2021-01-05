package dev.birchy.kafei.auth.authenticate;

import org.jdbi.v3.core.Jdbi;

import java.util.List;
import java.util.Optional;

import javax.inject.Inject;
import javax.inject.Named;

import dev.birchy.kafei.auth.AccessScope;
import dev.birchy.kafei.auth.AuthDao;
import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class TokenAuthenticator implements Authenticator<String, TokenUser> {
    public TokenAuthenticator(Jdbi auth) {
        this.authDb = auth;
    }

    private Jdbi authDb;

    @Override
    public Optional<TokenUser> authenticate(String credential) throws AuthenticationException {
        List<AccessScope> scopes = authDb.withExtension(
                AuthDao.class,
                (auth) -> auth.getScopes(credential));

        if(scopes.isEmpty())
            return Optional.empty();

        TokenUser user = new TokenUser();
        user.setName(authDb.withExtension(AuthDao.class, (auth) -> auth.getUsername(credential))
                .orElse("anon"));
        user.setScopes(scopes);

        return Optional.of(user);
    }
}
