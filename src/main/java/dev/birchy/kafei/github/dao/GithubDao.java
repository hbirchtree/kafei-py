package dev.birchy.kafei.github.dao;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.joda.time.DateTime;

import java.util.List;

import dev.birchy.kafei.github.responses.GitRelease;
import dev.birchy.kafei.github.responses.GitUpdate;

public interface GithubDao {
    @SqlQuery("select update_time, request from updates")
    @RegisterBeanMapper(GitUpdate.class)
    List<GitUpdate> getUpdates();

    @SqlQuery("select update_time, request from releases")
    @RegisterBeanMapper(GitRelease.class)
    List<GitRelease> getReleases();

    @SqlUpdate("insert into updates values(:updateTime, :request)")
    void insertUpdate(@BindBean GitUpdate update);

    @SqlUpdate("insert into releases values(:updateTime, :request)")
    void insertRelease(@BindBean GitRelease release);

    @SqlUpdate("delete from updates where update_time < :updateTime")
    void cleanUpdates(@Bind("updateTime") DateTime updateTime);

    @SqlUpdate("delete from releases where update_time < :updateTime")
    void cleanReleases(@Bind("updateTime") DateTime updateTime);
}
