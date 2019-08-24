package dev.birchy.kafei.reports.dao;

import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.Optional;

import dev.birchy.kafei.reports.responses.Report;
import dev.birchy.kafei.reports.responses.ReportData;

public interface ReportDao {
    /*
     *
     * Adding functions
     *
     */
    @SqlUpdate("insert into reports.compiler values(:compiler)" +
            " on conflict do nothing")
    void addCompiler(@Bind("compiler") String compiler);

    @SqlUpdate("insert into reports.architecture values(:arch)" +
            " on conflict do nothing")
    void addArchitecture(@Bind("arch") String architecture);

    @SqlUpdate("insert into reports.application(name, organization, version)" +
            " values(:name, :organization, :version)" +
            " on conflict do nothing")
    @GetGeneratedKeys
    Optional<Long> addApplication(@BindBean Report.ApplicationInfo app);

    @SqlUpdate("insert into reports.run" +
            "(build_version, cwd, memory, system, submit_time, commandline, build_mode," +
            "    architecture, kernel)" +
            " values(:build.version, :run.cwd, :mem.bank, :run.system," +
            "        :run.submitTime, :run.commandLine, :build.buildMode," +
            "        :run.architecture, :run.kernel)")
    @GetGeneratedKeys
    long addRuntime(
            @BindBean("run") Report.RuntimeInfo runtime,
            @BindBean("build") Report.BuildInfo build,
            @BindBean("mem") Report.Memory memory);

    @SqlUpdate("insert into reports.processor" +
            "(manufacturer, model, hyperthreading, fpu, pae, threads, cores)" +
            " values(:manufacturer,:model,:hyperthreading,:fpu,:pae,:threads,:cores)" +
            " on conflict do nothing")
    @GetGeneratedKeys
    Optional<Long> addProcessor(@BindBean Report.Processor processor);

    @SqlUpdate("insert into reports.processor_freq(proc_id, freq)" +
            " values(:procId, :freq)" +
            " on conflict do nothing")
    void addProcessorFrequency(@Bind("procId") long procId, @Bind("freq") float freq);

    @SqlUpdate("insert into reports.processor_fw(proc_id, fw)" +
            " values(:procId, :fw)" +
            "on conflict do nothing")
    void addProcessorFirmware(@Bind("procId") long procId, @Bind("fw") String fw);

    @SqlUpdate("insert into reports.device" +
            "(name, motherboard, chassis, platform, type, dpi)" +
            " values(:name, :motherboard, :chassis, :platform, :type, :dpi)" +
            " on conflict do nothing")
    @GetGeneratedKeys
    Optional<Long> addDevice(@BindBean Report.DeviceInfo device);

    @SqlUpdate("insert into reports.run_report values(:runId, :report.format, :report.rawData)")
    void addRawReport(@Bind("runId") long runId, @BindBean("report") ReportData reportData);

    @SqlUpdate("insert into reports.run_extras(run_id, key, value) values(:runId, :key, :value)")
    void addRunExtra(@Bind("runId") long runId, @Bind("key") String key, @Bind("value") String value);

    /*
     *
     * Relation tables
     *
     */

    @SqlUpdate("insert into reports.run_arch values(:runId, :arch)")
    void relateRuntimeArchitecture(@Bind("runId") long runId, @Bind("arch") String arch);

    @SqlUpdate("insert into reports.run_compiler values(:runId, :compiler)")
    void relateRuntimeCompiler(@Bind("runId") long runId, @Bind("compiler") String compiler);

    @SqlUpdate("insert into reports.run_app values(:runId, :appId)")
    void relateRuntimeApplication(@Bind("runId") long runId, @Bind("appId") long appId);

    @SqlUpdate("insert into reports.run_proc values(:runId, :procId)")
    void relateRuntimeProcessor(@Bind("runId") long runId, @Bind("procId") long procId);

    @SqlUpdate("insert into reports.run_device values(:runId, :dev.version, :devId)")
    void relateRuntimeDevice(
            @Bind("runId") long runId,
            @Bind("devId") long devId,
            @BindBean("dev") Report.DeviceInfo dev);

    /*
     *
     * ID functions for insertion
     *
     */

    @SqlQuery("select proc_id from reports.processor" +
            " where manufacturer = :manufacturer and" +
            " model = :model and" +
            " hyperthreading = :hyperthreading" +
            " and fpu = :fpu" +
            " and pae = :pae" +
            " and threads = :threads" +
            " and cores = :cores")
    long getProcessorId(@BindBean Report.Processor proc);

    @SqlQuery("select app_id from reports.application" +
            " where name = :name and" +
            " organization = :organization" +
            " and version = :version")
    long getApplicationId(@BindBean Report.ApplicationInfo app);

    @SqlQuery("select dev_id from reports.device" +
            " where name = :name" +
            " and motherboard = :motherboard" +
            " and chassis = :chassis" +
            " and type = :type" +
            " and dpi = :dpi")
    long getDeviceId(@BindBean Report.DeviceInfo dev);
}
