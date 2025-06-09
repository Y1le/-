package com.mydemo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mydemo.entity.User;

public interface UserService extends IService<User> {
    User findByUsername(String username);
}