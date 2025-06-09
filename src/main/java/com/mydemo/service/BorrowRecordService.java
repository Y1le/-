package com.mydemo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mydemo.entity.BorrowRecord;

public interface BorrowRecordService extends IService<BorrowRecord> {
    // 可以添加自定义的业务方法，例如借阅、归还逻辑
}