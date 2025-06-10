package com.mydemo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mydemo.entity.Book;
import com.mydemo.mapper.BookMapper;
import com.mydemo.service.BookService;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CachePut;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@CacheConfig(cacheNames = "books")
public class BookServiceImpl extends ServiceImpl<BookMapper, Book> implements BookService {

    @Override
    // 明确指定 cacheManager 的 Bean 名称 (即 RedisConfig 中定义的方法名)
    @Cacheable(key = "#page + '_' + #size + '_' + #query", cacheManager = "cacheManager")
    public IPage<Book> getAllBooks(int page, int size, String query) {
        System.out.print("chazhaosuoyou!"); // 再次确认这个输出
        Page<Book> bookPage = new Page<>(page, size);
        QueryWrapper<Book> queryWrapper = new QueryWrapper<>();
        if (!StringUtils.isEmpty(query)) {
            queryWrapper.like("name", query)
                    .or()
                    .like("author", query);
        }
        return this.page(bookPage, queryWrapper);
    }

    @Override
    @Cacheable(key = "#id", cacheManager = "cacheManager")
    public Book getBookById(Long id) {
        System.out.print("chazhaosuoid!");
        return this.getById(id);
    }

    @Override
    @CacheEvict(allEntries = true, cacheManager = "cacheManager")
    public boolean saveBook(Book book) {
        System.out.print("saveBook!"); // 更改输出，更明确
        return this.save(book);
    }

    @Override
    @CachePut(key = "#book.id", cacheManager = "cacheManager")
    public boolean updateBook(Book book) {
        System.out.print("updateBook!"); // 更改输出，更明确
        return this.updateById(book);
    }

    @Override
    @CacheEvict(key = "#id", cacheManager = "cacheManager")
    public boolean deleteBook(Long id) {
        System.out.print("deleteBook!"); // 更改输出，更明确
        return this.removeById(id);
    }
}