package com.airdnd.user;

import com.airdnd.auth.AuthMemberPrincipal;
import com.airdnd.user.dto.CurrentUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository repository;

    @Transactional
    public Member findOrCreateOAuthMember(String provider, String oauthId, String email, String nickname){
        return repository.findByOauthProviderAndOauthId(provider, oauthId)
                .orElseGet(() -> repository.save(
                        new Member(null, email, nickname, MemberRoles.GUEST, provider, oauthId, false)
                ));
    }

    public CurrentUserResponse getCurrentUserInfo(AuthMemberPrincipal principal) {
        if (principal == null) {
            return null;
        }

        return CurrentUserResponse.builder()
                .id(principal.getMemberId())
                .name(principal.getNickname())
                .email(principal.getEmail())
                .role(principal.getRole())
                .avatarUrl(principal.getAvatarUrl())
                .build();
    }
}
