package com.airdnd.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;


@Getter
@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @NotNull
    @Column(unique = true)
    String email;
    @NotNull
    String nickname;
    @NotNull
    String role;
    @NotNull
    String oauthProvider;
    @NotNull
    String oauthId;
    @NotNull
    boolean isDeleted;
}
