package dev.birchy.kafei.mqtt;

import lombok.Data;

@Data
public final class MqttConfig {
    private String protocol = "ssl";
    private String host;
    private Short port;
    private String username;
    private String password;
}
