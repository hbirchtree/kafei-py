package dev.birchy.kafei.reports.responses.statistics;

import lombok.Data;

@Data
public final class BuildVersionCount {
    private String system;
    private String buildVersion;
    private long count;
}
