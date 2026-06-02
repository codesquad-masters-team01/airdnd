package com.airdnd.common.handler;

import com.airdnd.common.error.ErrorCode;
import com.airdnd.common.error.ErrorResponse;
import com.airdnd.common.exception.BusinessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalBusinessExceptionHandler{

    @ExceptionHandler(BusinessException.class)
    private ResponseEntity<ErrorResponse> handleBusinessException(BusinessException exception){
        ErrorCode code = exception.getCode();
        ErrorResponse response = ErrorResponse.of(code);
        return ResponseEntity.status(code.getStatus()).body(response);
    }
}
