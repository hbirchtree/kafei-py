package dev.birchy.kafei;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import io.dropwizard.Configuration;
import io.dropwizard.db.DataSourceFactory;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

public final class KafeiConfiguration extends Configuration {
    @Valid
    @NonNull
    @Getter
    @Setter
    @JsonProperty
    private DataSourceFactory reportDatabase = new DataSourceFactory();

    @Valid
    @NonNull
    @Getter
    @Setter
    @JsonProperty
    private DataSourceFactory gitHooksDatabase = new DataSourceFactory();
}