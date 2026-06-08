package com.airdnd.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Entity
@Table(name = "members")
@AllArgsConstructor
@NoArgsConstructor
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
    @Enumerated(EnumType.STRING)
    MemberRoles role;
    @NotNull
    String oauthProvider;
    @NotNull
    String oauthId;
    @NotNull
    boolean isDeleted;


    public void activateHost(){
        if(this.role == MemberRoles.GUEST){
            this.role = MemberRoles.HOST;
        }
    }
}
