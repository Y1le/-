package com.mydemo.contorller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mydemo.entity.Book;
import com.mydemo.entity.BorrowRecord;
import com.mydemo.entity.User;
import com.mydemo.service.BookService;
import com.mydemo.service.BorrowRecordService;
import com.mydemo.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')") // 只有ADMIN角色才能访问此Controller
public class AdminController {

    private final UserService userService;
    private final BookService bookService;
    private final BorrowRecordService borrowRecordService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserService userService, BookService bookService, BorrowRecordService borrowRecordService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.bookService = bookService;
        this.borrowRecordService = borrowRecordService;
        this.passwordEncoder = passwordEncoder;
    }

    // --- 用户管理 ---
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String username) {
        Page<User> userPage = new Page<>(page, size);
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        if (username != null && !username.isEmpty()) {
            queryWrapper.like("username", username);
        }
        userService.page(userPage, queryWrapper);
        return ResponseEntity.ok(userPage);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users")
    public ResponseEntity<String> addUser(@RequestBody User user) {
        if (userService.findByUsername(user.getUsername()) != null) {
            return new ResponseEntity<>("用户名已存在！", HttpStatus.BAD_REQUEST);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // 确保管理员添加的用户角色是合法的，例如 "ROLE_USER" 或 "ROLE_ADMIN"
        if (user.getRole() == null || (!user.getRole().equals("ROLE_USER") && !user.getRole().equals("ROLE_ADMIN"))) {
            user.setRole("ROLE_USER"); // 默认给普通用户角色
        }
        userService.save(user);
        return new ResponseEntity<>("用户添加成功！", HttpStatus.CREATED);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User existingUser = userService.getById(id);
        if (existingUser == null) {
            return ResponseEntity.notFound().build();
        }
        existingUser.setUsername(userDetails.getUsername());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setPhone(userDetails.getPhone());
        // 允许管理员修改角色
        if (userDetails.getRole() != null && (userDetails.getRole().equals("ROLE_USER") || userDetails.getRole().equals("ROLE_ADMIN"))) {
            existingUser.setRole(userDetails.getRole());
        }
        // 如果密码不为空，则更新密码
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        userService.updateById(existingUser);
        return ResponseEntity.ok("用户更新成功！");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        if (!userService.removeById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok("用户删除成功！");
    }

    // --- 书籍管理 ---
    @PostMapping("/books")
    public ResponseEntity<String> addBook(@RequestBody Book book) {
        book.setAvailableCopies(book.getTotalCopies()); // 新增书籍时，可借阅数等于总数
        bookService.save(book);
        return new ResponseEntity<>("书籍添加成功！", HttpStatus.CREATED);
    }

    @PutMapping("/books/{id}")
    public ResponseEntity<String> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        Book existingBook = bookService.getById(id);
        if (existingBook == null) {
            return ResponseEntity.notFound().build();
        }
        // 更新书籍信息，注意可借阅数量的逻辑
        existingBook.setTitle(bookDetails.getTitle());
        existingBook.setAuthor(bookDetails.getAuthor());
        existingBook.setIsbn(bookDetails.getIsbn());
        existingBook.setPublisher(bookDetails.getPublisher());
        existingBook.setPublicationDate(bookDetails.getPublicationDate());
        existingBook.setCategory(bookDetails.getCategory());
        existingBook.setDescription(bookDetails.getDescription());
        // 如果总数改变，需要重新计算可借阅数量，或由前端提供
        existingBook.setTotalCopies(bookDetails.getTotalCopies());
        existingBook.setAvailableCopies(bookDetails.getAvailableCopies()); // 允许管理员直接修改可借阅数量
        bookService.updateById(existingBook);
        return ResponseEntity.ok("书籍更新成功！");
    }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable Long id) {
        if (!bookService.removeById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok("书籍删除成功！");
    }

    // --- 借阅管理 (管理员视角) ---
    @GetMapping("/borrows")
    public ResponseEntity<Page<BorrowRecord>> getAllBorrowRecords(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long bookId) {
        Page<BorrowRecord> borrowPage = new Page<>(page, size);
        QueryWrapper<BorrowRecord> queryWrapper = new QueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            queryWrapper.eq("status", status);
        }
        if (userId != null) {
            queryWrapper.eq("user_id", userId);
        }
        if (bookId != null) {
            queryWrapper.eq("book_id", bookId);
        }
        borrowRecordService.page(borrowPage, queryWrapper);
        return ResponseEntity.ok(borrowPage);
    }

    @PutMapping("/borrows/{id}/return")
    public ResponseEntity<String> returnBookByAdmin(@PathVariable Long id) {
        BorrowRecord record = borrowRecordService.getById(id);
        if (record == null || !record.getStatus().equals("BORROWED") && !record.getStatus().equals("OVERDUE")) {
            return new ResponseEntity<>("借阅记录不存在或状态不正确！", HttpStatus.BAD_REQUEST);
        }

        // 更新借阅记录状态和归还日期
        record.setStatus("RETURNED");
        record.setReturnDate(LocalDateTime.now());
        borrowRecordService.updateById(record);

        // 增加书籍可借阅数量
        Book book = bookService.getById(record.getBookId());
        if (book != null) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookService.updateById(book);
        }
        return ResponseEntity.ok("书籍归还成功！");
    }

    // 审批借阅请求（如果需要审批流程）
    @PutMapping("/borrows/{id}/approve")
    public ResponseEntity<String> approveBorrowRequest(@PathVariable Long id) {
        BorrowRecord record = borrowRecordService.getById(id);
        if (record == null || !record.getStatus().equals("PENDING")) {
            return new ResponseEntity<>("借阅请求不存在或状态不正确！", HttpStatus.BAD_REQUEST);
        }

        // 检查书籍库存
        Book book = bookService.getById(record.getBookId());
        if (book == null || book.getAvailableCopies() <= 0) {
            return new ResponseEntity<>("书籍库存不足！", HttpStatus.BAD_REQUEST);
        }

        // 更新借阅记录状态和借阅日期、应归还日期
        record.setStatus("BORROWED");
        record.setBorrowDate(LocalDateTime.now());
        record.setDueDate(LocalDateTime.now().plusDays(14)); // 假设借阅期为14天
        borrowRecordService.updateById(record);

        // 减少书籍可借阅数量
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookService.updateById(book);

        return ResponseEntity.ok("借阅请求批准成功！");
    }

    @PutMapping("/borrows/{id}/reject")
    public ResponseEntity<String> rejectBorrowRequest(@PathVariable Long id) {
        BorrowRecord record = borrowRecordService.getById(id);
        if (record == null || !record.getStatus().equals("PENDING")) {
            return new ResponseEntity<>("借阅请求不存在或状态不正确！", HttpStatus.BAD_REQUEST);
        }
        record.setStatus("REJECTED"); // 可以定义一个拒绝状态
        borrowRecordService.updateById(record);
        return ResponseEntity.ok("借阅请求已拒绝！");
    }
}