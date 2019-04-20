package dev.birchy.kafei;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface RespondsWith {
    Class<?> value();
}
