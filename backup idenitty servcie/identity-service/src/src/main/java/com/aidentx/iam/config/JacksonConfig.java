package com.aidentx.iam.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Jackson configuration for proper JSON serialization/deserialization.
 * 
 * This configuration ensures that null values are properly handled in JSON serialization,
 * particularly important for identity field classification where missing optional fields
 * should be explicitly represented as null in the JSON output.
 *
 * @author aidentx
 * @since 1.0
 */
@Configuration
public class JacksonConfig {

    /**
     * Creates a properly configured ObjectMapper bean.
     * 
     * This ObjectMapper is configured to:
     * - Include null values in JSON serialization (important for identity fields)
     * - Handle all field types consistently
     * - Maintain backward compatibility with existing JSON structures
     * 
     * @return Configured ObjectMapper instance
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Register Java 8 time module for LocalDateTime, Instant, etc.
        mapper.registerModule(new JavaTimeModule());
        
        // Always include null values in JSON serialization
        // This is crucial for identity field classification where missing optional fields
        // should appear as null in the JSON output rather than being omitted
        mapper.setSerializationInclusion(JsonInclude.Include.ALWAYS);
        
        return mapper;
    }
}
