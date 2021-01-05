package dev.birchy.kafei.reports.responses.statistics;

import java.util.List;

import dev.birchy.kafei.reports.responses.Report;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public final class BuildAppLink {
    private List<ObjectCount<Report.BuildInfo>> builds;
    private Report.ApplicationInfo application;
}
