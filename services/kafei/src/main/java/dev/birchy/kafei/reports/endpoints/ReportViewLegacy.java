package dev.birchy.kafei.reports.endpoints;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import dev.birchy.kafei.RespondsWith;
import dev.birchy.kafei.reports.ReportFormat;
import dev.birchy.kafei.reports.ReportService;
import dev.birchy.kafei.reports.responses.Report;
import dev.birchy.kafei.reports.responses.statistics.ArchCount;
import dev.birchy.kafei.reports.responses.statistics.ArchSystemCount;
import dev.birchy.kafei.reports.responses.statistics.BuildVersionCount;
import dev.birchy.kafei.reports.responses.statistics.SystemCount;
import dev.birchy.kafei.responses.CustomHeaders;
import dev.birchy.kafei.responses.Result;

@Path("/v1")
@Produces(MediaType.APPLICATION_JSON)
public final class ReportViewLegacy {
    @Inject
    private ObjectMapper mapper;
    @Inject
    private ReportService reportService;

    @GET
    @Path("/runs")
    public Response getRuns() {
        /* Because the database stores the modern format, we transform the raw report for this */

        return Result.ok(
                reportService
                        .getReportIds()
                        .stream()

                        .map((runId) -> reportService.getRawReport(runId))

                        /* Only when a raw report is available */
                        .filter(Optional::isPresent)
                        .map(Optional::get)

                        /* Only on legacy reports with non-null size */
                        .filter((report) -> report.getFormat().equals(ReportFormat.LEGACY))
                        .filter((report) -> report.getRawData() != null)

                        /* Convert to ObjectNode for creating JSON list */
                        .map((report) -> {
                            try {
                                return mapper.readValue(report.getRawData(), ObjectNode.class);
                            } catch (IOException ignored) {}
                            return null;
                        })
                        .filter(Objects::nonNull)

                        .collect(Collectors.toList())
        ).wrapped();
    }

    @GET
    @Path("/blob")
    public Response getBlob() {
        return Result.ok(
                reportService.getReportIds()
                        .stream()
                        .filter((reportId) ->
                                reportService.getRawReportFormat(reportId)
                                        .map((fmt) -> fmt.equals(ReportFormat.LEGACY))
                                        .orElse(false)))
                .wrapped();
    }

    @GET
    @Path("/blob/{runId}")
    public Response getSingleBlob(@PathParam("runId") long runId) {
        return reportService.getRawReport(runId)

                .filter((report) -> reportService.getRawReportFormat(runId)
                        .map((fmt) -> fmt.equals(ReportFormat.LEGACY))
                        .orElse(false))

                .map((report) -> Response
                        .ok(report.getRawData())
                        .type(MediaType.APPLICATION_JSON)
                        .header(CustomHeaders.X_REPORT_FORMAT, report.getFormat())
                        .build())

                .orElse(Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND)
                        .build());
    }

    @GET
    @Path("/statistics/os")
    @RespondsWith(SystemCount.class)
    public Response getSystemStats() {
        return Result.ok(reportService.countSystems()).wrapped();
    }

    @GET
    @Path("/statistics/arch")
    @RespondsWith(ArchCount.class)
    public Response getArchStats() {
        return Result.ok(reportService.countArchitectures()).wrapped();
    }

    @GET
    @Path("/statistics/os-arch")
    @RespondsWith(ArchSystemCount.class)
    public Response getArchSystemStats() {
        return Result.ok(reportService.countArchSystems()).wrapped();
    }

    @GET
    @Path("/statistics/version")
    @RespondsWith(BuildVersionCount.class)
    public Response getVersionStats() {
        return Result.ok(reportService.countBuildVersions()).wrapped();
    }

    @GET
    @Path("/devices")
    @RespondsWith(Report.DeviceInfo.class)
    public Response getDevices() {
        return Result.ok(reportService.getDevices()).wrapped();
    }

    @GET
    @Path("/processors")
    @RespondsWith(Report.Processor.class)
    public Response getProcessors() {
        return Result.ok(reportService.getProcessors()).wrapped();
    }
}
