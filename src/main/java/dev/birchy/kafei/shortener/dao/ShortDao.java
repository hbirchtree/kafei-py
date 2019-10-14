package dev.birchy.kafei.shortener.dao;

import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import java.util.Optional;

public interface ShortDao {
    @SqlQuery("select url from short.lonk where name=:name")
    Optional<String> getLink(@Bind("name") final String name);

    @SqlUpdate("insert into short.lonk values(:link, :name)")
    void addLink(@Bind("name") final String name, @Bind("link") final String link);
}
