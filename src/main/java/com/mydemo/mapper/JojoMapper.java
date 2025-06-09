package com.mydemo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mydemo.entity.Jojo;
import org.apache.ibatis.annotations.Select;

public interface JojoMapper extends BaseMapper<Jojo> {

    @Select("SELECT * FROM jojo WHERE name LIKE 'y%'")
    Jojo findJojoByNameStartingWithY();
}
