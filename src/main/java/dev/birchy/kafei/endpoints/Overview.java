package dev.birchy.kafei.endpoints;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nonnull;
import javax.inject.Inject;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import dev.birchy.kafei.RespondsWith;
import dev.birchy.kafei.github.endpoints.GithubReleases;
import dev.birchy.kafei.reports.endpoints.ReportSubmit;
import dev.birchy.kafei.reports.endpoints.ReportSubmitLegacy;
import dev.birchy.kafei.reports.endpoints.ReportView;
import dev.birchy.kafei.reports.endpoints.ReportViewLegacy;
import dev.birchy.kafei.responses.Result;
import dev.birchy.kafei.responses.ShortLink;
import lombok.AllArgsConstructor;
import lombok.Data;

@Path("/")
@Produces(MediaType.APPLICATION_JSON)
public class Overview {
    @Inject
    private ObjectMapper mapper;

    private List<Class<?>> detectedReturnTypes = new ArrayList<>();

    private ObjectWriter prettyPrinter() {
        return mapper.writerWithDefaultPrettyPrinter();
    }

    private void expandReturnTypes(@Nonnull Class<?> clazz) {
        if(clazz.isPrimitive() || clazz.isInterface())
            return;

        if(!clazz.getCanonicalName().startsWith("dev.birchy"))
            return;

        detectedReturnTypes.add(clazz);
        for(Field f : clazz.getDeclaredFields()) {
            expandReturnTypes(f.getType());
        }
    }

    private List<ShortLink> getLinks(Class<?> clazz) {
        Method[] methods = clazz.getMethods();
        List<ShortLink> out = new ArrayList<>();

        for (Method meth : methods) {
            String requestMethod = null;

            if (meth.getAnnotation(GET.class) != null)
                requestMethod = "GET";
            else if (meth.getAnnotation(POST.class) != null)
                requestMethod = "POST";
            else if (meth.getAnnotation(DELETE.class) != null)
                requestMethod = "DELETE";

            if (requestMethod == null)
                continue;

            RespondsWith responseType = meth.getAnnotation(RespondsWith.class);
            Class<?> returnType = responseType != null ? responseType.value() : null;

            if(returnType != null)
                expandReturnTypes(returnType);

            out.add(ShortLink
                    .fromResource(clazz)
                    .path(meth)
                    .returns(returnType)
                    .requestMethod(requestMethod)
                    .build());
        }

        return out;
    }

    @Data
    @AllArgsConstructor
    private static class OverviewListing {
        private int status;
        private String message;

        private List<ShortLink> links;
        private Map<String, ObjectNode> types;
    }

    @GET
    public Response getDocs() throws IOException {

        List<ShortLink> overview = new ArrayList<>();

        overview.addAll(getLinks(ReportSubmit.class));
        overview.addAll(getLinks(ReportView.class));

        overview.addAll(getLinks(ReportSubmitLegacy.class));
        overview.addAll(getLinks(ReportViewLegacy.class));

        overview.addAll(getLinks(GithubReleases.class));

        Map<String, ObjectNode> returnTypes = new HashMap<>();
        detectedReturnTypes.stream().distinct().forEach((type) -> {
            ObjectNode obj = mapper.createObjectNode();

            for(Field f : type.getDeclaredFields())
                obj.put(f.getName(), f.getType().getSimpleName());

            returnTypes.put(type.getSimpleName(), obj);
        });

        return Response
                .ok(prettyPrinter().writeValueAsString(
                        new OverviewListing(
                                0,
                                Result.MESSAGE_OK,
                                overview,
                                returnTypes)))
                .build();
    }
}
