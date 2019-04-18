package dev.birchy.kafei.reports.endpoints;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import javax.annotation.Resource;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import dev.birchy.kafei.RespondsWith;
import dev.birchy.kafei.reports.responses.Report;
import dev.birchy.kafei.reports.responses.ReportInfo;
import dev.birchy.kafei.responses.Result;
import dev.birchy.kafei.reports.ReportService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Path("/v1")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public final class ReportSubmitLegacy {
    @Inject
    private ObjectMapper mapper;
    @Inject
    private ReportService reportService;
    @Context
    private UriInfo uriInfo;

    @POST
    @Path("/reports")
    @RespondsWith(ReportInfo.class)
    public Response postReport(ObjectNode reportData) throws NoSuchMethodException {
        Report report = null;

        try {
            report = Report.parseLegacyFormat(reportData, mapper);
        } catch(JsonProcessingException e) {
            log.error("Error deserializing report: {}", e);
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

        long runId = reportService.putReport(report);

        reportService.generateReportData(reportData, "legacy")
                .ifPresent((rawReport) -> reportService.putRawReport(runId, rawReport));

        return Response
                .ok(Result.ok(new ReportInfo(runId)))
                .link(uriInfo.getBaseUriBuilder()
                        .path(ReportViewLegacy.class)
                        .path("blob/{id}")
                        .resolveTemplate("id", runId)
                        .build(), "")
                .build();
    }
}
