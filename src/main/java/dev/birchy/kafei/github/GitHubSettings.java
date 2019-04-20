package dev.birchy.kafei.github;

import lombok.Data;

@Data
public final class GitHubSettings {
    private String secret;
    private String secretScheme;
}
