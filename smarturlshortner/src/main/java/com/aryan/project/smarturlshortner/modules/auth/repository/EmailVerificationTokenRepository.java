package com.aryan.project.smarturlshortner.modules.auth.repository;

import com.aryan.project.smarturlshortner.modules.auth.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByToken(String token);

    @Modifying
    @Query("UPDATE EmailVerificationToken t SET t.used = true WHERE t.user.id = :userId AND t.used = false")
    void invalidatePreviousTokens(Long userId);
}
