package dev.birchy.kafei.reports.responses;

import java.io.InputStream;

import lombok.Data;

@Data
public final class ReportData {
    private String format;
    private InputStream rawData;
}
