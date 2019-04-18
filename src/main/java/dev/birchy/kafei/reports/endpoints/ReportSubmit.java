package dev.birchy.kafei.reports.endpoints;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import dev.birchy.kafei.RespondsWith;
import dev.birchy.kafei.reports.responses.Report;
import dev.birchy.kafei.reports.responses.ReportInfo;
import dev.birchy.kafei.responses.Result;
import dev.birchy.kafei.reports.ReportService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Path("/v2")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public final class ReportSubmit {
    @Inject
    private ObjectMapper mapper;
    @Inject
    private ReportService reportService;

    @POST
    @Path("/reports")
    @RespondsWith(ReportInfo.class)
    public Result<ReportInfo> postReport(Report reportData) {
        final long runId = reportService.putReport(reportData);

        reportService
                .generateReportData(mapper.valueToTree(reportData), "structured")
                .ifPresent((report) -> {
                    reportService.putRawReport(runId, report);
                });

        return Result.ok(new ReportInfo(runId));
    }
}
