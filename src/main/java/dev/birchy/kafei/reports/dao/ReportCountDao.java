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

    @SqlQuery("select arch_name as architecture, count(run_id) as count from reports.run_arch" +
            " group by arch_name" +
            " order by count desc")
    @RegisterBeanMapper(ArchCount.class)
    List<ArchCount> countArchitectures();

    @SqlQuery("select count(run_id), system, build_version from reports.run" +
            " group by system, build_version" +
            " order by count desc")
    @RegisterBeanMapper(BuildVersionCount.class)
    List<BuildVersionCount> countBuildVersions();

    @SqlQuery("select system, arch_name as architecture, count(arch_name) from reports.run" +
            " join reports.run_arch on run.run_id = run_arch.run_id" +
            " group by arch_name, system")
    @RegisterBeanMapper(ArchSystemCount.class)
    List<ArchSystemCount> countArchitectureSystems();
}
