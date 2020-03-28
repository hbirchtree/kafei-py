package dev.birchy.kafei.reports.responses;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChromeTracePoint {
    private long ts;
}
