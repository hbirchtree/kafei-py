package dev.birchy.kafei.reports.dao;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.statement.SqlQuery;

import java.util.List;

import dev.birchy.kafei.reports.responses.statistics.ArchCount;
import dev.birchy.kafei.reports.responses.statistics.ArchSystemCount;
import dev.birchy.kafei.reports.responses.statistics.BuildVersionCount;
import dev.birchy.kafei.reports.responses.statistics.SystemCount;

public interface ReportCountDao {
    @SqlQuery("select system as system, count(system) as count from reports.run group by system ")
    @RegisterBeanMapper(SystemCount.class)
    List<SystemCount> countSystems();

    @SqlQuery("select architecture, count(run_id) as count from reports.build" +
            " inner join reports.run_build using (build_id)" +
            " group by architecture" +
            " order by count desc")
    @RegisterBeanMapper(ArchCount.class)
    List<ArchCount> countArchitectures();

    @SqlQuery("select count(run_id), system, build_version from reports.build" +
            " inner join reports.run_build using (build_id)" +
            " inner join reports.run using (run_id)" +
            " group by system, version" +
            " order by count desc")
    @RegisterBeanMapper(BuildVersionCount.class)
    List<BuildVersionCount> countBuildVersions();

    @SqlQuery("select system, architecture, count(architecture) from reports.build" +
            " inner join reports.run_build using (build_id)" +
            " inner join reports.run using (run_id)" +
            " group by architecture, system")
    @RegisterBeanMapper(ArchSystemCount.class)
    List<ArchSystemCount> countArchitectureSystems();
}
