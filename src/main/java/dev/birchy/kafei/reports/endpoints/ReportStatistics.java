package dev.birchy.kafei.reports.endpoints;

import org.jdbi.v3.core.Jdbi;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import dev.birchy.kafei.RespondsWith;
import dev.birchy.kafei.reports.ReportService;
import dev.birchy.kafei.reports.dao.ReportAllDao;
import dev.birchy.kafei.reports.responses.Report;
import dev.birchy.kafei.reports.responses.statistics.BuildAppLink;
import dev.birchy.kafei.reports.responses.statistics.ObjectCount;
import dev.birchy.kafei.responses.Result;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Path("/v2/stats")
@Produces(MediaType.APPLICATION_JSON)
public final class ReportStatistics {
    @Inject
    private ReportService service;

    @Inject
    @Named
    private Jdbi reportsDb;

    @Data
    @AllArgsConstructor
    private static class IdPair<T> {
        private long id;
        private T item;
    }

    @Data
    @AllArgsConstructor
    private static class DataPair<T> {
        private long count;
        private T item;

        public void increment() {
            count ++;
        }
    }

    private <T> List<DataPair<T>> countReports(Function<? super Report, IdPair<T>> extract) {
        final Map<Long, DataPair<T>> variantBuckets = new HashMap<>();

        service.getReports().forEach((report) -> {
            IdPair<T> id = extract.apply(report);

            if(variantBuckets.containsKey(id.getId()))
                variantBuckets.get(id.getId()).increment();
            else
                variantBuckets.put(id.getId(), new DataPair<>(1L, id.getItem()));
        });

        List<DataPair<T>> allPairs = new ArrayList<>();
        variantBuckets.forEach((id, pair) -> allPairs.add(pair));
        return allPairs;
    }

    @GET
    @Path("devices")
    @RespondsWith(Report.DeviceInfo.class)
    public Response allDevices() {
        return Result.ok(
                countReports((report) ->
                        new IdPair<>(report.getDevice().getDevId(), report.getDevice()))
        ).wrapped();
    }

    @GET
    @Path("processors")
    @RespondsWith(Report.Processor.class)
    public Response allProcessors() {
        return Result.ok(
                countReports((report) ->
                        new IdPair<>(report.getProcessor().getProcId(), report.getProcessor()))
        ).wrapped();
    }

    @GET
    @Path("applications")
    @RespondsWith(Report.ApplicationInfo.class)
    public Response allApplications() {
        return Result.ok(
                countReports((report) ->
                        new IdPair<>(report.getApplication().getAppId(), report.getApplication()))
        ).wrapped();
    }

    @GET
    @Path("builds")
    @RespondsWith(BuildAppLink.class)
    public Response allAppBuilds() {
        List<BuildAppLink> apps = new ArrayList<>();

        for(Report.ApplicationInfo app : service.getApplications()) {
            BuildAppLink link = new BuildAppLink(new ArrayList<>(), app);
            Map<Report.BuildInfo, ObjectCount<Report.BuildInfo>> builds = new HashMap<>();

            for(Report.BuildInfo build : service.getAppBuilds(app.getAppId())) {
                if(!builds.containsKey(build)) {
                    builds.put(build, new ObjectCount<>(build, 0));
                    link.getBuilds().add(builds.get(build));
                }

                builds.get(build).increment();
            }

            apps.add(link);
        }

        return Result.ok(
                apps
        ).wrapped();
    }
}
