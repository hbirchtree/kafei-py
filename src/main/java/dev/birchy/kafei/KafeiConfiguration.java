package dev.birchy.kafei;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;

import dev.birchy.kafei.mqtt.MqttConfig;
import dev.birchy.kafei.proxy.ProxyEntry;
import dev.birchy.kafei.sapi.SapiConfig;
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

    @Valid
    @NonNull
    @Getter
    @Setter
    @JsonProperty
    private DataSourceFactory authDatabase = new DataSourceFactory();

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

    @Valid
    @NonNull
    @Getter
    @Setter
    @JsonProperty
    private List<ProxyEntry> proxies = new ArrayList<>();

    @Valid
    @NonNull
    @Getter
    @Setter
    @JsonProperty
    private SapiConfig sapi = new SapiConfig();

    @Valid
    @NonNull
    @Getter
    @Setter
    @JsonProperty
    private MqttConfig mqtt = new MqttConfig();
}
