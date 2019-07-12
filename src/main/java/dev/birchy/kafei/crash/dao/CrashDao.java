package dev.birchy.kafei.crash.dao;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.joda.time.DateTime;

import java.util.List;
import java.util.Optional;

import dev.birchy.kafei.crash.CrashSummary;

public interface CrashDao {

    @SqlQuery("select crash_id, submit_time from crash.outputs")
    @RegisterBeanMapper(CrashSummary.class)
    List<CrashSummary> getCrashes();

    @SqlQuery("select crash_id, submit_time from crash.outputs where crash_id = :crashId")
    @RegisterBeanMapper(CrashSummary.class)
    Optional<CrashSummary> getCrash(@Bind("crashId") long crashId);

    @SqlQuery("select stdout from crash.outputs where crash_id = :crashId")
    Optional<byte[]> getCrashOut(@Bind("crashId") long crashId);

    @SqlQuery("select stderr from crash.outputs where crash_id = :crashId")
    Optional<byte[]> getCrashErr(@Bind("crashId") long crashId);

    @SqlQuery("select profile_file from crash.outputs where crash_id = :crashId")
    Optional<byte[]> getCrashProfile(@Bind("crashId") long crashId);

    @SqlUpdate("insert into crash.outputs" +
            " (submit_time, stdout, stderr, profile_file)" +
            " values(:submitTime, :stdout, :stderr, :profile)")
    @GetGeneratedKeys
    long addCrash(
            @Bind("submitTime")DateTime submitTime,
            @Bind("stdout") byte[] stdOut,
            @Bind("stderr") byte[] stdErr,
            @Bind("profile") byte[] profile);
}
