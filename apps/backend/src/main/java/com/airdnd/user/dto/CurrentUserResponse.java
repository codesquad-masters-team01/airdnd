package com.airdnd.user.dto;

import com.airdnd.user.MemberRoles;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CurrentUserResponse(
        Long id,
        String name,
        String email,
        MemberRoles role,
        String avatarUrl
) {

}
