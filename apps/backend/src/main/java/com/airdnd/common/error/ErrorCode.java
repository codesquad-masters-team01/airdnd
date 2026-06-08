package com.airdnd.common.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "요청 형식이 유효하지 않습니다"),
    UNAUTHORIZED_ACTION(HttpStatus.UNAUTHORIZED, "권한이 없는 요청은 수행할 수 없습니다"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "요청하신 유저 정보를 찾을 수 없습니다");

    private final HttpStatus status;
    private final String errorMessage;

    ErrorCode(HttpStatus status, String errorMessage){
        this.status = status;
        this.errorMessage = errorMessage;
    }

}
