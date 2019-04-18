package dev.birchy.kafei.reports.responses.statistics;

import lombok.Data;

@Data
public final class ArchSystemCount {
    private String system;
    private String architecture;
    private long count;
}
