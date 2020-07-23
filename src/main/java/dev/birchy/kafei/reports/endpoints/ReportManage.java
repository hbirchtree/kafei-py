package dev.birchy.kafei.reports.endpoints;

import org.jdbi.v3.core.Jdbi;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;

import dev.birchy.kafei.reports.dao.ReportDao;
import dev.birchy.kafei.responses.Result;

import static dev.birchy.kafei.auth.AccessScope.DIAGNOSTICS_REPORTS;
import static dev.birchy.kafei.auth.AccessScope.PERM_WRITE;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

@Path("/v2/reports")
@Produces(APPLICATION_JSON)
@Consumes(APPLICATION_JSON)
public final class ReportManage {
    @Inject
    @Named
    private Jdbi reportsDb;

    @DELETE
    @Path("/{id}")
    @RolesAllowed(DIAGNOSTICS_REPORTS + "+" + PERM_WRITE)
    public Response deleteReport(@PathParam("id") long reportId) {
        int deleted = reportsDb.withExtension(ReportDao.class, (reports) ->
                reports.deleteReport(reportId));

        if(deleted > 1)
            throw new WebApplicationException("deleted more than one element");

        return deleted == 1 ? Result
                .ok()
                .withCode(Response.Status.OK)
                .build()
                : Result
                .error(Response.Status.NOT_FOUND)
                .withCode(Response.Status.NOT_FOUND)
                .build();
    }
}
