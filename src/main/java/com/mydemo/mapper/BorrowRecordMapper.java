package com.mydemo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mydemo.entity.BorrowRecord;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BorrowRecordMapper extends BaseMapper<BorrowRecord> {
}