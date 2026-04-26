package com.aryan.project.smarturlshortner.exception;

import com.aryan.project.smarturlshortner.exception.constraintHandling.ConstraintMessageResolverRegistry;
import com.aryan.project.smarturlshortner.utils.ErrorResponse;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.hibernate.exception.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private final ConstraintMessageResolverRegistry constraintMessageResolverRegistry;

    // For Input Validation
    // ---------------------------------------------------------------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMessageArgumentNotValidException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ){
        log.error("Validation Exception !!", ex);

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach( error -> errors.put(error.getField(), error.getDefaultMessage()));

        HttpStatus status = HttpStatus.BAD_REQUEST;

        ErrorResponse response = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .timestamp(LocalDateTime.now())
                .message("Input Validation Failed !!")
                .path(request.getRequestURI())
                .validationErrors(errors)
                .build();

        return ResponseEntity.status(status)
                .body(response);
    }

    // For API Not Found
    // ---------------------------------------------------------------------------
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(
            NoResourceFoundException ex,
            HttpServletRequest request
    ){
        log.error("API Not Found !!", ex);
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI()));
    }

    // For Illegal Argument
    // ---------------------------------------------------------------------------
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex,
            HttpServletRequest request
    ){
        log.error("Illegal Argument Exception !!", ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI()));
    }

    //  Handle JSON Deserialize Fails
    // ---------------------------------------------------------------------------
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {

        StringBuilder message = new StringBuilder("Malformed JSON request : ");

        Throwable cause = ex.getMostSpecificCause();

        if (cause instanceof InvalidFormatException invalidFormatException) {
            String fieldPath = invalidFormatException.getPathReference();
            String fieldName = extractFieldName(fieldPath);

            message.append(String.format(
                    "Invalid value '%s' for field '%s'",
                    invalidFormatException.getValue(),
                    fieldName));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildErrorResponse(HttpStatus.BAD_REQUEST, message.toString(), request.getRequestURI()));
    }

    // For Handling Database Unique Violation
    // ---------------------------------------------------------------------------
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDatabaseException(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        log.error("Database exception", ex);

        String message = "Database constraint violation";
        HttpStatus status = HttpStatus.BAD_REQUEST;

        Throwable rootCause = ex.getRootCause();

        if (rootCause instanceof ConstraintViolationException constraintViolationException) {
            String constraintName = constraintViolationException.getConstraintName();

            String resolvedMessage = constraintMessageResolverRegistry.resolveMessage(constraintName);
            if (resolvedMessage != null) {
                message = resolvedMessage;
            } else if (constraintName != null) {
                message = "Database constraint violated: " + constraintName;
            }
        }

        return ResponseEntity.status(status)
                .body(buildErrorResponse(status, message, request.getRequestURI()));
    }

    // For Handling Custom Base Exception
    // ---------------------------------------------------------------------------
    @ExceptionHandler(ApiBaseException.class)
    public ResponseEntity<ErrorResponse> handleApiBaseException(
            ApiBaseException ex,
            HttpServletRequest request
    ){
        log.error("API Exception : {} ({})", ex.getMessage(), ex.getStatus());
        return ResponseEntity.status(ex.getStatus())
                    .body(buildErrorResponse(ex.getStatus(), ex.getMessage(), request.getRequestURI()));
    }

    // For Security Authentication
    // ---------------------------------------------------------------------------
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildErrorResponse(
                        HttpStatus.FORBIDDEN,
                        "You don't have permission to access this resources",
                        request.getRequestURI()
                ));
    }

    // For Handling Rest Exceptions/Errors
    // ---------------------------------------------------------------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobal(
            Exception ex,
            HttpServletRequest request) {

        log.error("Unhandled Exception", ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Internal server error",
                        request.getRequestURI()
                ));
    }


    // ========================== //
    // ===== Helper Methods ===== //
    // ========================== //

    private ErrorResponse buildErrorResponse(
            HttpStatus status,
            String message,
            String path
    ){
        return ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .timestamp(LocalDateTime.now())
                .message(message)
                .path(path)
                .build();
    }

    private String extractFieldName(String pathReference) {
        if (pathReference == null || pathReference.isBlank()) {
            return "unknown";
        }

        if (pathReference.contains("[\"") && pathReference.contains("\"]")) {
            int start = pathReference.lastIndexOf("[\"") + 2;
            int end = pathReference.indexOf("\"]", start);
            if (end > start) {
                return pathReference.substring(start, end);
            }
        }

        return "unknown";
    }
}
