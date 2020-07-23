package dev.birchy.kafei.auth.authenticate;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

import javax.security.auth.Subject;

import dev.birchy.kafei.auth.AccessScope;
import lombok.Data;

@Data
public final class TokenUser implements Principal {
    private String name;
    private List<AccessScope> scopes = new ArrayList<>();

    @Override
    public boolean implies(Subject subject) {
        return false;
    }
}
