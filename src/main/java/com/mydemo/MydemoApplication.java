package com.mydemo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean; // 导入 Bean 注解
import org.springframework.web.cors.CorsConfiguration; // 导入 CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // 导入 UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter; // 导入 CorsFilter

import javax.annotation.PostConstruct;

@EnableCaching
@SpringBootApplication
@MapperScan("com.mydemo.mapper")
public class MydemoApplication {
//    @Autowired
//    private CacheManager cacheManager;

    public static void main(String[] args) {
        SpringApplication.run(MydemoApplication.class, args);
    }

//    @PostConstruct
//    public void checkCacheManager() {
//        System.out.println("Current Cache Manager Type: " + cacheManager.getClass().getName());
//        // 尝试获取一个缓存并打印
//        if (cacheManager.getCache("books") != null) {
//            System.out.println("Cache 'books' obtained successfully: " + cacheManager.getCache("books").getClass().getName());
//        } else {
//            System.out.println("Cache 'books' is null.");
//        }
//    }
//    @Bean
//    public CorsFilter corsFilter() {
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        CorsConfiguration corsC   onfiguration = new CorsConfiguration();
//        corsConfiguration.addAllowedOrigin("*"); // 允许所有来源，生产环境中应限制特定来源
//        corsConfiguration.addAllowedHeader("*"); // 允许所有请求头
//        corsConfiguration.addAllowedMethod("*"); // 允许所有请求方法 (GET, POST, PUT, DELETE等)
//        source.registerCorsConfiguration("/**", corsConfiguration); // 对所有路径应用 CORS 配置
//        return new CorsFilter(source);
//    }
}
