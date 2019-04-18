package dev.birchy.kafei.reports.dao;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.List;
import java.util.Optional;

import dev.birchy.kafei.reports.responses.ExtrasProperty;
import dev.birchy.kafei.reports.responses.Report;
import dev.birchy.kafei.reports.responses.ReportData;
import dev.birchy.kafei.reports.responses.statistics.ArchCount;
import dev.birchy.kafei.reports.responses.statistics.ArchSystemCount;
import dev.birchy.kafei.reports.responses.statistics.BuildVersionCount;
import dev.birchy.kafei.reports.responses.statistics.SystemCount;

public interface ReportDao {
    /*
     *
     * Adding functions
     *
     */
    @SqlUpdate("insert into compiler values(:compiler)" +
            " on conflict do nothing")
    void addCompiler(@Bind("compiler") String compiler);

    @SqlUpdate("insert into architecture values(:arch)" +
            " on conflict do nothing")
    void addArchitecture(@Bind("arch") String architecture);

    @SqlUpdate("insert into application(name, organization, version)" +
            " values(:name, :organization, :version)" +
            " on conflict do nothing")
    @GetGeneratedKeys
    Optional<Long> addApplication(@BindBean Report.ApplicationInfo app);

    @SqlUpdate("insert into run" +
            "(build_version, cwd, memory, system, submit_time, commandline)" +
            " values(:build.version, :run.cwd, :mem.bank, :run.system," +
            "        :run.submitTime, :run.commandLine)")
    @GetGeneratedKeys
    long addRuntime(
            @BindBean("run") Report.RuntimeInfo runtime,
            @BindBean("build") Report.BuildInfo build,
            @BindBean("mem") Report.Memory memory);

    @SqlUpdate("insert into processor" +
            "(manufacturer, model, hyperthreading, fpu, pae, threads, cores)" +
            " values(:manufacturer,:model,:hyperthreading,:fpu,:pae,:threads,:cores)" +
            " on conflict do nothing")
    @GetGeneratedKeys
    Optional<Long> addProcessor(@BindBean Report.Processor processor);

    @SqlUpdate("insert into processor_freq(proc_id, freq)" +
            " values(:procId, :freq)" +
            " on conflict do nothing")
    void addProcessorFrequency(@Bind("procId") long procId, @Bind("freq") float freq);

    @SqlUpdate("insert into processor_fw(proc_id, fw)" +
            " values(:procId, :fw)" +
            "on conflict do nothing")
    void addProcessorFirmware(@Bind("procId") long procId, @Bind("fw") String fw);

    @SqlUpdate("insert into device" +
            "(name, motherboard, chassis, platform, type, dpi)" +
            " values(:name, :motherboard, :chassis, :platform, :type, :dpi)" +
            " on conflict do nothing")
    @GetGeneratedKeys
    Optional<Long> addDevice(@BindBean Report.DeviceInfo device);

    @SqlUpdate("insert into run_report values(:runId, :report.format, :report.rawData)")
    void addRawReport(@Bind("runId") long runId, @BindBean("report") ReportData reportData);

    @SqlUpdate("insert into run_extras(run_id, key, value) values(:runId, :key, :value)")
    void addRunExtra(@Bind("runId") long runId, @Bind("key") String key, @Bind("value") byte[] value);

    /*
     *
     * Relation tables
     *
     */

    @SqlUpdate("insert into run_arch values(:runId, :arch)")
    void relateRuntimeArchitecture(@Bind("runId") long runId, @Bind("arch") String arch);

    @SqlUpdate("insert into run_compiler values(:runId, :compiler)")
    void relateRuntimeCompiler(@Bind("runId") long runId, @Bind("compiler") String compiler);

    @SqlUpdate("insert into run_app values(:runId, :appId)")
    void relateRuntimeApplication(@Bind("runId") long runId, @Bind("appId") long appId);

    @SqlUpdate("insert into run_proc values(:runId, :procId)")
    void relateRuntimeProcessor(@Bind("runId") long runId, @Bind("procId") long procId);

    @SqlUpdate("insert into run_device values(:runId, :dev.version, :devId)")
    void relateRuntimeDevice(
            @Bind("runId") long runId,
            @Bind("devId") long devId,
            @BindBean("dev") Report.DeviceInfo dev);

    /*
     *
     * ID functions for insertion
     *
     */

    @SqlQuery("select proc_id from processor" +
            " where manufacturer = :manufacturer and" +
            " model = :model and" +
            " hyperthreading = :hyperthreading" +
            " and fpu = :fpu" +
            " and pae = :pae" +
            " and threads = :threads" +
            " and cores = :cores")
    long getProcessorId(@BindBean Report.Processor proc);

