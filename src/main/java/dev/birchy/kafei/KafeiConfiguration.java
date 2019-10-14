package dev.birchy.kafei;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import io.dropwizard.Configuration;
import io.dropwizard.db.DataSourceFactory;
import io.dropwizard.flyway.FlywayFactory;
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

    @Valid
    @NonNull
    @Getter
    @Setter
    @JsonProperty
    private DataSourceFactory crashDatabase = new DataSourceFactory();

    @Valid
    @NonNull
    @Getter
    @Setter
    @JsonProperty
    private DataSourceFactory shortDatabase = new DataSourceFactory();

    @Getter
    @Setter
    @JsonProperty
    private CORSData corsData = new CORSData();

    @Valid
    @NonNull
    @Getter
    @Setter
    @JsonProperty
    private FlywayFactory flyway = new FlywayFactory();
}