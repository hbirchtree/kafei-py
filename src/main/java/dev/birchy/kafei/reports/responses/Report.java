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
        public enum BuildMode {
            DEBUG,
            RELWITHDEBINFO,
            RELEASE,
        }

        private String version;
        private String compiler;
        private String architecture;
        private BuildMode buildMode;
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

    @JsonIgnore
    private long reportId;

    private ApplicationInfo application;
    private BuildInfo build;
    private RuntimeInfo runtime;
    private DeviceInfo device;
    private Processor processor;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Memory memory;

    private Map<String, byte[]> extra;

    private List<ChromeTracePoint> traceEvents;
}
