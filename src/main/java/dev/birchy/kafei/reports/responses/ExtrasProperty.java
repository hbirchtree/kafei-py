package dev.birchy.kafei.reports.responses;

import lombok.Data;

@Data
public final class ExtrasProperty {
    private String key;
    private byte[] value;
}
