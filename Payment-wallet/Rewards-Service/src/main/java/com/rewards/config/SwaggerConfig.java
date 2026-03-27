package com.rewards.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public org.springdoc.core.customizers.OpenApiCustomizer customerGlobalHeaderOpenApiCustomizer() {
        return openApi -> openApi.setServers(java.util.List.of(new io.swagger.v3.oas.models.servers.Server().url("/")));
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Rewards Service API")
                        .version("1.0")
                        .description("APIs for managing reward points, catalog, and campaigns"));
    }
}
