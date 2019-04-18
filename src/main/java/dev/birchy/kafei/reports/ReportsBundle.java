package dev.birchy.kafei.reports;

import org.glassfish.hk2.utilities.binding.AbstractBinder;

import dev.birchy.kafei.reports.endpoints.ReportSubmit;
import dev.birchy.kafei.reports.endpoints.ReportSubmitLegacy;
import dev.birchy.kafei.reports.endpoints.ReportView;
import dev.birchy.kafei.reports.endpoints.ReportViewLegacy;
import io.dropwizard.Bundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

public final class ReportsBundle implements Bundle {
    @Override
    public void initialize(Bootstrap<?> bootstrap) {
    }

    @Override
    public void run(Environment environment) {
        /* v2 APIs */
        environment.jersey().register(ReportSubmit.class);
        environment.jersey().register(ReportView.class);

        /* v1 APIs */
        environment.jersey().register(ReportSubmitLegacy.class);
        environment.jersey().register(ReportViewLegacy.class);

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(ReportService.class).to(ReportService.class);
            }
        });
    }
}
