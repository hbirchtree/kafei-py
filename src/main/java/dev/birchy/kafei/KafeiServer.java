package dev.birchy.kafei;

import com.codahale.metrics.health.HealthCheck;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.jdbi.v3.core.Jdbi;

import dev.birchy.kafei.endpoints.Overview;
import dev.birchy.kafei.github.HookShotBundle;
import dev.birchy.kafei.github.dao.GithubDao;
import dev.birchy.kafei.reports.ReportsBundle;
import dev.birchy.kafei.reports.dao.ReportDao;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.configuration.ResourceConfigurationSourceProvider;
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
    }

    @Override
    public void run(KafeiConfiguration configuration, Environment environment) {
        final JdbiFactory jdbiFactory = new JdbiFactory();
        final Jdbi reportDb = jdbiFactory.build(
                environment, configuration.getReportDatabase(), "reports");
        final Jdbi githubDb = jdbiFactory.build(
                environment, configuration.getGitHooksDatabase(), "githooks");

        MigrationBundle.loadMigrations(reportDb, "migrations/00-base.sql", (h) ->
                h.attach(ReportDao.class).getRuns());
        MigrationBundle.loadMigrations(githubDb, "migrations.githooks/00-base.sql", (h) ->
                h.attach(GithubDao.class).getReleases());

        /* Documentation APIs */
        environment.jersey().register(Overview.class);

        environment.jersey().setUrlPattern("/api/*");

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(environment.getObjectMapper()).to(ObjectMapper.class);
                bind(reportDb).to(Jdbi.class).named("reportsDb");
                bind(githubDb).to(Jdbi.class).named("githubDb");
            }
        });

        environment.healthChecks().register("alive", new HealthCheck() {
            @Override
            protected Result check() {
                return Result.healthy();
            }
        });
    }

    public static void main(String[] args) throws Exception {
        new KafeiServer().run(args);
    }
}

