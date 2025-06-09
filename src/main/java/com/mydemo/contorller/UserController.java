package com.mydemo.contorller;

import com.mydemo.entity.User;
import com.mydemo.service.UserService; // 确保导入 UserService
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails; // 导入 UserDetails 接口
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.annotation.JsonIgnore; // 确保导入，如果 User 实体有 password 字段

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 获取当前用户信息
    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) { // <-- 将 User 改为 UserDetails
        if (userDetails == null) {
            System.out.println("Current authenticated user (via System.out.println): null (UserDetails is null)");
            // 理论上，如果JWT过滤器成功设置了Authentication，userDetails不会是null
            // 但如果真的为null，这里可以返回一个错误响应或null
            return null;
        }

        // 尝试将 UserDetails 转换为你的 User 实体
        User currentUser = null;
        if (userDetails instanceof User) {
            currentUser = (User) userDetails;
        } else {
            // 如果 principal 不是你的 User 实体类型（例如，可能是 Spring Security 内部的 User），
            // 则通过用户名从数据库重新加载你的 User 实体。
            System.out.println("Authenticated principal is not com.mydemo.entity.User, loading from DB: " + userDetails.getUsername());
            currentUser = userService.findByUsername(userDetails.getUsername()); // <-- 使用你的 UserService 重新加载
        }

        if (currentUser == null) {
            // 如果从数据库也找不到用户，这可能是数据不一致或严重错误
            System.err.println("User not found in DB for username: " + userDetails.getUsername());
            return null; // 或者抛出异常
        }

        System.out.println("Current authenticated user (after processing): " + currentUser);
        // 确保User实体类中的password字段没有 @JsonIgnore 注解，或者返回一个不包含密码的DTO
        // 鉴于你之前解决了注册问题（移除了 @JsonIgnore），这里返回 User 实体应该可以，但密码会暴露
        // 强烈建议返回 DTO
        return currentUser; // 或者返回 new UserDto(...)
    }

    // 更新当前用户信息
    @PutMapping("/me")
    public String updateCurrentUser(@AuthenticationPrincipal User currentUser, @RequestBody User updatedUser) {
        currentUser.setEmail(updatedUser.getEmail());
        currentUser.setPhone(updatedUser.getPhone());
        // 不允许直接通过此接口修改密码和角色
        userService.updateById(currentUser);
        return "用户信息更新成功！";
    }

    // 用户查看自己的借阅记录 (需要BorrowRecordController来处理)
    // @GetMapping("/my-borrows")
    // public List<BorrowRecord> getMyBorrowRecords(@AuthenticationPrincipal User currentUser) {
    //     // 调用 BorrowRecordService 获取当前用户的借阅记录
    //     return borrowRecordService.getRecordsByUserId(currentUser.getId());
    // }
}