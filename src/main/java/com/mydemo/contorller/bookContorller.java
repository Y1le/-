package com.mydemo.contorller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mydemo.entity.Book;
import com.mydemo.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
public class bookContorller { // 注意：这里是小写的'b'，建议改为BookController

    private final BookService bookService;

    public bookContorller(BookService bookService) {
        this.bookService = bookService;
    }

    // 获取所有书籍（分页）
    @GetMapping
    public ResponseEntity<Page<Book>> getAllBooks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String query) { // 用于搜索
        Page<Book> bookPage = new Page<>(page, size);
        QueryWrapper<Book> queryWrapper = new QueryWrapper<>();
        if (query != null && !query.isEmpty()) {
            // 模糊查询书名、作者或ISBN
            queryWrapper.like("title", query)
                    .or()
                    .like("author", query)
                    .or()
                    .like("isbn", query);
        }
        bookService.page(bookPage, queryWrapper);
        return ResponseEntity.ok(bookPage);
    }

    // 获取书籍详情
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Book book = bookService.getById(id);
        if (book == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(book);
    }

    // 根据分类获取书籍
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable String category) {
        QueryWrapper<Book> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("category", category);
        List<Book> books = bookService.list(queryWrapper);
        return ResponseEntity.ok(books);
    }
}