package dev.birchy.kafei.auth.authenticate;

import io.dropwizard.auth.Authorizer;
import lombok.extern.slf4j.Slf4j;

import static dev.birchy.kafei.auth.AccessScope.PERM_NONE;
import static dev.birchy.kafei.auth.AccessScope.PERM_READ;
import static dev.birchy.kafei.auth.AccessScope.PERM_WRITE;

@Slf4j
public final class TokenAuthorizer implements Authorizer<TokenUser> {
    private boolean matchPermission(String present, String required) {
        /* Doesn't require any permissions */
        if(required.equals(PERM_NONE))
            return true;

        /* Exactly matched permission */
        if(present.equals(required))
            return true;

        /* Present permission is over-qualified */
        return present.equals(PERM_WRITE) && required.equals(PERM_READ);
    }

    @Override
    public boolean authorize(TokenUser principal, String role) {
        String[] tokens = role.split("\\+");
        String reqScope = tokens[0];
        String reqPerms = tokens.length == 2 ? tokens[1] : "r-";

        long matches = principal.getScopes()
                .stream()
                .filter((scope) -> {
                    if(!scope.getScope().equals(reqScope))
                        return false;

                    return matchPermission(scope.getPermission(), reqPerms);
                }).count();

        return matches >= 1;
    }
}
