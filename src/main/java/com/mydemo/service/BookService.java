package com.mydemo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.core.metadata.IPage; // 导入 IPage
import com.mydemo.entity.Book;

public interface BookService extends IService<Book> {
    IPage<Book> getAllBooks(int page, int size, String query); // 返回 IPage<Book>
    Book getBookById(Long id);
    boolean saveBook(Book book);
    boolean updateBook(Book book);
    boolean deleteBook(Long id);
}