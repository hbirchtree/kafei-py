package dev.birchy.kafei.auth.responses;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public final class UserRegistered {
    private String username;

    @JsonInclude(Include.NON_NULL)
    private String token;
}
