package dev.birchy.kafei.endpoints;

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
@Path("/v2")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public final class ReportSubmit {

    @POST
    public Result<ReportInfo> postReport(Report reportData) {
        log.info("{}", reportData);
        return new Result<>(new ReportInfo(), 0, Result.MESSAGE_OK);
    }
}
