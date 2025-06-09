package com.mydemo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mydemo.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper // 标记为 MyBatis Mapper
public interface UserMapper extends BaseMapper<User> {
}