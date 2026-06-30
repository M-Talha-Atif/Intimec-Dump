package com.aidentx.main_web.service;

import com.aidentx.main_web.dto.request.ContactUsRequest;

public interface EmailService {
    void sendContactUsEmail(ContactUsRequest request);
}
