package com.aidentx.main_web.controller;

import com.aidentx.main_web.config.MainWebConstants;
import com.aidentx.main_web.dto.request.ContactUsRequest;
import com.aidentx.main_web.dto.response.ApiResponse;
import com.aidentx.main_web.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ContactUsController {

    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> contactUs(
            @Valid @RequestBody ContactUsRequest request,
            HttpServletRequest httpRequest
    ) {
        emailService.sendContactUsEmail(request);

        return ResponseEntity.ok(
                ApiResponse.<Void>success(
                                MainWebConstants.EMAIL_SENT_SUCCESS,
                                null
                        ).toBuilder()
                        .path(httpRequest.getRequestURI())
                        .build()
        );
    }
}
