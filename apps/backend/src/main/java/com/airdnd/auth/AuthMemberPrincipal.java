package com.airdnd.auth;

import com.airdnd.user.MemberRoles;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;

import java.util.Collection;

@Getter
public class AuthMemberPrincipal extends DefaultOidcUser {
    private final Long memberId;
    private final String email;
    private final String nickname;
    private final MemberRoles role;
    private final String avatarUrl;

    public AuthMemberPrincipal(
            Collection<? extends GrantedAuthority> authorities,
            OidcIdToken idToken,
            OidcUserInfo userInfo,
            Long memberId,
            String email,
            String nickname,
            MemberRoles role,
            String avatarUrl
    ){
        super(authorities, idToken, userInfo, "sub");
        this.memberId = memberId;
        this.email = email;
        this.nickname = nickname;
        this.role = role;
        this.avatarUrl = avatarUrl;
    }

}
