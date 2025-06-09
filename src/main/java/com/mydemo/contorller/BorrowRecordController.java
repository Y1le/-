package com.mydemo.contorller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mydemo.entity.Book;
import com.mydemo.entity.BorrowRecord;
import com.mydemo.entity.User;
import com.mydemo.service.BookService;
import com.mydemo.service.BorrowRecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/borrows")
public class BorrowRecordController {

    private final BorrowRecordService borrowRecordService;
    private final BookService bookService;

    public BorrowRecordController(BorrowRecordService borrowRecordService, BookService bookService) {
        this.borrowRecordService = borrowRecordService;
        this.bookService = bookService;
    }

    // 用户借阅书籍
    @PostMapping
    public ResponseEntity<String> borrowBook(@RequestBody BorrowRecord borrowRequest, @AuthenticationPrincipal User currentUser) {
        // 检查书籍是否存在
        Book book = bookService.getById(borrowRequest.getBookId());
        if (book == null) {
            return new ResponseEntity<>("书籍不存在！", HttpStatus.NOT_FOUND);
        }
        // 检查书籍是否可借阅
        if (book.getAvailableCopies() <= 0) {
            return new ResponseEntity<>("书籍已全部借出！", HttpStatus.BAD_REQUEST);
        }

        // 检查用户是否已借阅此书且未归还
        QueryWrapper<BorrowRecord> existingBorrowQuery = new QueryWrapper<>();
        existingBorrowQuery.eq("user_id", currentUser.getId())
                .eq("book_id", borrowRequest.getBookId())
                .in("status", "BORROWED", "PENDING"); // 如果有PENDING状态
        if (borrowRecordService.count(existingBorrowQuery) > 0) {
            return new ResponseEntity<>("您已借阅此书且未归还或正在审批中！", HttpStatus.BAD_REQUEST);
        }

        // 创建借阅记录
        BorrowRecord newRecord = new BorrowRecord();
        newRecord.setUserId(currentUser.getId());
        newRecord.setBookId(borrowRequest.getBookId());
        newRecord.setBorrowDate(LocalDateTime.now());
        newRecord.setDueDate(LocalDateTime.now().plusDays(14)); // 假设借阅期为14天
        newRecord.setStatus("BORROWED"); // 默认直接借阅，如果需要审批流程，这里可以是"PENDING"

        borrowRecordService.save(newRecord);

        // 减少书籍可借阅数量
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookService.updateById(book);

        return new ResponseEntity<>("书籍借阅成功！", HttpStatus.CREATED);
    }

    // 用户归还书籍
    @PutMapping("/{recordId}/return")
    public ResponseEntity<String> returnBook(@PathVariable Long recordId, @AuthenticationPrincipal User currentUser) {
        BorrowRecord record = borrowRecordService.getById(recordId);
        if (record == null || !record.getUserId().equals(currentUser.getId())) {
            return new ResponseEntity<>("借阅记录不存在或无权操作！", HttpStatus.NOT_FOUND);
        }
        if (!record.getStatus().equals("BORROWED") && !record.getStatus().equals("OVERDUE")) {
            return new ResponseEntity<>("该书籍未处于借阅状态或已归还！", HttpStatus.BAD_REQUEST);
        }

        record.setReturnDate(LocalDateTime.now());
        record.setStatus("RETURNED");
        borrowRecordService.updateById(record);

        // 增加书籍可借阅数量
        Book book = bookService.getById(record.getBookId());
        if (book != null) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookService.updateById(book);
        }
        return new ResponseEntity<>("书籍归还成功！", HttpStatus.OK);
    }

    // 用户查看自己的借阅记录
    @GetMapping("/my")
    public ResponseEntity<Page<BorrowRecord>> getMyBorrowRecords(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        Page<BorrowRecord> borrowPage = new Page<>(page, size);
        QueryWrapper<BorrowRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", currentUser.getId());
        if (status != null && !status.isEmpty()) {
            queryWrapper.eq("status", status);
        }
        queryWrapper.orderByDesc("borrow_date"); // 按借阅日期倒序
        borrowRecordService.page(borrowPage, queryWrapper);
        return ResponseEntity.ok(borrowPage);
    }

    // 用户续借书籍 (简单实现，实际可能需要更多逻辑，如续借次数限制、逾期不允许续借等)
    @PutMapping("/{recordId}/renew")
    public ResponseEntity<String> renewBook(@PathVariable Long recordId, @AuthenticationPrincipal User currentUser) {
        BorrowRecord record = borrowRecordService.getById(recordId);
        if (record == null || !record.getUserId().equals(currentUser.getId())) {
            return new ResponseEntity<>("借阅记录不存在或无权操作！", HttpStatus.NOT_FOUND);
        }
        if (!record.getStatus().equals("BORROWED")) {
            return new ResponseEntity<>("该书籍未处于借阅状态，无法续借！", HttpStatus.BAD_REQUEST);
        }
        if (record.getDueDate().isBefore(LocalDateTime.now())) {
            return new ResponseEntity<>("书籍已逾期，请先归还！", HttpStatus.BAD_REQUEST);
        }

        // 更新应归还日期，例如延长14天
        record.setDueDate(record.getDueDate().plusDays(14));
        borrowRecordService.updateById(record);
        return new ResponseEntity<>("书籍续借成功！新的归还日期为：" + record.getDueDate().toLocalDate(), HttpStatus.OK);
    }
}