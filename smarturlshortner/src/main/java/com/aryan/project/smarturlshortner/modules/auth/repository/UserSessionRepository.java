package com.aryan.project.smarturlshortner.modules.auth.repository;

import com.aryan.project.smarturlshortner.modules.auth.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByRefreshToken(String refreshToken);
    List<UserSession> findAllByUserIdAndIsActiveTrue(Long userId);

    @Modifying
    @Query("UPDATE UserSession s SET s.isActive = false WHERE s.user.id = :userId")
    void deactivateAllByUserId(Long userId);
}
