package dev.birchy.kafei.responses;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import lombok.Data;

@Data
public final class SmolMessage {
    @JsonInclude(Include.NON_DEFAULT)
    private int code;
    @JsonInclude(Include.NON_NULL)
    private String message;
    @JsonInclude(Include.NON_NULL)
    private Object object;

    public static SmolMessage withObject(Object object) {
        SmolMessage out = new SmolMessage();
        out.setObject(object);
        return out;
    }
}

