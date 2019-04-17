package dev.birchy.kafei;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import io.dropwizard.Configuration;
import io.dropwizard.db.DataSourceFactory;

public final class KafeiConfiguration extends Configuration {
    @Valid
    @NotNull
    private DataSourceFactory reportDb = new DataSourceFactory();

    @JsonProperty("reportDatabase")
    public void setReportDatabase(DataSourceFactory db) {
        reportDb = db;
    }

    @JsonProperty("reportDatabase")
    public DataSourceFactory getReportDatabase() {
        return reportDb;
    }
}