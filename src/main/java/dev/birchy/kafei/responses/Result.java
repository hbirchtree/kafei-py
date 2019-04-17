package dev.birchy.kafei.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public final class Result<T> {
    public static final String MESSAGE_OK = "OK";

    private T data;
    private int status;
    private String message;
}
