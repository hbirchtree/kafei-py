package dev.birchy.kafei.reports.responses;

import lombok.Data;

@Data
public final class ReportData {
    private String format;
    private byte[] rawData;
}
