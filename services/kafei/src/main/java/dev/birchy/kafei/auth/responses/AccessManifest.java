package dev.birchy.kafei.auth.responses;

import lombok.Data;

@Data
public final class AccessManifest {
    private String token;
    private String scope;
    private String permission;
}
