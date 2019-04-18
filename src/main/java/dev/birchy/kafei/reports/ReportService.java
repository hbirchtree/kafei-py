package dev.birchy.kafei.reports;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.eclipse.jetty.util.annotation.Name;
import org.jdbi.v3.core.Jdbi;
import org.joda.time.DateTime;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.inject.Inject;
import javax.inject.Named;

import dev.birchy.kafei.reports.dao.ReportDao;
import dev.birchy.kafei.reports.responses.ExtrasProperty;
import dev.birchy.kafei.reports.responses.Report;
import dev.birchy.kafei.reports.responses.ReportData;
import dev.birchy.kafei.reports.responses.statistics.ArchCount;
import dev.birchy.kafei.reports.responses.statistics.ArchSystemCount;
import dev.birchy.kafei.reports.responses.statistics.BuildVersionCount;
import dev.birchy.kafei.reports.responses.statistics.SystemCount;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class ReportService {
    @Inject
    @Named
    private Jdbi reportsDb;
    @Inject
    private ObjectMapper mapper;

    private static Optional<Long> removeFuckedOptional(Optional<?> opt) {
        if(!opt.isPresent())
            return Optional.empty();

        Object _opt = opt.get();

        if(_opt.getClass().equals(Long.class))
            return (Optional<Long>) opt;

        return (Optional<Long>) _opt;
    }

    public long putReport(final Report newReport) {
        newReport.getRuntime().setSubmitTime(DateTime.now());

        return reportsDb.inTransaction((reportHnd) -> {
            ReportDao reports = reportHnd.attach(ReportDao.class);

            long procId = removeFuckedOptional(reports.addProcessor(newReport.getProcessor()))
                    .orElseGet(() -> reports.getProcessorId(newReport.getProcessor()));
            long appId = removeFuckedOptional(reports.addApplication(newReport.getApplication()))
                    .orElseGet(() -> reports.getApplicationId(newReport.getApplication()));
            long devId = removeFuckedOptional(reports.addDevice(newReport.getDevice()))
                    .orElseGet(() -> reports.getDeviceId(newReport.getDevice()));

            long runId = reports.addRuntime(
                    newReport.getRuntime(), newReport.getBuild(), newReport.getMemory());

            for(String key : newReport.getExtra().keySet())
                reports.addRunExtra(runId, key, newReport.getExtra().get(key));

            reports.addProcessorFirmware(procId, newReport.getProcessor().getFirmware());
            for(float f : newReport.getProcessor().getFrequencies())
                reports.addProcessorFrequency(procId, f);

            reports.addCompiler(newReport.getBuild().getCompiler());
            reports.addArchitecture(newReport.getBuild().getArchitecture());

            reports.relateRuntimeApplication(runId, appId);
            reports.relateRuntimeArchitecture(runId, newReport.getBuild().getArchitecture());
            reports.relateRuntimeCompiler(runId, newReport.getBuild().getCompiler());
            reports.relateRuntimeDevice(runId, devId, newReport.getDevice());
            reports.relateRuntimeProcessor(runId, procId);

            return runId;
        });
    }

    public Optional<ReportData> generateReportData(ObjectNode source, String format) {
        try {
            ReportData raw = new ReportData();

            raw.setFormat(format);
            raw.setRawData(mapper.writeValueAsBytes(source));

            return Optional.of(raw);
        } catch (IOException e) {
            log.warn("Failed to generate raw report from {} format: {}", format, e);
            return Optional.empty();
        }
    }

    public void putRawReport(final long runId, ReportData data) {
        reportsDb.useExtension(ReportDao.class, (reports) -> {
            reports.addRawReport(runId, data);
        });
    }

    private Report mapToReport(ReportDao reports, Report.RuntimeInfo run) {
        Report out = new Report();

        long runId = run.getRunId();

        out.setRuntime(run);

        out.setApplication(reports.getApplication(runId).orElse(null));
        out.setDevice(reports.getDevice(runId).orElse(null));
        out.setProcessor(reports.getProcessor(runId).orElse(null));
        out.setBuild(reports.getBuild(runId).orElse(null));

        out.getProcessor().setFrequencies(reports.getProcessorFrequencies(out.getProcessor()));

        out.getDevice().setVersion(reports.getDeviceVersion(runId).orElse(null));

        out.setExtra(new HashMap<>());
        for(ExtrasProperty prop : reports.getRunExtras(runId))
            out.getExtra().put(prop.getKey(), prop.getValue());

        return out;
    }

    public Optional<Report> getReport(final long runId) {
        return reportsDb.withExtension(
                ReportDao.class,
                (reports) -> reports.getRun(runId)
                        .map((run) -> mapToReport(reports, run)));
    }

    public List<Report> getReports() {
        return reportsDb.withExtension(
                ReportDao.class,
                (reports) -> reports.getRuns()
                        .stream()
                        .map((run) -> mapToReport(reports, run))
                        .collect(Collectors.toList())
        );
    }

    public List<Long> getReportIds() {
        return reportsDb.withExtension(ReportDao.class, (reports) -> reports.getRuns()
                .stream()
                .map(Report.RuntimeInfo::getRunId)
                .collect(Collectors.toList()));
    }

    public Optional<ReportData> getRawReport(long runId) {
        return reportsDb.withExtension(ReportDao.class, (reports) -> reports.getRawReport(runId));
    }

    /* Listings */

    public List<Report.Processor> getProcessors() {
        return reportsDb.withExtension(ReportDao.class, (reports) -> {
            List<Report.Processor> procs = reports.getProcessors();

            for(Report.Processor proc : procs)
                proc.setFrequencies(reports.getProcessorFrequencies(proc));

            return procs;
        });
    }

    public List<Report.DeviceInfo> getDevices() {
        return reportsDb.withExtension(ReportDao.class, ReportDao::getDevices);
    }

    /* Statistics */

    public List<SystemCount> countSystems() {
        return reportsDb.withExtension(ReportDao.class, ReportDao::countSystems);
    }

    public List<ArchCount> countArchitectures() {
        return reportsDb.withExtension(ReportDao.class, ReportDao::countArchitectures);
    }

    public List<BuildVersionCount> countBuildVersions() {
        return reportsDb.withExtension(ReportDao.class, ReportDao::countBuildVersions);
    }

    public List<ArchSystemCount> countArchSystems() {
        return reportsDb.withExtension(ReportDao.class, ReportDao::countArchitectureSystems);
    }
}
