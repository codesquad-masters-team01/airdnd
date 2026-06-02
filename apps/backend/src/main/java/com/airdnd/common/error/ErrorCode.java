package com.airdnd.common.error;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "요청 형식이 유효하지 않습니다");

    private final HttpStatus status;
    private final String errorMessage;

    ErrorCode(HttpStatus status, String errorMessage){
        this.status = status;
        this.errorMessage = errorMessage;
    }

    public HttpStatus getStatus(){
        return this.status;
    }

    public String getErrorMessage(){
        return this.errorMessage;
    }

}
