package dev.birchy.kafei;

import com.codahale.metrics.health.HealthCheck;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.eclipse.jetty.servlets.CrossOriginFilter;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.model.Resource;
import org.jdbi.v3.core.Jdbi;

import java.net.URI;
import java.util.EnumSet;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;

import dev.birchy.kafei.crash.endpoints.CrashSubmission;
import dev.birchy.kafei.endpoints.Overview;
import dev.birchy.kafei.endpoints.WebProxy;
import dev.birchy.kafei.github.HookShotBundle;
import dev.birchy.kafei.reports.ReportsBundle;
import dev.birchy.kafei.shortener.ShortLink;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.configuration.ResourceConfigurationSourceProvider;
import io.dropwizard.db.PooledDataSourceFactory;
import io.dropwizard.flyway.FlywayBundle;
import io.dropwizard.flyway.FlywayFactory;
import io.dropwizard.jdbi3.JdbiFactory;
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

        bootstrap.addBundle(new ReportsBundle());
        bootstrap.addBundle(new HookShotBundle());

        bootstrap.addBundle(new BonziBundle("/bonziProxy"));

        bootstrap.addBundle(new FlywayBundle<KafeiConfiguration>() {
            @Override
            public PooledDataSourceFactory getDataSourceFactory(KafeiConfiguration kafeiConfiguration) {
                return kafeiConfiguration.getReportDatabase();
            }

            @Override
            public FlywayFactory getFlywayFactory(KafeiConfiguration config) {
                return config.getFlyway();
            }
        });
    }

    @Override
    public void run(KafeiConfiguration configuration, Environment environment) {
        final JdbiFactory jdbiFactory = new JdbiFactory();
        final Jdbi reportDb = jdbiFactory.build(
                environment, configuration.getReportDatabase(), "reports");
        final Jdbi githubDb = jdbiFactory.build(
                environment, configuration.getGitHooksDatabase(), "githooks");
        final Jdbi crashDb = jdbiFactory.build(
                environment, configuration.getCrashDatabase(), "crash");
        final Jdbi shortenDb = jdbiFactory.build(
                environment, configuration.getShortDatabase(), "shorten");

        /* Documentation APIs */
        environment.jersey().register(Overview.class);

        environment.jersey().setUrlPattern("/api/*");

        environment.jersey().register(MultiPartFeature.class);

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(environment.getObjectMapper()).to(ObjectMapper.class);
                bind(reportDb).to(Jdbi.class).named("reportsDb");
                bind(githubDb).to(Jdbi.class).named("githubDb");
                bind(crashDb).to(Jdbi.class).named("crashDb");
                bind(environment.getObjectMapper()).to(ObjectMapper.class);
                bind(shortenDb).to(Jdbi.class).named("shortenDb");
            }
        });

        environment.healthChecks().register("alive", new HealthCheck() {
            @Override
            protected Result check() {
                return Result.healthy();
            }
        });

        final FilterRegistration.Dynamic cors =
                environment.servlets().addFilter("CORS", CrossOriginFilter.class);

        cors.setInitParameter("allowedOrigins", configuration.getCorsData().getAllowOrigin() != null
                ? configuration.getCorsData().getAllowOrigin()
                : "*");
        cors.setInitParameter("allowedMethods", configuration.getCorsData().getAllowMethods() != null
                ? configuration.getCorsData().getAllowMethods()
                : "GET");

        cors.addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");

        environment.jersey().register(CrashSubmission.class);
        environment.jersey().register(FaviconResource.class);

        environment.jersey().register(ShortLink.class);
    }

    public static void main(String[] args) throws Exception {
        new KafeiServer().run(args);
    }
}
