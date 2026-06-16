package com.aryan.project.smarturlshortner.modules.analytics.repository;

import com.aryan.project.smarturlshortner.modules.analytics.entity.UrlClick;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UrlClickRepository extends JpaRepository<UrlClick, Long> {

    Page<UrlClick> findByUrlId(Long urlId, Pageable pageable);

    long countByUrlId(Long urlId);

    @Query("SELECT c.browser, COUNT(c) FROM UrlClick c WHERE c.urlId = :urlId GROUP BY c.browser ORDER BY COUNT(c) DESC")
    List<Object[]> countByBrowser(Long urlId);

    @Query("SELECT c.deviceType, COUNT(c) FROM UrlClick c WHERE c.urlId = :urlId GROUP BY c.deviceType ORDER BY COUNT(c) DESC")
    List<Object[]> countByDeviceType(Long urlId);

    @Query("SELECT c.country, c.city, COUNT(c) FROM UrlClick c WHERE c.urlId = :urlId GROUP BY c.country, c.city ORDER BY COUNT(c) DESC")
    List<Object[]> countByCountry(Long urlId);

    @Query("SELECT c.referrer, COUNT(c) FROM UrlClick c WHERE c.urlId = :urlId GROUP BY c.referrer ORDER BY COUNT(c) DESC")
    List<Object[]> countByReferrer(Long urlId);

    @Query("SELECT CAST(c.clickedAt AS date), COUNT(c) FROM UrlClick c WHERE c.urlId = :urlId AND c.clickedAt >= :since GROUP BY CAST(c.clickedAt AS date) ORDER BY CAST(c.clickedAt AS date)")
    List<Object[]> dailyClicksSince(Long urlId, LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT c.ipAddress) FROM UrlClick c WHERE c.urlId = :urlId")
    long countUniqueByUrlId(Long urlId);

    @Query(value = "SELECT COALESCE(SUM(uc.count), 0) FROM (SELECT COUNT(*) as count FROM url_clicks c JOIN urls u ON c.url_id = u.id WHERE u.user_id = :userId GROUP BY c.url_id) uc", nativeQuery = true)
    Long totalClicksByUserId(Long userId);

    @Query("SELECT COUNT(c) FROM UrlClick c WHERE c.clickedAt >= :since")
    long countSince(LocalDateTime since);
}
