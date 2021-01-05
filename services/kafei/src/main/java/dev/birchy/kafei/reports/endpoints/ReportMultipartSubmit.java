package dev.birchy.kafei.reports.endpoints;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.eclipse.paho.client.mqttv3.MqttException;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.jdbi.v3.core.Jdbi;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
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
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Path("/v3")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public final class ReportMultipartSubmit {
    @Inject
    private ReportService reportService;
    @Inject
    private MqttPublisher publisher;
    @Inject
    private ObjectMapper mapper;
    @Context
    private UriInfo uriInfo;

    @POST
    @Path("reportSink")
    @RespondsWith(ReportInfo.class)
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response postReport(
            @Context HttpHeaders headers,
            @FormDataParam("profile") File profile,
            @FormDataParam("machineProfile") File machineProfile)
            throws IOException, MqttException {
        Report reportData = mapper.readValue(machineProfile, Report.class);

        final long runId = reportService.putReport(reportData);

        try {
            reportService.putStreamReport(runId, ReportFormat.STRUCTURED, new FileInputStream(profile));
        } catch (FileNotFoundException e) {}

        publisher.publish(GlobalTopics.REPORT_UPDATE, new ReportSubmit.NewReport(runId));

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
