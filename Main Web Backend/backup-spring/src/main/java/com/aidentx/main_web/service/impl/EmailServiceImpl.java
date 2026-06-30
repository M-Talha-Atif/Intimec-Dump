package com.aidentx.main_web.service.impl;

import com.aidentx.main_web.dto.request.ContactUsRequest;
import com.aidentx.main_web.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    private static final String TO_EMAIL = "your-email@gmail.com";

    @Override
    public void sendContactUsEmail(ContactUsRequest request) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(request.getEmail());
        message.setSubject("New Contact Us Request - " + request.getReason());

        message.setText(
                "First Name: " + request.getFirstName() + "\n" +
                        "Last Name: " + request.getLastName() + "\n" +
                        "Email: " + request.getEmail() + "\n" +
                        "Company: " + request.getCompany() + "\n" +
                        "Reason: " + request.getReason() + "\n\n" +
                        "Message:\n" + request.getMessage()
        );

        mailSender.send(message);
    }
}
