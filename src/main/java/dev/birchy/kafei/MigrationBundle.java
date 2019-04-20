package dev.birchy.kafei;

import org.jdbi.v3.core.Handle;
import org.jdbi.v3.core.Jdbi;
import org.jdbi.v3.core.statement.UnableToExecuteStatementException;

import java.io.IOException;
import java.util.function.Consumer;

import io.dropwizard.Bundle;

public interface MigrationBundle extends Bundle {
    static void loadMigrations(
            final Jdbi connection, final String migrations, final Consumer<Handle> healthCheck) {
        try {
            connection.useHandle((h) -> {
                try {
                    healthCheck.accept(h);
                } catch(UnableToExecuteStatementException e) {
                    h.execute(ResourceReader.readResource(migrations));
                }
            });
        } catch (IOException e) {
            throw new RuntimeException("Failed to run  migrations", e);
        }
    }
}
