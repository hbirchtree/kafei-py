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
    @SqlUpdate("insert into reports.compiler (compiler_name, version) values(:compiler, :compilerVersion)" +
            " on conflict do nothing")
    void addCompiler(@BindBean Report.BuildInfo compiler);

    @SqlUpdate("insert into reports.architecture values(:arch)" +
            " on conflict do nothing")
    void addArchitecture(@Bind("arch") String architecture);

    @SqlUpdate("insert into reports.application(name, organization, version)" +
            " values(:name, :organization, :version)" +
            " on conflict do nothing")
    @GetGeneratedKeys
    Optional<Long> addApplication(@BindBean Report.ApplicationInfo app);

    @SqlUpdate("insert into reports.build" +
            " (version, compiler, compiler_version, architecture, build_mode, libc_runtime, libc_version," +
            "   target," +
            "   android_target, android_sdk," +
            "   mac_target, mac_min_target," +
            "   ios_target, ios_min_target," +
            "   windows_target, windows_wdk, windows_server" +
            " )" +
            " values(" +
            "   :version, :compiler, :compilerVersion, :architecture, :buildMode, :libcRuntime, :libcVersion," +
            "   :target," +
            "   :androidTarget, :androidSdkTarget," +
            "   :macTarget, :macMinTarget," +
            "   :iosTarget, :iosMinTarget," +
            "   :windowsTarget, :windowsWdk, :windowsServer" +
            " )" +
            " on conflict do nothing" +
            " returning build_id")
    @GetGeneratedKeys
    Optional<Long> addBuild(@BindBean Report.BuildInfo build);

    @SqlUpdate("insert into reports.run" +
            "(cwd, memory, system, submit_time, commandline, " +
            "    architecture, kernel, distro, distro_version, kernel_version)" +
            " values(:run.cwd, :mem.bank, :run.system," +
            "        :run.submitTime, :run.commandLine," +
            "        :run.architecture, :run.kernel, :run.distro, :run.distroVersion," +
            "        :run.kernelVersion)")
    @GetGeneratedKeys
    long addRuntime(
            @BindBean("run") Report.RuntimeInfo runtime,
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
            "(name, motherboard, chassis, platform, type, dpi, motherboardVersion)" +
            " values(:name, :motherboard, :chassis, :platform, :type, :dpi, :motherboardVersion)" +
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

    @SqlUpdate("insert into reports.run_app values(:runId, :appId)")
    void relateRuntimeApplication(@Bind("runId") long runId, @Bind("appId") long appId);

    @SqlUpdate("insert into reports.run_proc values(:runId, :procId)")
    void relateRuntimeProcessor(@Bind("runId") long runId, @Bind("procId") long procId);

    @SqlUpdate("insert into reports.run_device values(:runId, :devId)")
    void relateRuntimeDevice(
            @Bind("runId") long runId,
            @Bind("devId") long devId);

    @SqlUpdate("insert into reports.run_build values(:runId, :buildId)")
    void relateRuntimeBuild(
            @Bind("runId") long runId,
            @Bind("buildId") long buildId);

    @SqlUpdate("delete from reports.run where run_id = :runId")
    int deleteReport(@Bind("runId") long runId);

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

    @SqlQuery("select build_id from reports.build" +
            " where version = :version and" +
            " compiler = :compiler and" +
            " compiler_version = :compilerVersion and" +
            " architecture = :architecture and" +
            " build_mode = :buildMode and" +
            " libc_runtime = :libcRuntime and" +
            " libc_version = :libcVersion and" +
            " target = :target")
    long getBuildId(@BindBean Report.BuildInfo build);
}
