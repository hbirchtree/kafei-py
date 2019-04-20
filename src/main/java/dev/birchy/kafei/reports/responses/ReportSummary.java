package dev.birchy.kafei.reports.responses;

import org.joda.time.DateTime;

import lombok.Data;

@Data
public final class ReportSummary {
    public ReportSummary(Report source) {
        setReportId(source.getReportId());
        setBuildVersion(source.getBuild().getVersion());
        setSystem(source.getDevice().getName());
        setSubmitTime(new DateTime(source.getRuntime().getSubmitTime()));
    }

    private long reportId;
    private DateTime submitTime;
    private String system;
    private String buildVersion;
}
