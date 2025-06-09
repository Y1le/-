package com.mydemo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mydemo.entity.BorrowRecord;
import com.mydemo.mapper.BorrowRecordMapper;
import com.mydemo.service.BorrowRecordService;
import org.springframework.stereotype.Service; // 确保导入这个注解

@Service
public class BorrowRecordServiceImpl extends ServiceImpl<BorrowRecordMapper, BorrowRecord> implements BorrowRecordService {
}