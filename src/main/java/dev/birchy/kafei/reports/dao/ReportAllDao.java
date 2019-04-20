package dev.birchy.kafei.reports.dao;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlQuery;

import java.util.List;

import dev.birchy.kafei.reports.responses.Report;

public interface ReportAllDao {
    String BUILD_QUERY =
            "        run_compiler.compiler_name as compiler," +
            "        run_arch.arch_name as architecture," +
            "        run.build_version as version," +
            "        run.build_mode as buildMode" +
            " from run_compiler" +
            " inner join run_arch using (run_id)" +
            " inner join run using (run_id)";

    /*
     *
     * Get functions for getting *all* objects
     *
     */

    @SqlQuery("select compiler_name from compiler")
    List<String> getCompilers();

    @SqlQuery("select arch_name from architecture")
    List<String> getArchitectures();

    @SqlQuery("select * from run")
    @RegisterBeanMapper(Report.RuntimeInfo.class)
    List<Report.RuntimeInfo> getRuns();

    @SqlQuery("select * from processor")
    @RegisterBeanMapper(Report.Processor.class)
    List<Report.Processor> getProcessors();

    @SqlQuery("select * from device")
    @RegisterBeanMapper(Report.DeviceInfo.class)
    List<Report.DeviceInfo> getDevices();

    @SqlQuery("select distinct " + BUILD_QUERY)
    @RegisterBeanMapper(Report.BuildInfo.class)
    List<Report.BuildInfo> getBuilds();

    @SqlQuery( "select" + BUILD_QUERY +
            " inner join run_app using (run_id)" +
            " where app_id = :appId")
    @RegisterBeanMapper(Report.BuildInfo.class)
    List<Report.BuildInfo> getAppBuilds(@Bind("appId") long appId);

    @SqlQuery("select * from application")
    @RegisterBeanMapper(Report.ApplicationInfo.class)
    List<Report.ApplicationInfo> getApplications();

    @SqlQuery("select freq from processor" +
            " inner join processor_freq using (proc_id)" +
            " where proc_id = :procId")
    List<Float> getProcessorFrequencies(@BindBean Report.Processor processor);
}
