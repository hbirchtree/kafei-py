package dev.birchy.kafei.crash;

import com.google.common.io.ByteStreams;

import org.jdbi.v3.core.argument.AbstractArgumentFactory;
import org.jdbi.v3.core.argument.Argument;
import org.jdbi.v3.core.config.ConfigRegistry;
import org.jdbi.v3.core.statement.StatementContext;
import org.postgresql.PGConnection;
import org.postgresql.largeobject.LargeObject;
import org.postgresql.largeobject.LargeObjectManager;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;

import lombok.SneakyThrows;

public final class InputStreamMapperFactory extends AbstractArgumentFactory<InputStream> {
    /**
     * Constructs an {@link ArgumentFactory} for type {@code T}.
     *
     * @param sqlType the {@link Types} constant to use when the argument value is {@code null}.
     */
    public InputStreamMapperFactory(int sqlType) {
        super(sqlType);
    }

    @Override
    protected Argument build(InputStream value, ConfigRegistry config) {
        return new Argument() {
            @SneakyThrows
            @Override
            public void apply(
                    int position,
                    PreparedStatement statement,
                    StatementContext ctx)
                    throws SQLException {
                Connection conn = ctx.getConnection();

                conn.setAutoCommit(false);

                LargeObjectManager lobj = conn.unwrap(PGConnection.class).getLargeObjectAPI();
                long oid = lobj.createLO(LargeObjectManager.READWRITE);
                LargeObject out = lobj.open(oid, LargeObjectManager.WRITE);

                ByteStreams.copy(value, out.getOutputStream());
                out.close();

                conn.commit();

                statement.setLong(position, oid);
            }
        };
    }
}
