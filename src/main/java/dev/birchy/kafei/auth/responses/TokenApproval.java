package dev.birchy.kafei.auth.responses;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public final class TokenApproval {
    private String username;
    @JsonIgnore
    private String utility;
    private String token;
}
