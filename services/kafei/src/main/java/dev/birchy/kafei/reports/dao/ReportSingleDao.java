package dev.birchy.kafei.reports.dao;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.SqlQuery;

import java.util.List;
import java.util.Optional;

import dev.birchy.kafei.reports.responses.ExtrasProperty;
import dev.birchy.kafei.reports.responses.Report;
import dev.birchy.kafei.reports.responses.ReportData;

public interface ReportSingleDao {
    /*
     *
     * Get functions for getting info about a single run/report
     *
     */
    @SqlQuery("select * from reports.run where run_id = :runId")
    @RegisterBeanMapper(Report.RuntimeInfo.class)
    Optional<Report.RuntimeInfo> getRun(@Bind("runId") long runId);

    @SqlQuery("select distinct " +
            "       version," +
            "       compiler," +
            "       compiler_version," +
            "       architecture," +
            "       build_mode," +
            "       libc_runtime," +
            "       libc_version," +
            "       target," +
            "       android_target," +
            "       android_sdk," +
            "       mac_target," +
            "       mac_min_target," +
            "       ios_target," +
            "       ios_min_target," +
            "       windows_target," +
            "       windows_wdk," +
            "       windows_server" +
            " from reports.build" +
            " inner join reports.run_build using (build_id)" +
            " where run_id = :runId")
    @RegisterBeanMapper(Report.BuildInfo.class)
    Optional<Report.BuildInfo> getBuild(@Bind("runId") long runId);

    @SqlQuery("select * from reports.run_app" +
            " inner join reports.application using (app_id)" +
            " where run_app.run_id = :runId")
    @RegisterBeanMapper(Report.ApplicationInfo.class)
    Optional<Report.ApplicationInfo> getApplication(@Bind("runId") long runId);

    @SqlQuery("select * from reports.processor" +
            " inner join reports.run_proc using (proc_id)" +
            " where run_proc.run_id = :runId")
    @RegisterBeanMapper(Report.Processor.class)
    Optional<Report.Processor> getProcessor(@Bind("runId") long runId);

    @SqlQuery("select * from reports.device" +
            " inner join reports.run_device using (dev_id)" +
            " where run_device.run_id = :runId")
    @RegisterBeanMapper(Report.DeviceInfo.class)
    Optional<Report.DeviceInfo> getDevice(@Bind("runId") long runId);

    @SqlQuery("select key, value from reports.run_extras" +
            " where run_id = :runId")
    @RegisterBeanMapper(ExtrasProperty.class)
    List<ExtrasProperty> getRunExtras(@Bind("runId") long runId);

    @SqlQuery("select report_format as format, report as raw_data from reports.run_report" +
            " where run_id = :runId")
    @RegisterBeanMapper(ReportData.class)
    Optional<ReportData> getRawReport(@Bind("runId") long runId);

    @SqlQuery("select report_format from reports.run_report where run_id = :runId")
    Optional<String> getRawReportFormat(@Bind("runId") long runId);
}
