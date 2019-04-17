package dev.birchy.kafei;

import org.jdbi.v3.core.Jdbi;

import lombok.Data;

@Data
public final class DbConnections {
    private Jdbi reports;
}
