package dev.birchy.kafei.reports.endpoints;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.eclipse.paho.client.mqttv3.MqttException;

import java.io.IOException;

import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import dev.birchy.kafei.RespondsWith;
import dev.birchy.kafei.mqtt.GlobalTopics;
import dev.birchy.kafei.mqtt.MqttPublisher;
import dev.birchy.kafei.reports.ReportFormat;
import dev.birchy.kafei.reports.ReportService;
import dev.birchy.kafei.reports.responses.Report;
import dev.birchy.kafei.reports.responses.ReportInfo;
import dev.birchy.kafei.responses.Result;
import dev.birchy.kafei.responses.ShortLink;
import dev.birchy.kafei.responses.SmolMessage;
import lombok.AllArgsConstructor;
import lombok.Data;
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
    @Context
    private UriInfo uriInfo;
    @Inject
    private MqttPublisher publisher;

    @Data
    @AllArgsConstructor
    public static final class NewReport {
        private long runId;
    }

    @POST
    @Path("/reportSink")
    @RespondsWith(ReportInfo.class)
    public Response postReport(
            @HeaderParam("X-Coffee-Token") String coffeeToken,
            String reportRawData) throws IOException, MqttException {
        Report reportData = mapper.readValue(reportRawData, Report.class);

        final long runId = reportService.putReport(reportData);

        reportService
                .generateReportData(
                        mapper.readValue(reportRawData, ObjectNode.class),
                        ReportFormat.STRUCTURED)
                .ifPresent((report) -> {
                    reportService.putRawReport(runId, report);
                });

        publisher.publish(GlobalTopics.REPORT_UPDATE, new NewReport(runId));

        return Result
                .ok(new ReportInfo(runId))
                .withCode(Response.Status.CREATED)
                .location(uriInfo.getBaseUriBuilder()
                        .path(ReportView.class)
                        .path("{id}")
                        .resolveTemplate("id", runId)
                        .build())
                .build();
    }
}
