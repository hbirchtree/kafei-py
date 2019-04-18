package dev.birchy.kafei.reports.responses;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.joda.time.DateTime;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Data
public class Report {
    @Data
    public static class ApplicationInfo {
        @JsonIgnore
        private long appId;

        private String name;
        private String organization;
        private int version;
    }

    @Data
    public static class BuildInfo {
        private String version;
        private String compiler;
        private String architecture;
    }

    @Data
    public static class RuntimeInfo {
        @JsonIgnore
        private long runId;

        private DateTime submitTime;
        private String system;
        private String cwd;
        private List<String> arguments;

        @JsonIgnore
        public String getCommandLine() {
            if(arguments != null)
                return arguments.stream().reduce("", (arg1, arg2) -> arg1 + " " + arg2);

            return "";
        }

        @JsonIgnore
        public void setCommandLine(String commandLine) {
            arguments = Arrays.stream(commandLine.split(" "))
                    .filter((arg) -> arg.length() > 0)
                    .collect(Collectors.toList());
        }
    }

    @Data
    public static class DeviceInfo {
        @JsonIgnore
        private long devId;

        private String name;
        private String version;
        private String motherboard;
        private String chassis;

        private float dpi;
        private int type;
        private int platform;
    }

    @Data
    public static class Processor {
        @JsonIgnore
        private long procId;

        private String manufacturer;
        private String model;
        private String firmware;

        private List<Float> frequencies;
        private int cores;
        private int threads;

        private boolean hyperthreading;
        private boolean pae;
        private boolean fpu;
    }

    @Data
    public static class Memory {
        private long bank;
        private Virtual virtual;

        @Data
        public static class Virtual {
            private long total;
            private long available;
        }
    }

    private ApplicationInfo application;
    private BuildInfo build;
    private RuntimeInfo runtime;
    private DeviceInfo device;
    private Processor processor;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Memory memory;

    private Map<String, byte[]> extra;

    private List<ChromeTracePoint> traceEvents;

    /* Parsing for old, legacy format */

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

    public static Report parseLegacyFormat(ObjectNode obj, ObjectMapper mapper) throws JsonProcessingException {
        final Report out = new Report();

        out.setExtra(new HashMap<>());
        out.setTraceEvents(new ArrayList<>());

        final JsonNode extras = obj.get("extra");
        if(extras != null)
            extras.fieldNames().forEachRemaining((key) -> {
                out.getExtra().put(key, extras.get(key).asText().getBytes());
            });

        out.setApplication(parseSubObject(obj, mapper, "application", ApplicationInfo.class));
        out.setBuild(parseSubObject(obj, mapper, "build", BuildInfo.class));
        out.setRuntime(parseSubObject(obj, mapper, "runtime", RuntimeInfo.class));
        out.setProcessor(parseSubObject(obj, mapper, "processor", Processor.class));
        out.setMemory(parseSubObject(obj, mapper, "memory", Memory.class));
        out.setDevice(parseSubObject(obj, mapper, "device", DeviceInfo.class));

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
