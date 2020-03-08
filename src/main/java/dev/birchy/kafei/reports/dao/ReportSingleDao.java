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

    @SqlQuery("select distinct run_compiler.compiler_name as compiler," +
            "        run_arch.arch_name as architecture," +
            "        run.build_version as version," +
            "        run.build_mode as build_mode," +
            "        run.distro as distro," +
            "        run.distro_version as distro_version," +
            "        run.kernel_version as kernel_version," +
            "        run_compiler.version as compiler_version," +
            "        run.target as target" +
            " from reports.run_compiler" +
            " inner join reports.run_arch using (run_id)" +
            " inner join reports.run using (run_id)" +
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

    @SqlQuery("select dev_version from reports.run_device" +
            " where run_id = :runId")
    @RegisterBeanMapper(Report.DeviceInfo.class)
    Optional<String> getDeviceVersion(@Bind("runId") long runId);

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
