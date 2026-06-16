package com.aryan.project.smarturlshortner.modules.url.repository;

import com.aryan.project.smarturlshortner.modules.url.entity.Url;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {
    Optional<Url> findByShortCode(String shortCode);
    Optional<Url> findByShortCodeAndDeletedFalse(String shortCode);
    boolean existsByShortCode(String shortCode);

    Page<Url> findByUserIdAndDeletedFalse(Long userId, Pageable pageable);

    @Query("SELECT COUNT(u) FROM Url u WHERE u.deleted = false")
    long countTotalActiveUrls();

    @Query("SELECT SUM(u.totalClicks) FROM Url u WHERE u.deleted = false")
    Long sumTotalClicks();

    List<Url> findByExpiryDateBeforeAndActiveTrue(LocalDateTime now);

    @Modifying
    @Query("UPDATE Url u SET u.active = false WHERE u.userId = :userId")
    void disableAllUrlsByUserId(Long userId);

    Page<Url> findByDeletedFalse(Pageable pageable);
}
