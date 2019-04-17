package dev.birchy.kafei.dao;

import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import dev.birchy.kafei.responses.Report;

public interface ReportDao {
    @SqlUpdate("insert into processor(manufacturer, model, hyperthreading, fpu, pae, threads, cores) " +
            "values(:manufacturer,:model,:hyperthreading,:fpu,:pae,:threads,:cores)")
    int addProcessor(@BindBean Report.Processor processor);
}
