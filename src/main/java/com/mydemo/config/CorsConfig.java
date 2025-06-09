package com.mydemo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 允许所有路径
                // ***** 关键点：将下面的 allowedOrigins 替换为你的前端实际运行的地址 *****
                .allowedOrigins(
                        "http://localhost:8081", // 如果你的前端开发服务器运行在 8080
                        "http://127.0.0.1:5500", // 如果你的 Live Server 运行在 5500
                        "null" // 如果你直接通过 file:/// 协议打开 HTML 文件 (仅限开发环境)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 允许的HTTP方法
                .allowedHeaders("*") // 允许所有请求头
                .allowCredentials(true) // 允许发送Cookie和HTTP认证信息
                .maxAge(3600); // 预检请求的缓存时间（秒）
    }
}