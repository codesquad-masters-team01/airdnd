package com.airdnd.user;

import com.airdnd.user.dto.MemberResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MemberController {

    @GetMapping("/api/auth/me")
    public ResponseEntity<MemberResponse> getCurrentUser(){

        MemberResponse mockHostMember = new MemberResponse(
                1L,
                "host@example.com",
                "테스트 호스트",
                "HOST",
                "abc",
                "aaa",
                false
        );
        return ResponseEntity.ok(mockHostMember);
    }
}
