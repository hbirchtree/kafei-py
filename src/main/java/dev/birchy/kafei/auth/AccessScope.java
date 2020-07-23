package dev.birchy.kafei.auth;

import javax.validation.Valid;
import javax.ws.rs.WebApplicationException;

import lombok.Data;
import lombok.NonNull;

@Data
public final class AccessScope {
    public final static String PERM_NONE  = "--";
    public final static String PERM_READ  = "r-";
    public final static String PERM_WRITE = "rw";

    public final static String USER_MANAGE         = "user_management";
    public final static String USER_READ_ACCESS    = "user_read_access";
    public final static String DIAGNOSTICS_REPORTS = "diag_reports";
    public final static String DIAGNOSTICS_CRASHES = "diag_crashes";

    public AccessScope(String scope, String perm) {
        this.scope = scope;
        this.permission = perm;
    }
    public AccessScope() {
    }

    public AccessScope noPerm() {
        this.permission = PERM_NONE;
        return this;
    }

    public AccessScope withPerm(String perm) {
        this.permission = perm;
        return this;
    }

    @Valid
    @NonNull
    private String scope;
    @Valid
    @NonNull
    private String permission;

    public void validate() {
        switch(scope) {
            case USER_MANAGE:
            case USER_READ_ACCESS:
            case DIAGNOSTICS_REPORTS:
            case DIAGNOSTICS_CRASHES:
                break;
            default:
                throw new WebApplicationException("Invalid scope");
        }

        switch(permission) {
            case PERM_NONE:
            case PERM_READ:
            case PERM_WRITE:
                break;
            default:
                throw new WebApplicationException("Invalid permission type");
        }
    }
}
