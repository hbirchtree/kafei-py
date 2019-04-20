package dev.birchy.kafei.reports.responses;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public final class LegacyReport {
    private LegacyReport() {}

    /* Parsing for old, legacy report format */

    private static void parseSubTree(
            ObjectNode obj, ObjectNode outData, String rootKey, Class<?> clazz) {
        final Field[] fields = clazz.getDeclaredFields();

        for(int i=0; i<fields.length; i++) {
            final Field field = fields[i];
            final String key = rootKey + "." + field.getName();

            if(!obj.has(key))
                continue;

            outData.set(field.getName(), obj.get(key));
        }
    }

    private static <T> T parseSubObject(
            ObjectNode source, ObjectMapper mapper, String root, Class<T> clazz)
            throws JsonProcessingException {
        ObjectNode appInfo = mapper.createObjectNode();
        parseSubTree(source, appInfo, root, clazz);
        return mapper.treeToValue(appInfo, clazz);
    }

    public static Report parse(ObjectNode obj, ObjectMapper mapper) throws JsonProcessingException {
        final Report out = new Report();

        out.setExtra(new HashMap<>());
        out.setTraceEvents(new ArrayList<>());

        final JsonNode extras = obj.get("extra");
        if(extras != null)
            extras.fieldNames().forEachRemaining((key) -> {
                out.getExtra().put(key, extras.get(key).asText().getBytes());
            });

        out.setApplication(parseSubObject(obj, mapper, "application", Report.ApplicationInfo.class));
        out.setBuild(parseSubObject(obj, mapper, "build", Report.BuildInfo.class));
        out.setRuntime(parseSubObject(obj, mapper, "runtime", Report.RuntimeInfo.class));
        out.setProcessor(parseSubObject(obj, mapper, "processor", Report.Processor.class));
        out.setMemory(parseSubObject(obj, mapper, "memory", Report.Memory.class));
        out.setDevice(parseSubObject(obj, mapper, "device", Report.DeviceInfo.class));

        /* Exceptional values */

        out.getApplication().setOrganization(obj.get("application.org").asText());
        out.getDevice().setName(obj.get("device").asText());

        JsonNode frequencyNode = obj.get("processor.frequency");

        if(frequencyNode.isArray()) {
            out.getProcessor().setFrequencies(new ArrayList<>());
            for(JsonNode freq : frequencyNode)
                out.getProcessor().getFrequencies().add((float)freq.asDouble());
        } else
            out.getProcessor().setFrequencies(Arrays.asList((float)frequencyNode.asDouble()));

        for(JsonNode trace : obj.get("traceEvents")) {
            out.getTraceEvents().add(mapper.treeToValue(trace, ChromeTracePoint.class));
        }

        return out;
    }
}
