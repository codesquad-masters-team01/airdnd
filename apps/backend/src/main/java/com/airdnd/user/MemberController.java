package com.airdnd.user;

import com.airdnd.auth.AuthMemberPrincipal;
import com.airdnd.user.dto.CurrentUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService service;

    @GetMapping("/auth/me")
    public ResponseEntity<CurrentUserResponse> getCurrentUserInfo(@AuthenticationPrincipal AuthMemberPrincipal principal){
       return ResponseEntity.ok(service.getCurrentUserInfo(principal));
    }
}
