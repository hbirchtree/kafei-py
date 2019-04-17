package dev.birchy.kafei.endpoints;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import dev.birchy.kafei.responses.Report;
import dev.birchy.kafei.responses.ReportInfo;
import dev.birchy.kafei.responses.Result;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Path("/v1")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public final class ReportSubmitLegacy {
    @Inject
    private ObjectMapper mapper;

    @POST
    public Result<ReportInfo> postReport(ObjectNode reportData) throws JsonProcessingException {
        try {
            log.info("Report data: {}", Report.parseLegacyFormat(reportData, mapper));
        } catch(JsonProcessingException e) {
            log.info("{}", e);
        }
        return new Result<>(new ReportInfo(), 0, "OK");
    }
}
