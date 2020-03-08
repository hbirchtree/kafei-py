package dev.birchy.kafei.reports.endpoints;

import java.util.Arrays;
import java.util.stream.Collectors;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import dev.birchy.kafei.RespondsWith;
import dev.birchy.kafei.reports.ReportFormat;
import dev.birchy.kafei.reports.responses.Report;
import dev.birchy.kafei.reports.responses.ReportSummary;
import dev.birchy.kafei.responses.CustomHeaders;
import dev.birchy.kafei.responses.Result;
import dev.birchy.kafei.reports.ReportService;
import dev.birchy.kafei.responses.ShortLink;
import jdk.nashorn.internal.ir.ObjectNode;

@Path("/v2/reports")
@Produces(MediaType.APPLICATION_JSON)
public final class ReportView {
    @Inject
    private ReportService reportService;

    @GET
    @RespondsWith(ReportSummary.class)
    public Response getReportSummaries() {
        return Result
                .ok(reportService.getReports()
                        .stream()
                        .map(ReportSummary::new)
                        .map(report -> Result.ok(report).withLinks(Arrays.asList(
                                ShortLink.fromResource(ReportView.class)
                                        .path(report.getReportId() + "")
                                        .requestMethod("GET")
                                        .build(),
                                ShortLink.fromResource(ReportView.class)
                                        .path(report.getReportId() + "/raw")
                                        .requestMethod("GET")
                                        .build(),
                                ShortLink.fromResource(ReportView.class)
                                        .path(report.getReportId() + "/json")
                                        .requestMethod("GET")
                                        .build()
                        )).removeMessage())
                        .collect(Collectors.toList()))
                .withCode(Response.Status.OK)
                .build();
    }

    @GET
    @Path("/{id}")
    @RespondsWith(Report.class)
    public Response getReport(@PathParam("id") long reportId) {
        return reportService
                .getReport(reportId)

                .map((report) -> Response
                        .ok(Result.ok(report))
                        .header(CustomHeaders.X_REPORT_FORMAT, ReportFormat.STRUCTURED)
                        .build())

                .orElse(Result
                        .error(Response.Status.NOT_FOUND)
                        .withCode(Response.Status.NOT_FOUND)
                        .build());
    }

    @GET
    @Path("/{id}/raw")
    public Response getRawReport(@PathParam("id") long reportId) {
        return reportService.getRawReport(reportId).map((report) ->
                Response
                        .ok(report.getRawData())
                        .type(MediaType.APPLICATION_OCTET_STREAM)
                        .header(CustomHeaders.X_REPORT_FORMAT, report.getFormat())
                        .build()
        ).orElse(Result
                .error(Response.Status.NOT_FOUND)
                .withCode(Response.Status.NOT_FOUND)
                .build());
    }

    @GET
    @Path("/{id}/json")
    public Response getJsonReport(@PathParam("id") long reportId) {
        return reportService.getRawReport(reportId)
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
    @Path("/{id}/events")
    public Response getTraceData(@PathParam("id") long reportId) {
        return Result
                .error(Response.Status.NOT_FOUND)
                .withCode(Response.Status.NOT_FOUND)
                .build();
    }
}
