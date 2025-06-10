package com.mydemo.contorller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mydemo.entity.Book;
import com.mydemo.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
public class bookContorller {

    private final BookService bookService;

    public bookContorller(BookService bookService) {
        this.bookService = bookService;
    }

    // 获取所有书籍（分页）
    @GetMapping
    public ResponseEntity<Page<Book>> getAllBooks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String query) {

        // *** 关键修改在这里：调用 bookService.getAllBooks() ***
        IPage<Book> bookPage = bookService.getAllBooks(page, size, query);

        return ResponseEntity.ok((Page<Book>) bookPage); // 强制转换为 Page<Book>
    }

    // 获取书籍详情
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        // 同样，这里应该调用 Service 接口中带有 @Cacheable 的 getBookById 方法
        Book book = bookService.getBookById(id); // 确保调用的是 Service 接口方法
        if (book == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(book);
    }

    // 根据分类获取书籍 (这里你的 Service 接口没有对应的缓存方法，所以不会走缓存)
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable String category) {
        QueryWrapper<Book> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("category", category);
        List<Book> books = bookService.list(queryWrapper); // 这个方法没有 @Cacheable，所以不会走缓存
        return ResponseEntity.ok(books);
    }
}