package dev.birchy.kafei.responses;

import com.fasterxml.jackson.annotation.JsonInclude;

import static com.fasterxml.jackson.annotation.JsonInclude.Include;

import java.net.URI;
import java.util.List;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import jdk.net.SocketFlow;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public final class Result<T> {
    public static final String MESSAGE_OK = Response.Status.OK.getReasonPhrase();

    @JsonInclude(Include.NON_NULL)
    private T data;

    @JsonInclude(Include.NON_DEFAULT)
    private int code;

    @JsonInclude(Include.NON_NULL)
    private String message;

    @JsonInclude(Include.NON_NULL)
    private List<ShortLink> links;

    public static Result<Object> ok() {
        return new Result<>(null, 0, MESSAGE_OK, null);
    }

    public static <T> Result<T> ok(T obj) {
        return new Result<>(obj, 0, MESSAGE_OK, null);
    }

    public static Result<Object> error(Response.Status status) {
        return new Result<>( null, status.getStatusCode(), status.getReasonPhrase(), null);
    }

    public Response.ResponseBuilder withCode(Response.Status status) {
        return Response.status(status).entity(this);
    }
    public Response.ResponseBuilder withCreated(URI uri) {
        return Response.created(uri).entity(this);
    }

    public Result<T> withMessage(String message) {
        this.message = message;
        return this;
    }

    public Result<T> removeMessage() {
        message = null;
        return this;
    }

    public Response wrapped() {
        if(code == 0)
            return Response.ok(this).build();
        else
            return Response
                    .status(Response.Status.OK)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(this)
                    .build();
    }

    public Result<T> withLinks(List<ShortLink> links) {
        setLinks(links);
        return this;
    }
}
