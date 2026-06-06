package com.airdnd.auth;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import java.util.Collection;
import java.util.Map;

@Getter
public class AuthUserPrincipal extends DefaultOAuth2User {
    private final Long memberId;
    private final String email;
    private final String nickname;
    private final String role;

    public AuthUserPrincipal(
            Collection<? extends GrantedAuthority> authorities,
            Map<String, Object> attributes,
            String nameAttributeKey,
            Long memberId,
            String email,
            String nickname,
            String role
    ){
        super(authorities,attributes,nameAttributeKey);
        this.memberId = memberId;
        this.email = email;
        this.nickname = nickname;
        this.role = role;
    }

}
