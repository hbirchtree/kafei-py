package dev.birchy.kafei.auth;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermission {
    String scope();
    String permission();
}
