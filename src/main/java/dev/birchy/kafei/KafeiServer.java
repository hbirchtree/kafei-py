package dev.birchy.kafei;

import com.codahale.metrics.health.HealthCheck;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.eclipse.jetty.servlets.CrossOriginFilter;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;
import org.jdbi.v3.core.Jdbi;

import java.util.EnumSet;
import java.util.List;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import javax.ws.rs.core.UriBuilder;

import dev.birchy.kafei.auth.authenticate.TokenAuthenticator;
import dev.birchy.kafei.auth.authenticate.TokenAuthorizer;
import dev.birchy.kafei.auth.authenticate.TokenUser;
import dev.birchy.kafei.auth.authenticate.UnauthenticatedHandler;
import dev.birchy.kafei.auth.endpoints.UserManage;
import dev.birchy.kafei.crash.InputStreamMapperFactory;
import dev.birchy.kafei.crash.LargeObjectMapper;
import dev.birchy.kafei.crash.endpoints.CrashSubmission;
import dev.birchy.kafei.endpoints.Overview;
import dev.birchy.kafei.github.HookShotBundle;
import dev.birchy.kafei.mqtt.MqttConfig;
import dev.birchy.kafei.mqtt.MqttPublisher;
import dev.birchy.kafei.proxy.ProxyConfig;
import dev.birchy.kafei.proxy.ProxyEntry;
import dev.birchy.kafei.proxy.ProxyServlet;
import dev.birchy.kafei.reports.ReportsBundle;
import dev.birchy.kafei.sapi.SapiAdapter;
import dev.birchy.kafei.sapi.SapiConfig;
import dev.birchy.kafei.shortener.ShortLink;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.auth.AuthDynamicFeature;
import io.dropwizard.auth.AuthValueFactoryProvider;
import io.dropwizard.auth.oauth.OAuthCredentialAuthFilter;
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
    private void addProxies(List<ProxyEntry> proxies, Environment env) {
        for(ProxyEntry proxy : proxies) {
            ProxyConfig config = new ProxyConfig(proxy.getParameterMap(),
                    UriBuilder.fromUri(proxy.getTargetHost() + proxy.getTargetResource()));
            env.servlets()
                    .addServlet(proxy.getName(), new ProxyServlet(config))
                    .addMapping(proxy.getProxyResource() + "/*");

            log.debug("Proxying {} to {}",
                    proxy.getProxyResource(),
                    proxy.getTargetHost() + proxy.getTargetResource());
        }
    }

    private MqttClient createMqttClient(MqttConfig config) throws MqttException {
        MqttClient client = new MqttClient(
                String.format(
                        "%s://%s:%s",
                        config.getProtocol(),
                        config.getHost(),
                        config.getPort()),
                KafeiServer.class.getName(),
                new MemoryPersistence());


        final MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        options.setUserName(config.getUsername());
        options.setPassword(config.getPassword().toCharArray());

        client.connect(options);
        return client;
    }

    private void addCors(Environment environment) {
        final FilterRegistration.Dynamic cors =
                environment.servlets().addFilter("CORS", CrossOriginFilter.class);

        cors.setInitParameter(CrossOriginFilter.ALLOWED_ORIGINS_PARAM, "*");
        cors.setInitParameter(CrossOriginFilter.ALLOWED_METHODS_PARAM, "*");
        cors.setInitParameter(CrossOriginFilter.ALLOW_CREDENTIALS_PARAM, "true");
        cors.setInitParameter(CrossOriginFilter.ALLOWED_HEADERS_PARAM, "Authorization,Accept,Content-Type,Content-Length,Origin");
        cors.setInitParameter(CrossOriginFilter.CHAIN_PREFLIGHT_PARAM, "false");

        cors.addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");

        environment.jersey().register(DisableCORSNonsense.class);
    }

    private void addAuth(Environment environment, Jdbi authDb) {
        environment.jersey().register(new AuthDynamicFeature(
                new OAuthCredentialAuthFilter.Builder<TokenUser>()
                        .setAuthenticator(new TokenAuthenticator(authDb))
                        .setAuthorizer(new TokenAuthorizer())
                        .setUnauthorizedHandler(new UnauthenticatedHandler())
                        .setPrefix("Bearer")
                        .buildAuthFilter()));

        environment.jersey().register(RolesAllowedDynamicFeature.class);
        environment.jersey().register(new AuthValueFactoryProvider.Binder<>(TokenUser.class));
    }

    @Override
    public void initialize(Bootstrap<KafeiConfiguration> bootstrap) {
        super.initialize(bootstrap);

        bootstrap.setConfigurationSourceProvider(new ResourceConfigurationSourceProvider());
        bootstrap.addBundle(new AssetsBundle("/assets", "/", "index.html"));

        bootstrap.addBundle(new ReportsBundle());
        bootstrap.addBundle(new HookShotBundle());

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
    public void run(KafeiConfiguration configuration, Environment environment) throws MqttException {
        final JdbiFactory jdbiFactory = new JdbiFactory();
        final Jdbi reportDb = jdbiFactory.build(
                environment, configuration.getReportDatabase(), "reports");
        final Jdbi githubDb = jdbiFactory.build(
                environment, configuration.getGitHooksDatabase(), "githooks");
        final Jdbi crashDb = jdbiFactory.build(
                environment, configuration.getCrashDatabase(), "crash");
        final Jdbi shortenDb = jdbiFactory.build(
                environment, configuration.getShortDatabase(), "shorten");
        final Jdbi authDb = jdbiFactory.build(
                environment, configuration.getAuthDatabase(), "auth");

        crashDb.registerColumnMapper(new LargeObjectMapper());
        crashDb.registerArgument(new InputStreamMapperFactory(0));

        final MqttClient mqttClient = createMqttClient(configuration.getMqtt());

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(environment.getObjectMapper()).to(ObjectMapper.class);
                bind(reportDb).to(Jdbi.class).named("reportsDb");
                bind(githubDb).to(Jdbi.class).named("githubDb");
                bind(crashDb).to(Jdbi.class).named("crashDb");
                bind(shortenDb).to(Jdbi.class).named("shortenDb");
                bind(authDb).to(Jdbi.class).named("authDb");
                bind(configuration.getSapi()).to(SapiConfig.class);
                bind(mqttClient).to(MqttClient.class);
                bind(MqttPublisher.class).to(MqttPublisher.class);
            }
        });

        addCors(environment);
        addAuth(environment, authDb);
        addProxies(configuration.getProxies(), environment);

        /* Add some dynamic features */
        environment.jersey().register(MultiPartFeature.class);

        /* All Jersey endpoints start at /api */
        environment.jersey().setUrlPattern("/api/*");

        /* Documentation APIs */
        environment.jersey().register(Overview.class);

        /* Add some smaller interfaces */
        environment.jersey().register(CrashSubmission.class);
        environment.jersey().register(UserManage.class);
        environment.jersey().register(FaviconResource.class); /* Favicon resource, exposes favicon.ico */
        environment.jersey().register(SapiAdapter.class);
        environment.jersey().register(ShortLink.class);

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
