package com.theatermgnt.theatermgnt.notification.service;

import com.theatermgnt.theatermgnt.account.entity.Account;
import com.theatermgnt.theatermgnt.common.exception.AppException;
import com.theatermgnt.theatermgnt.common.exception.ErrorCode;
import com.theatermgnt.theatermgnt.notification.dto.request.*;
import com.theatermgnt.theatermgnt.notification.dto.response.EmailResponse;
import com.theatermgnt.theatermgnt.notification.repository.httpClient.EmailClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
public class EmailBuilderService {
    EmailService emailService;

    public void buildAndSendEmail(EmailBuilderRequest request) {
        // 1. Build recipient
        Recipient recipient = Recipient.builder()
                .email(request.getAccount().getEmail())
                .name(request.getAccount().getUsername())
                .build();

        // 2. Build SendEmailRequest
        SendEmailRequest sendEmailRequest = SendEmailRequest.builder()
                .to(recipient)
                .subject(request.getSubject())
                .htmlContent(request.getHtmlContent())
                .build();

        // 3. Send email
        try{
            emailService.sendEmail(sendEmailRequest);
            log.info("Email Sent Successfully", request.getEmailTypeForLog(),
                    request.getAccount().getEmail());
        }catch(Exception e){
            log.error("Failed to send email to {}: {}", request.getEmailTypeForLog(),
                    request.getAccount().getEmail(), e.getMessage(),e);
        }
    }
}
