package dev.birchy.kafei.crash;

import com.google.common.io.ByteStreams;

import org.jdbi.v3.core.mapper.ColumnMapper;
import org.jdbi.v3.core.statement.StatementContext;
import org.postgresql.PGConnection;
import org.postgresql.largeobject.LargeObject;
import org.postgresql.largeobject.LargeObjectManager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class LargeObjectMapper implements ColumnMapper<InputStream> {
    @SneakyThrows
    @Override
    public InputStream map(ResultSet r, int columnNumber, StatementContext ctx) throws SQLException {
        Connection conn = ctx.getConnection();

        conn.setAutoCommit(false);

        long oid = r.getLong(columnNumber);

        LargeObjectManager lobj = conn.unwrap(PGConnection.class).getLargeObjectAPI();
        LargeObject obj = lobj.open(oid, LargeObjectManager.READ);
        InputStream stream = obj.getInputStream();

        /* It's necessary to make a temporary file in order for the LBO to be freed properly */
        File tempFile = File.createTempFile("lboXXXXXXXXXXXXXXX", "bin");

        OutputStream outstream = new FileOutputStream(tempFile);

        ByteStreams.copy(stream, outstream);

        outstream.close();
        stream.close();
        obj.close();

        conn.commit();

        InputStream instream = new FileInputStream(tempFile);

        return instream;
    }
}
