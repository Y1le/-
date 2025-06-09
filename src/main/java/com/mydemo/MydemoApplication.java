package com.mydemo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean; // 导入 Bean 注解
import org.springframework.web.cors.CorsConfiguration; // 导入 CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // 导入 UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter; // 导入 CorsFilter

@EnableCaching
@SpringBootApplication
@MapperScan("com.mydemo.mapper")
public class MydemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(MydemoApplication.class, args);
    }

//    @Bean
//    public CorsFilter corsFilter() {
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        CorsConfiguration corsConfiguration = new CorsConfiguration();
//        corsConfiguration.addAllowedOrigin("*"); // 允许所有来源，生产环境中应限制特定来源
//        corsConfiguration.addAllowedHeader("*"); // 允许所有请求头
//        corsConfiguration.addAllowedMethod("*"); // 允许所有请求方法 (GET, POST, PUT, DELETE等)
//        source.registerCorsConfiguration("/**", corsConfiguration); // 对所有路径应用 CORS 配置
//        return new CorsFilter(source);
//    }
}
