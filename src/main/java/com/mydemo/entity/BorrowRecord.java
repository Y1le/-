package com.mydemo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@TableName("borrow_record") // 假设你的借阅记录表名为 borrow_record
public class BorrowRecord {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long bookId;
    private LocalDateTime borrowDate;
    private LocalDateTime dueDate; // 应归还日期
    private LocalDateTime returnDate; // 实际归还日期
    private String status; // "BORROWED", "RETURNED", "OVERDUE", "PENDING"
}