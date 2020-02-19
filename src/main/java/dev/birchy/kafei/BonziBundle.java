package dev.birchy.kafei;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.core.UriBuilder;

import dev.birchy.kafei.proxy.ProxyConfig;
import dev.birchy.kafei.proxy.ProxyServlet;
import io.dropwizard.Bundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

public final class BonziBundle implements Bundle {
    private String path;
    private String bonziEndpoint;

    public BonziBundle(final String path) {
        this.path = path;
        this.bonziEndpoint = "";
    }

    @Override
    public void initialize(Bootstrap<?> bootstrap) {
    }

    @Override
    public void run(Environment environment) {
        Map<String, String> parameters = new HashMap<>();
        ProxyConfig config = new ProxyConfig(parameters, UriBuilder.fromUri(
                bonziEndpoint +
                        "/SAPI4.wav?voice=Bonzi&pitch=150&text={say}"));

        parameters.put("say", "text");

        environment.servlets()
                .addServlet("bonzi", new ProxyServlet(config))
                .addMapping(path + "/*");
    }
}
