package dev.birchy.kafei.github;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.commons.codec.digest.HmacAlgorithms;
import org.apache.commons.codec.digest.HmacUtils;
import org.glassfish.hk2.utilities.binding.AbstractBinder;

import java.io.File;
import java.io.IOException;

import dev.birchy.kafei.github.endpoints.GithubReleases;
import io.dropwizard.Bundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class HookShotBundle implements Bundle {
    @Data
    private static class GitHubKeys {
        private String secret;
    }

    private String getSecret(
            final ObjectMapper mapper, final String baseName) {
        File secretFile = new File(String.format("%s.json", baseName));

        if(secretFile.exists()) {
            try {
                return mapper.readValue(secretFile, GitHubKeys.class).getSecret();
            } catch (IOException e) {
                throw new RuntimeException("Failed to load GitHub secret from file", e);
            }

        } else {
            GitHubKeys keys = new GitHubKeys();
            keys.setSecret(
                    new HmacUtils(HmacAlgorithms.HMAC_SHA_512, "" + System.nanoTime())
                            .hmacHex("" + System.nanoTime()));

            try {
                mapper.writeValue(secretFile, keys);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store GitHub secret", e);
            }

            return keys.getSecret();
        }
    }

    @Override
    public void initialize(Bootstrap<?> bootstrap) {
    }

    @Override
    public void run(Environment environment) {
        /* GitHub APIs (hooks and etc.) */
        environment.jersey().register(GithubReleases.class);

        /* Set up GitHub secret */
        final GitHubSettings gitSettings = new GitHubSettings();
        gitSettings.setSecretScheme("HmacSHA1");
        gitSettings.setSecret(getSecret(environment.getObjectMapper(), "githubKey"));
        log.info("GitHub secret: {}", gitSettings.getSecret());

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(gitSettings).to(GitHubSettings.class);
            }
        });
    }
}
