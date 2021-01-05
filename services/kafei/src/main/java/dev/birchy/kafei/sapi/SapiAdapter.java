package dev.birchy.kafei.sapi;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.Socket;
import java.util.Arrays;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;

import dev.birchy.kafei.responses.Result;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Singleton
@Path("/sapi")
public final class SapiAdapter {
    @Inject
    private SapiConfig config;

    private int readShort(BufferedInputStream in) throws IOException {
        return in.read() | in.read() << 8;
    }

    private int readInt(InputStream in) throws IOException {
        return in.read() | in.read() << 8 | in.read() << 16 | in.read() << 24;
    }

    private void writeShort(OutputStream out, int value) throws IOException {
        out.write(value & 0xFF);
        out.write((value >> 8) & 0xFF);
    }

    private void writeInt(OutputStream out, int value) throws IOException {
        out.write(value & 0xFF);
        out.write((value >> 8) & 0xFF);
        out.write((value >> 16) & 0xFF);
        out.write((value >> 24) & 0xFF);
    }

    @GET
    @Path("speak.wav")
    public Response generate(
            @QueryParam("text") String text,
            @QueryParam("voice") @DefaultValue("Sam") String voice,
            @QueryParam("pitch") @DefaultValue("-1") int pitch,
            @QueryParam("speed") @DefaultValue("-1") int speed) throws IOException {

        log.debug("Got text={},voice={},pitch={},speed={}", text, voice, pitch, speed);

        if(text.length() == 0)
            return Result
                    .error(Response.Status.NO_CONTENT)
                    .withCode(Response.Status.NO_CONTENT)
                    .type(MediaType.APPLICATION_JSON)
                    .build();

        if(text.length() > 4095)
            return Result
                    .error(Response.Status.REQUEST_ENTITY_TOO_LARGE)
                    .withMessage("Text too long, must be < 4096")
                    .withCode(Response.Status.BAD_REQUEST)
                    .type(MediaType.APPLICATION_JSON)
                    .build();

        log.debug("Forwarding request to {}:{}", config.getHost(), config.getPort());

        Socket sapiSocket = null;
        try {
            sapiSocket = new Socket(config.getHost(), config.getPort());
        } catch (IOException e) {
            return Result
                    .error(Response.Status.SERVICE_UNAVAILABLE)
                    .withMessage(e.getMessage())
                    .withCode(Response.Status.SERVICE_UNAVAILABLE)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }

        BufferedInputStream in = new BufferedInputStream(sapiSocket.getInputStream());
        OutputStream out = sapiSocket.getOutputStream();

        log.debug("Getting parameters from SAPI");

        int pitchDefault = readShort(in);
        int pitchMin = readShort(in);
        int pitchMax = readShort(in);

        int speedDefault = readInt(in);
        int speedMin = readInt(in);
        int speedMax = readInt(in);

        if(pitch == -1)
            pitch = pitchDefault;
        if(speed == -1)
            speed = speedDefault;

        if(pitch < pitchMin || pitch > pitchMax)
        {
            sapiSocket.close();
            return Result
                    .error(Response.Status.INTERNAL_SERVER_ERROR)
                    .withMessage(String.format("Pitch of %s outside range [%s-%s]",
                            pitch, pitchMin, pitchMax))
                    .withCode(Response.Status.INTERNAL_SERVER_ERROR)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }

        if(speed < speedMin || speed > speedMax)
        {
            sapiSocket.close();
            return Result
                    .error(Response.Status.INTERNAL_SERVER_ERROR)
                    .withMessage(String.format("Speed of %s outside range [%s-%s]",
                            speed, speedMin, speedMax))
                    .withCode(Response.Status.INTERNAL_SERVER_ERROR)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }

        writeShort(out, text.length());
        writeShort(out, pitch);
        writeInt(out, speed);
        out.write(text.getBytes());

        out.flush();

        int inLength = readInt(in);

        byte[] waveData = new byte[inLength];
        int readLength = 0;
        while(readLength != inLength) {
            int newBytes = in.read(waveData, readLength, inLength - readLength);

            if(newBytes == -1)
                break;

            readLength += newBytes;
        }

        if(readLength != inLength) {
            Response res = Result
                    .error(Response.Status.INTERNAL_SERVER_ERROR)
                    .withMessage(
                            String.format("Short read from SAPI, got %s bytes, expected %s, socket connected: %s",
                                    readLength, inLength, sapiSocket.isConnected()))
                    .withCode(Response.Status.INTERNAL_SERVER_ERROR)
                    .type(MediaType.APPLICATION_JSON)
                    .build();

            sapiSocket.close();

            return res;
        }

        sapiSocket.close();

        StreamingOutput output = new StreamingOutput() {
            @Override
            public void write(OutputStream output) throws IOException, WebApplicationException {
                output.write(waveData);
            }
        };

        return Response
                .ok(output)
                .header("X-Sapi-Input", text)
                .header("Content-Length", waveData.length)
                .type("audio/wav")
                .build();
    }
}
