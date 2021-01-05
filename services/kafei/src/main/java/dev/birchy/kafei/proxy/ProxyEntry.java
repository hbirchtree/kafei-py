package dev.birchy.kafei.proxy;

import java.util.HashMap;
import java.util.Map;

import lombok.Data;
import lombok.NonNull;

@Data
public final class ProxyEntry {
    @NonNull
    private String name;

    /* Where the proxied request goes */
    @NonNull
    private String targetHost;
    @NonNull
    private String targetResource;

    /* How the request is transformed in the proxy */
    @NonNull
    private String proxyResource;
    private Map<String, String> parameterMap = new HashMap<>();
}
