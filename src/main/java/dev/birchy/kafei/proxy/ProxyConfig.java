package dev.birchy.kafei.proxy;

import java.util.Map;

import javax.ws.rs.core.UriBuilder;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public final class ProxyConfig {
    /**
     * A mapping of query parameters to the target URL
     */
    private Map<String, String> parameters;
    /**
     * Base for target URL
     */
    private UriBuilder uriBase;
}
