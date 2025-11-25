package com.theatermgnt.theatermgnt.authentication.event;

import org.springframework.context.ApplicationEvent;

import com.theatermgnt.theatermgnt.account.entity.Account;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordResetEvent extends ApplicationEvent {
    Account account;
    String otpCode;

    public PasswordResetEvent(Object source, Account account, String otpCode) {
        super(source);
        this.account = account;
        this.otpCode = otpCode;
    }
}
