package dev.birchy.kafei.github.responses;

import org.joda.time.DateTime;

import lombok.Data;

@Data
public final class GitRelease {
    private DateTime updateTime;
    private byte[] request;
    private String gitsource;
}
