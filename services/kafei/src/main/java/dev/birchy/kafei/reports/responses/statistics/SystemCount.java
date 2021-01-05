package dev.birchy.kafei.reports.responses.statistics;

import lombok.Data;

@Data
public final class SystemCount {
    private String system;
    private long count;
}
