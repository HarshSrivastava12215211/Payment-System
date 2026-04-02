//package com.admin.client;
//
//import java.util.List;
//
//import org.springframework.cloud.openfeign.FeignClient;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PutMapping;
//
//import com.admin.dto.UserDto;
//
//@FeignClient(name = "USER-SERVICE")
//public interface UserClient {
//
//    @GetMapping("/users")
//    List<UserDto> getAllUsers();
//
//    @PutMapping("/users/{id}/block")
//    void blockUser(@PathVariable Long id);
//
//    @PutMapping("/users/{id}/unblock")
//    void unblockUser(@PathVariable Long id);
//}
