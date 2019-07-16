package dev.birchy.kafei.crash;

import org.joda.time.DateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public final class CrashSummary {
    private long crashId;
    private DateTime submitTime;
    private int exitCode;
}
