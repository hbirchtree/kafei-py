package dev.birchy.kafei.auth.responses;

import lombok.Data;

@Data
public final class UserData {
    private String username;
    private String password;
}