    @SqlQuery("select app_id from application" +
            " where name = :name and" +
            " organization = :organization" +
            " and version = :version")
    long getApplicationId(@BindBean Report.ApplicationInfo app);

    @SqlQuery("select dev_id from device" +
            " where name = :name" +
            " and motherboard = :motherboard" +
            " and chassis = :chassis" +
            " and type = :type" +
            " and dpi = :dpi")
    long getDeviceId(@BindBean Report.DeviceInfo dev);

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

    @SqlQuery("select distinct run_compiler.compiler_name as compiler," +
            "        run_arch.arch_name as architecture," +
            "        run.build_version as version" +
            " from run_compiler" +
            " inner join run_arch using (run_id)" +
            " inner join run using (run_id)")
    @RegisterBeanMapper(Report.BuildInfo.class)
    List<Report.BuildInfo> getBuilds();

    @SqlQuery("select * from application")
    @RegisterBeanMapper(Report.ApplicationInfo.class)
    List<Report.ApplicationInfo> getApplications();

    @SqlQuery("select freq from processor" +
            " inner join processor_freq using (proc_id)" +
            " where proc_id = :procId")
    List<Float> getProcessorFrequencies(@BindBean Report.Processor processor);

    /*
     *
     * Get functions for getting info about a single run/report
     *
     */
    @SqlQuery("select * from run where run_id = :runId")
    @RegisterBeanMapper(Report.RuntimeInfo.class)
    Optional<Report.RuntimeInfo> getRun(@Bind("runId") long runId);

    @SqlQuery("select distinct run_compiler.compiler_name as compiler," +
            "        run_arch.arch_name as architecture," +
            "        run.build_version as version" +
            " from run_compiler" +
            " inner join run_arch using (run_id)" +
            " inner join run using (run_id)" +
            " where run_id = :runId")
    @RegisterBeanMapper(Report.BuildInfo.class)
    Optional<Report.BuildInfo> getBuild(@Bind("runId") long runId);

    @SqlQuery("select * from run_app" +
            " inner join application using (app_id)" +
            " where run_app.run_id = :runId")
    @RegisterBeanMapper(Report.ApplicationInfo.class)
    Optional<Report.ApplicationInfo> getApplication(@Bind("runId") long runId);

    @SqlQuery("select * from processor" +
            " inner join run_proc using (proc_id)" +
            " where run_proc.run_id = :runId")
    @RegisterBeanMapper(Report.Processor.class)
    Optional<Report.Processor> getProcessor(@Bind("runId") long runId);

    @SqlQuery("select * from device" +
            " inner join run_device using (dev_id)" +
            " where run_device.run_id = :runId")
    @RegisterBeanMapper(Report.DeviceInfo.class)
    Optional<Report.DeviceInfo> getDevice(@Bind("runId") long runId);

    @SqlQuery("select dev_version from run_device" +
            " where run_id = :runId")
    @RegisterBeanMapper(Report.DeviceInfo.class)
    Optional<String> getDeviceVersion(@Bind("runId") long runId);

    @SqlQuery("select key, value from run_extras" +
            " where run_id = :runId")
    @RegisterBeanMapper(ExtrasProperty.class)
    List<ExtrasProperty> getRunExtras(@Bind("runId") long runId);

    @SqlQuery("select report_format as format, report as raw_data from run_report" +
            " where run_id = :runId")
    @RegisterBeanMapper(ReportData.class)
    Optional<ReportData> getRawReport(@Bind("runId") long runId);

    /*
     *
     * Counting operations
     *
     */

    @SqlQuery("select system as system, count(system) as count from run group by system ")
    @RegisterBeanMapper(SystemCount.class)
    List<SystemCount> countSystems();

    @SqlQuery("select arch_name as architecture, count(run_id) as count from run_arch" +
            " group by arch_name" +
            " order by count desc")
    @RegisterBeanMapper(ArchCount.class)
    List<ArchCount> countArchitectures();

    @SqlQuery("select count(run_id), system, build_version from run" +
            " group by system, build_version" +
            " order by count desc")
    @RegisterBeanMapper(BuildVersionCount.class)
    List<BuildVersionCount> countBuildVersions();

    @SqlQuery("select system, arch_name as architecture, count(arch_name) from run" +
            " join run_arch on run.run_id = run_arch.run_id" +
            " group by arch_name, system")
    @RegisterBeanMapper(ArchSystemCount.class)
    List<ArchSystemCount> countArchitectureSystems();
}
