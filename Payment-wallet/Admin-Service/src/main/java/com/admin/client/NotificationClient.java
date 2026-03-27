package com.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "Notification-Service")
public interface NotificationClient {

    @PostMapping("/api/notifications/send")
    Object sendNotification(@RequestBody Object request);
}
