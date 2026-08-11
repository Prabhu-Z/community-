package com.scts.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");

        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // 1. If physical static asset exists (e.g., assets/index.js, favicon.ico), return it
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // 2. Do not override backend API, database console, or uploads
                        if (resourcePath.startsWith("api") || resourcePath.startsWith("h2-console") || resourcePath.startsWith("uploads")) {
                            return null;
                        }

                        // 3. For ALL React SPA routes (/login, /student/dashboard, etc.), return index.html from static location
                        Resource indexResource = location.createRelative("index.html");
                        if (indexResource.exists() && indexResource.isReadable()) {
                            return indexResource;
                        }

                        return new ClassPathResource("static/index.html");
                    }
                });
    }
}
