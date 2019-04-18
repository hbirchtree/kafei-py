package dev.birchy.kafei.responses;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

import javax.ws.rs.Path;
import javax.ws.rs.core.Link;
import javax.ws.rs.core.Response;

import lombok.Data;

@Data
public final class ShortLink {
    private String uri;
    private String method = "GET";

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<ShortLink> links;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String returnType;

    public static Builder fromResource(Class<?> clazz) {
        Builder b = new Builder();
        b.baseUri = Link.fromResource(clazz).build().getUri();
        b.resource = clazz;
        return b;
    }

    public static class Builder {
        private URI baseUri;
        private String method;
        private String returnType;
        private List<ShortLink> links = null;
        private Class<?> resource;

        public Builder method(String method) {
            Link methodPath = Link.fromMethod(resource, method).build();
            baseUri = URI.create(baseUri.getRawPath() + "/" + methodPath.getUri()).normalize();

            return this;
        }

        public Builder path(Method endpointMethod) {
            Path pathAnno = endpointMethod.getAnnotation(Path.class);

            baseUri = URI.create(
                    baseUri.getRawPath() + ((pathAnno != null)
                            ? "/" + pathAnno.value().replaceAll("[{}]", "_")
                            : ""))
                    .normalize();

            return this;
        }

        public Builder path(String path) {
            baseUri = URI.create(baseUri.getRawPath() + "/" + path).normalize();

            return this;
        }

        public Builder requestMethod(String method) {
            this.method = method;

            return this;
        }

        public Builder returns(Class<?> clazz) {
            if(clazz == null)
                return this;

            this.returnType = clazz.getSimpleName();

            return this;
        }

        public Builder withLink(ShortLink link) {
            if(links == null)
                links = new ArrayList<>();

            links.add(link);

            return this;
        }

        public ShortLink build() {
            ShortLink out = new ShortLink();

            out.setUri(baseUri.getRawPath());
            out.setMethod(method);
            out.setLinks(links);
            out.setReturnType(returnType);

            return out;
        }
    }
}
