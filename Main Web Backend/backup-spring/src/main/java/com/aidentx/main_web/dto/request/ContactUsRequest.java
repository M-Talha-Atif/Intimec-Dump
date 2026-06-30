package com.aidentx.main_web.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContactUsRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    @NotBlank
    private String email;

    private String company;

    @NotBlank
    private String reason;

    @NotBlank
    private String message;

    // getters & setters
}
