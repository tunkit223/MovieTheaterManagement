package com.theatermgnt.theatermgnt.authentication.repository.httpClient;

import com.theatermgnt.theatermgnt.authentication.dto.request.ExchangeTokenRequest;
import com.theatermgnt.theatermgnt.authentication.dto.response.ExchangeTokenResponse;
import com.theatermgnt.theatermgnt.authentication.dto.response.OutBoundUserResponse;
import feign.QueryMap;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "outbound-user-client", url = "https://www.googleapis.com")
public interface OutboundUserClient {
    @GetMapping(value = "/oauth2/v1/userinfo")
    OutBoundUserResponse getUserInfo(@RequestParam("alt") String alt,
                                     @RequestParam("access_token") String accessToken);
}
