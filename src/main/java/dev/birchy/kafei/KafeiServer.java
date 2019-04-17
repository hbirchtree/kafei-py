package dev.birchy.kafei;

import com.codahale.metrics.health.HealthCheck;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.jdbi.v3.core.Jdbi;

import dev.birchy.kafei.dao.ReportDao;
import dev.birchy.kafei.endpoints.ReportSubmitLegacy;
import dev.birchy.kafei.responses.Report;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.configuration.ResourceConfigurationSourceProvider;
import io.dropwizard.db.PooledDataSourceFactory;
import io.dropwizard.jdbi3.JdbiFactory;
import io.dropwizard.migrations.MigrationsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class KafeiServer extends Application<KafeiConfiguration> {
    @Override
    public void initialize(Bootstrap<KafeiConfiguration> bootstrap) {
        super.initialize(bootstrap);

        bootstrap.setConfigurationSourceProvider(new ResourceConfigurationSourceProvider());
        bootstrap.addBundle(new AssetsBundle("/assets", "/", "index.html"));
        bootstrap.addBundle(new MigrationsBundle<KafeiConfiguration>() {
            @Override
            public String getMigrationsFileName() {
                return "migrations/00-base.sql";
            }

            @Override
            public PooledDataSourceFactory getDataSourceFactory(KafeiConfiguration kafeiConfiguration) {
                return kafeiConfiguration.getReportDatabase();
            }
        });
    }

    @Override
    public void run(KafeiConfiguration configuration, Environment environment) {
        final JdbiFactory jdbiFactory = new JdbiFactory();
        final Jdbi reportDb = jdbiFactory.build(
                environment, configuration.getReportDatabase(), "reports");
        final DbConnections connections = new DbConnections();

        connections.setReports(reportDb);

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(environment.getObjectMapper()).to(ObjectMapper.class);
                bind(connections).to(DbConnections.class);
            }
        });

        environment.healthChecks().register("alive", new HealthCheck() {
            @Override
            protected Result check() {
                return Result.healthy();
            }
        });

        environment.jersey().setUrlPattern("/api/*");
        environment.jersey().register(ReportSubmitLegacy.class);

        log.info("{}", reportDb.onDemand(ReportDao.class).addProcessor(new Report.Processor()));
    }

    public static void main(String[] args) throws Exception {
        new KafeiServer().run(args);
    }
}
