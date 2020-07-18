package dev.birchy.kafei;

import lombok.Data;

@Data
public final class MQTTConfig {
    private String host;
    private short port;
    private String username;
    private String password;
}
