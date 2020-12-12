package dev.birchy.kafei.reports;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.jdbi.v3.core.Jdbi;
import org.joda.time.DateTime;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringBufferInputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.ClientErrorException;
import javax.ws.rs.core.Response;

import dev.birchy.kafei.reports.dao.ReportAllDao;
import dev.birchy.kafei.reports.dao.ReportCountDao;
import dev.birchy.kafei.reports.dao.ReportDao;
import dev.birchy.kafei.reports.dao.ReportSingleDao;
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

    private static void requireNonNull(Object o, String name) {
        if(Objects.isNull(o))
            throw new ClientErrorException(
                    String.format("Field %s not specified", name),
                    Response.Status.BAD_REQUEST);
    }

    private static void sanityCheck(final Report report) {
            requireNonNull(report, "object");

            requireNonNull(report.getApplication(), "application");
            requireNonNull(report.getBuild(), "build");
            requireNonNull(report.getDevice(), "device");
            requireNonNull(report.getExtra(), "extra");
            requireNonNull(report.getMemory(), "memory");
            requireNonNull(report.getProcessor(), "processor");
            requireNonNull(report.getRuntime(), "runtime");
            requireNonNull(report.getTraceEvents(), "traceEvents");
    }

    private static Optional<Long> removeFuckedOptional(Optional<?> opt) {
        if(!opt.isPresent())
            return Optional.empty();

        Object _opt = opt.get();

        if(_opt.getClass().equals(Long.class))
            return (Optional<Long>) opt;

        return (Optional<Long>) _opt;
    }

    public long putReport(final Report newReport) {
        sanityCheck(newReport);

        newReport.getRuntime().setSubmitTime(DateTime.now());

        return reportsDb.inTransaction((reportHnd) -> {
            ReportDao reports = reportHnd.attach(ReportDao.class);

            long procId = removeFuckedOptional(reports.addProcessor(newReport.getProcessor()))
                    .orElseGet(() -> reports.getProcessorId(newReport.getProcessor()));
            long appId = removeFuckedOptional(reports.addApplication(newReport.getApplication()))
                    .orElseGet(() -> reports.getApplicationId(newReport.getApplication()));
            long devId = removeFuckedOptional(reports.addDevice(newReport.getDevice()))
                    .orElseGet(() -> reports.getDeviceId(newReport.getDevice()));
            long buildId = removeFuckedOptional(reports.addBuild(newReport.getBuild()))
                    .orElseGet(() -> reports.getBuildId(newReport.getBuild()));

            long runId = reports.addRuntime(
                    newReport.getRuntime(), newReport.getMemory());

            for(String key : newReport.getExtra().keySet())
                reports.addRunExtra(runId, key, newReport.getExtra().get(key));

            reports.addProcessorFirmware(procId, newReport.getProcessor().getFirmware());
            for(float f : newReport.getProcessor().getFrequencies())
                reports.addProcessorFrequency(procId, f);

//            reports.addCompiler(newReport.getBuild());
//            reports.addArchitecture(newReport.getBuild().getArchitecture());

            reports.relateRuntimeApplication(runId, appId);
//            reports.relateRuntimeArchitecture(runId, newReport.getBuild().getArchitecture());
//            reports.relateRuntimeCompiler(runId, newReport.getBuild());
            reports.relateRuntimeDevice(runId, devId);
            reports.relateRuntimeBuild(runId, buildId);
            reports.relateRuntimeProcessor(runId, procId);

            return runId;
        });
    }

    public Optional<ReportData> generateReportData(ObjectNode source, String format) {
        try {
            ReportData raw = new ReportData();

            raw.setFormat(format);
            raw.setRawData(new StringBufferInputStream(mapper.writeValueAsString(source)));

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
    public void putStreamReport(final long runId, final String format, final InputStream data) {
        reportsDb.useTransaction((h) -> {
            ReportDao reports = h.attach(ReportDao.class);
            reports.addStreamReport(runId, format, data);
        });
    }

    private Report mapToReport(
            ReportSingleDao reports, ReportAllDao allReports, Report.RuntimeInfo run) {
        Report out = new Report();

        long runId = run.getRunId();

        out.setReportId(runId);
        out.setRuntime(run);

        out.setApplication(reports.getApplication(runId).orElse(null));
        out.setDevice(reports.getDevice(runId).orElse(null));
        out.setProcessor(reports.getProcessor(runId).orElse(null));
        out.setBuild(reports.getBuild(runId).orElse(null));

        out.getProcessor().setFrequencies(allReports.getProcessorFrequencies(out.getProcessor()));

        out.setExtra(new HashMap<>());
        for(ExtrasProperty prop : reports.getRunExtras(runId))
            out.getExtra().put(prop.getKey(), prop.getValue());

        return out;
    }

    public Optional<Report> getReport(final long runId) {
        return reportsDb.withHandle(
                (hnd) -> {
                    ReportAllDao allReports = hnd.attach(ReportAllDao.class);
                    ReportSingleDao reports = hnd.attach(ReportSingleDao.class);

                    return reports.getRun(runId)
                            .map((run) -> mapToReport(reports, allReports, run));
                });
    }

    public List<Report> getReports() {
        return reportsDb.withHandle(
                (hnd) -> {
                    ReportAllDao allReports = hnd.attach(ReportAllDao.class);
                    ReportSingleDao reports = hnd.attach(ReportSingleDao.class);

                    return allReports.getRuns()
                            .stream()
                            .map((run) -> mapToReport(reports, allReports, run))
                            .collect(Collectors.toList());
                }
        );
    }

    public List<Long> getReportIds() {
        return reportsDb.withExtension(ReportAllDao.class, (reports) -> reports.getRuns()
                .stream()
                .map(Report.RuntimeInfo::getRunId)
                .collect(Collectors.toList()));
    }

    public Optional<ReportData> getRawReport(long runId) {
        return reportsDb.inTransaction(
                (h) -> h.attach(ReportSingleDao.class).getRawReport(runId));
    }

    public Optional<String> getRawReportFormat(long runId) {
        return reportsDb.withExtension(
                ReportSingleDao.class,
                (reports) -> reports.getRawReportFormat(runId));
    }

    /* Listings */

    public List<Report.Processor> getProcessors() {
        return reportsDb.withExtension(ReportAllDao.class, (reports) -> {
            List<Report.Processor> procs = reports.getProcessors();

            for(Report.Processor proc : procs)
                proc.setFrequencies(reports.getProcessorFrequencies(proc));

            return procs;
        });
    }

    public List<Report.DeviceInfo> getDevices() {
        return reportsDb.withExtension(ReportAllDao.class, ReportAllDao::getDevices);
    }

    public List<Report.ApplicationInfo> getApplications() {
        return reportsDb.withExtension(ReportAllDao.class, ReportAllDao::getApplications);
    }

    public List<Report.BuildInfo> getAppBuilds(long appId) {
        return reportsDb.withExtension(ReportAllDao.class, (reports) -> reports.getAppBuilds(appId));
    }

    /* Statistics */

    public List<SystemCount> countSystems() {
        return reportsDb.withExtension(ReportCountDao.class, ReportCountDao::countSystems);
    }

    public List<ArchCount> countArchitectures() {
        return reportsDb.withExtension(ReportCountDao.class, ReportCountDao::countArchitectures);
    }

    public List<BuildVersionCount> countBuildVersions() {
        return reportsDb.withExtension(ReportCountDao.class, ReportCountDao::countBuildVersions);
    }

    public List<ArchSystemCount> countArchSystems() {
        return reportsDb.withExtension(
                ReportCountDao.class, ReportCountDao::countArchitectureSystems);
    }
}
