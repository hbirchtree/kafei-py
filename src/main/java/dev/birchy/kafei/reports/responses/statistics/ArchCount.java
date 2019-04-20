package dev.birchy.kafei.reports.responses.statistics;

import lombok.Data;

@Data
public final class ArchCount {
    private String architecture;
    private long count;
}
