package com.aidentx.main_web.config;

/**
 * Contains all constant values to avoid hardcoding throughout the application.
 */
public final class MainWebConstants {

    // API
    public static final String CONTACT_API = "/api/contact";

    // EMAIL
    public static final String CONTACT_EMAIL_SUBJECT = "New Contact Us Request";
    public static final String EMAIL_SENT_SUCCESS = "Email sent successfully";

    private MainWebConstants() {
        throw new UnsupportedOperationException("This is a constants class and cannot be instantiated");
    }
}
