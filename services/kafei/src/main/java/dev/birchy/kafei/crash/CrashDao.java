package dev.birchy.kafei.crash;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.joda.time.DateTime;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

import dev.birchy.kafei.crash.CrashSummary;

public interface CrashDao {

    @SqlQuery("select crash_id, submit_time, exit_code from crash.outputs")
    @RegisterBeanMapper(CrashSummary.class)
    List<CrashSummary> getCrashes();

    @SqlQuery("select crash_id, submit_time from crash.outputs where crash_id = :crashId")
    @RegisterBeanMapper(CrashSummary.class)
    Optional<CrashSummary> getCrash(@Bind("crashId") long crashId);

    @SqlQuery("select stdout from crash.outputs where crash_id = :crashId")
    InputStream getCrashOut(@Bind("crashId") long crashId);

    @SqlQuery("select stderr from crash.outputs where crash_id = :crashId")
    InputStream getCrashErr(@Bind("crashId") long crashId);

    @SqlQuery("select profile_file from crash.outputs where crash_id = :crashId")
    InputStream getCrashProfile(@Bind("crashId") long crashId);

    @SqlQuery("select machine_info from crash.outputs where crash_id = :crashId")
    InputStream getCrashMachine(@Bind("crashId") long crashId);

    @SqlQuery("select stacktrace from crash.outputs where crash_id = :crashId")
    InputStream getCrashStacktrace(@Bind("crashId") long crashId);

    @SqlUpdate("insert into crash.outputs" +
            " (submit_time, stdout, stderr, profile_file, machine_info, stacktrace, exit_code)" +
            " values(:submitTime, :stdout, :stderr, :profile, :machineInfo, :stacktrace, :exitCode)")
    @GetGeneratedKeys
    long addCrash(
            @Bind("submitTime") DateTime submitTime,
            @Bind("stdout") InputStream stdOut,
            @Bind("stderr") InputStream stdErr,
            @Bind("profile") InputStream profile,
            @Bind("machineInfo") InputStream machineInfo,
            @Bind("stacktrace") InputStream stacktrace,
            @Bind("exitCode") int exitCode);

    @SqlUpdate("delete from crash.outputs where crash_id = :crashId")
    int deleteCrash(@Bind("crashId") long crashId);
}
