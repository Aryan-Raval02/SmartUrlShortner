# Smart URL Shortener Platform — Master Business Requirements Document (BRD)

**Version:** 2.0 (Final — Production Ready)
**Date:** April 2026
**Tech Stack:** Java 21 + Spring Boot 4.x + ReactJS + Vite + Tailwind CSS + PostgreSQL + Redis
**Status:** ✅ Final — Ready for Implementation

---

## 1. Project Overview

### 1.1 Project Name
**Smart URL Shortener Platform** (codename: *Shortly*)

### 1.2 Objective
Build a scalable, secure, and high-performance URL shortening platform where users can convert long URLs into short, shareable links. The system provides comprehensive tracking, analytics, user authentication, link lifecycle management, advanced security, and O(1) Redis-cached redirection.

### 1.3 Business Problem
Long URLs are difficult to share, remember, and track. Businesses, marketers, developers, and everyday users need a reliable system to:
- Shorten long URLs into compact, shareable links
- Track total and unique clicks with detailed analytics (browser, device, geo-location, referrer)
- Manage created links (update, delete, enable/disable, set expiry)
- Secure links with password protection and ownership access control
- Detect and block malicious or spam URLs automatically
- Provide admins with platform-wide visibility and management tools

### 1.4 Target Users

| Actor | Description |
|-------|-------------|
| **Guest** | Can shorten URLs without login (rate-limited to 5/day by IP) |
| **Registered User** | Full access to create, update, delete, track their own URLs |
| **Admin** | Full system control — manage users, URLs, blocked links, platform analytics |

---

## 2. Core Modules

### 2.1 Authentication & User Management

#### Functional Requirements
- User registration with email + username uniqueness validation
- Secure login with JWT-based authentication (Access + Refresh tokens)
- Password encryption using BCrypt
- Role-based access control: `USER`, `ADMIN`
- Account status control: `ACTIVE`, `BLOCKED`, `DELETED`
- Email verification flow (send verification email + confirm via token)
- Forgot password / reset password flow (email-based token)
- Brute-force protection via failed login attempt tracking (lock after N failures)
- Multi-device session management with selective logout (revoke session by ID)
- Soft delete support for user accounts
- Google OAuth2 login (Phase 3 optional)

#### APIs — Auth Module (9 APIs)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| A1 | POST | `/api/v1/auth/register` | Register new user | No |
| A2 | POST | `/api/v1/auth/login` | Authenticate, receive access + refresh tokens | No |
| A3 | POST | `/api/v1/auth/refresh` | Refresh access token using refresh token | No (token in body) |
| A4 | POST | `/api/v1/auth/logout` | Invalidate current session | Yes |
| A5 | POST | `/api/v1/auth/forgot-password` | Trigger password reset email | No |
| A6 | POST | `/api/v1/auth/reset-password` | Confirm reset with token + new password | No |
| A7 | POST | `/api/v1/auth/verify-email/resend` | Resend verification email | Yes |
| A8 | GET | `/api/v1/auth/verify-email?token={token}` | Confirm email via token link | No |
| A9 | GET | `/api/v1/public/stats` | Public platform statistics for landing page | No |

---

### 2.2 User Profile Management

#### Functional Requirements
- View and edit own profile (full name, username, phone number)
- Change password (requires current password validation)
- Upload profile avatar/photo
- View all active sessions across devices
- Revoke individual sessions (logout from a specific device)
- Soft delete own account

#### APIs — User Profile Module (7 APIs)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| P1 | GET | `/api/v1/users/me` | Get current user profile | Yes |
| P2 | PUT | `/api/v1/users/me` | Update profile (fullName, username, phone) | Yes |
| P3 | PUT | `/api/v1/users/me/password` | Change password | Yes |
| P4 | POST | `/api/v1/users/me/avatar` | Upload profile avatar | Yes |
| P5 | GET | `/api/v1/users/me/sessions` | List all active sessions | Yes |
| P6 | DELETE | `/api/v1/users/me/sessions/{sessionId}` | Revoke a specific session | Yes |
| P7 | DELETE | `/api/v1/users/me` | Soft delete account | Yes |

---

### 2.3 URL Management

#### Functional Requirements
- Create short URL from any valid long URL
- Generate random short code using **Base62 Encoding** (0-9, a-z, A-Z, min 6 chars)
- Support custom aliases (unique, non-reusable even after deletion)
- Real-time alias availability check with debounce
- Validate URL format and block malicious/phishing URLs (regex + blocklist)
- Set optional expiry date (auto-disable via scheduled jobs)
- Enable/disable URL status manually
- Optional link password protection (hash stored in DB)
- QR code generation for each short URL (on-demand)
- Ownership validation (users manage only their own URLs)
- Bulk URL upload via CSV (Phase 6)
- Soft delete for URLs
- Guest URLs stored with `user_id = NULL`, rate-limited by IP

#### APIs — URL Module (7 APIs)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| U1 | POST | `/api/v1/urls` | Create short URL | Optional (guest allowed) |
| U2 | GET | `/api/v1/urls` | List user's URLs (paginated, filterable, searchable) | Yes |
| U3 | GET | `/api/v1/urls/{id}` | Get URL details by ID | Yes |
| U4 | PUT | `/api/v1/urls/{id}` | Update URL (alias, expiry, title, status) | Yes |
| U5 | DELETE | `/api/v1/urls/{id}` | Soft delete URL | Yes |
| U6 | GET | `/api/v1/urls/check-alias?alias={alias}` | Check alias availability | Optional |
| U7 | GET | `/api/v1/urls/{id}/qr` | Generate/download QR code image | Yes |

#### Sample Create Request / Response
```json
// POST /api/v1/urls
{
  "originalUrl": "https://example.com/products/spring-boot-course",
  "customAlias": "spring-course",
  "expiryDate": "2026-12-31T23:59:59",
  "title": "Spring Boot Course",
  "password": null,
  "generateQR": true
}

// Response 201
{
  "status": 201,
  "message": "Short URL created successfully",
  "data": {
    "id": 1,
    "originalUrl": "https://example.com/products/spring-boot-course",
    "shortCode": "spring-course",
    "shortUrl": "https://shortly.com/spring-course",
    "title": "Spring Boot Course",
    "expiryDate": "2026-12-31T23:59:59",
    "active": true,
    "passwordProtected": false,
    "totalClicks": 0,
    "uniqueClicks": 0,
    "qrCodeUrl": "https://shortly.com/api/v1/urls/1/qr",
    "createdAt": "2026-04-26T08:00:00"
  }
}
```

---

### 2.4 Redirection Engine (Performance Critical)

#### Functional Requirements
- **O(1) lookup** using `short_code` database index
- **Redis caching** for ultra-fast resolution (TTL aligned with expiry date)
- Graceful handling of expired, disabled, password-protected, or non-existent URLs
- Every valid redirect records click analytics **asynchronously** (non-blocking)
- IP masking in click logs (last octet hidden in display)

#### API — Redirection (1 API)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| R1 | GET | `/{shortCode}` | Redirect to original URL | No |

#### Business Rules

| Condition | HTTP Response |
|-----------|---------------|
| Short code does not exist | `404 Not Found` → Error screen |
| URL has expired | `410 Gone` → Expired screen |
| URL is disabled/blocked | `403 Forbidden` → Disabled screen |
| URL is password-protected | `200 OK` → Password prompt page |
| Password submitted correctly | `302 Found` → Redirect |
| Valid, active URL | `302 Found` → Redirect |

#### Redirection Flow
```
Request /{shortCode}
  → Check Redis cache for short_code
  → HIT: Validate status/expiry → redirect
  → MISS: Query PostgreSQL → store in Redis → redirect
  → Async: Fire-and-forget → record click analytics
```

---

### 2.5 Analytics Engine

#### Tracked Data per Click
- IP Address (partially masked in display)
- Browser (Chrome, Firefox, Edge, Safari, etc.)
- Operating System (Windows, macOS, Linux, Android, iOS)
- Device Type (Desktop, Mobile, Tablet)
- Geo Location (Country, City) via IP geolocation API
- Timestamp
- Referrer URL

#### APIs — Analytics Module (3 APIs)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| N1 | GET | `/api/v1/analytics/{urlId}` | Get aggregated analytics for a URL | Yes |
| N2 | GET | `/api/v1/analytics/dashboard` | Get user dashboard summary | Yes |
| N3 | GET | `/api/v1/analytics/{urlId}/clicks` | Get paginated raw click log records | Yes |

#### Analytics Response — N1
```json
{
  "totalClicks": 1245,
  "uniqueClicks": 895,
  "topBrowsers": [
    { "name": "Chrome", "count": 560, "percentage": 45.0 },
    { "name": "Safari", "count": 311, "percentage": 25.0 }
  ],
  "topDevices": [
    { "name": "Desktop", "count": 747, "percentage": 60.0 },
    { "name": "Mobile", "count": 436, "percentage": 35.0 }
  ],
  "topCountries": [
    { "country": "USA", "city": "New York", "count": 420 },
    { "country": "India", "city": "Mumbai", "count": 380 }
  ],
  "dailyClicks": [
    { "date": "2026-04-20", "clicks": 120, "uniqueClicks": 90 },
    { "date": "2026-04-21", "clicks": 145, "uniqueClicks": 105 }
  ],
  "referrers": [
    { "source": "twitter.com", "clicks": 450, "percentage": 36.1 },
    { "source": "Direct / None", "clicks": 320, "percentage": 25.7 }
  ]
}
```

---

### 2.6 Admin Panel

#### Functional Requirements
- View all registered users with status, role, and URL count
- Block/unblock user accounts (auto-disables their URLs)
- Change user roles (USER ↔ ADMIN)
- View user detail profile
- Hard delete user accounts
- View all URLs across the platform (searchable, filterable by owner/status)
- Disable/enable harmful or spam URLs
- Hard delete spam URLs
- View platform-wide analytics and charts
- View suspicious/flagged URLs alert list
- Bulk operations (block users, disable/delete URLs)
- Platform settings configuration (Phase 6)

#### APIs — Admin Module (12 APIs)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| M1 | GET | `/api/v1/admin/users` | List all users (paginated, filterable) | ADMIN |
| M2 | GET | `/api/v1/admin/users/{id}` | Get full user profile detail | ADMIN |
| M3 | PUT | `/api/v1/admin/users/{id}/block` | Toggle block/unblock user | ADMIN |
| M4 | PUT | `/api/v1/admin/users/{id}/role` | Update user role | ADMIN |
| M5 | DELETE | `/api/v1/admin/users/{id}` | Hard delete user account | ADMIN |
| M6 | PUT | `/api/v1/admin/users/bulk/block` | Bulk block selected users | ADMIN |
| M7 | GET | `/api/v1/admin/urls` | List all URLs (paginated, filterable) | ADMIN |
| M8 | PUT | `/api/v1/admin/urls/{id}/disable` | Toggle disable/enable URL | ADMIN |
| M9 | DELETE | `/api/v1/admin/urls/{id}` | Hard delete spam URL | ADMIN |
| M10 | DELETE | `/api/v1/admin/urls/bulk` | Bulk delete selected URLs | ADMIN |
| M11 | PUT | `/api/v1/admin/urls/bulk/disable` | Bulk disable selected URLs | ADMIN |
| M12 | GET | `/api/v1/admin/dashboard` | Platform analytics summary | ADMIN |

---

## 3. Database Design

### 3.1 Users Table
```sql
CREATE TABLE users (
    id                      BIGSERIAL PRIMARY KEY,

    -- Identity
    username                VARCHAR(50) UNIQUE NOT NULL,
    email                   VARCHAR(150) UNIQUE NOT NULL,
    password_hash           VARCHAR(255) NOT NULL,

    -- Profile
    full_name               VARCHAR(150),
    phone_number            VARCHAR(20),
    avatar_url              VARCHAR(500),

    -- Role & Access
    role                    VARCHAR(20) NOT NULL DEFAULT 'USER', -- USER | ADMIN
    status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | BLOCKED | DELETED

    -- Security
    email_verified          BOOLEAN DEFAULT FALSE,
    failed_login_attempts   INT DEFAULT 0,
    last_login_at           TIMESTAMP,

    -- Audit
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Soft Delete
    deleted                 BOOLEAN DEFAULT FALSE,
    deleted_at              TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
```

### 3.2 User Sessions Table
```sql
CREATE TABLE user_sessions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   TEXT NOT NULL UNIQUE,
    device_info     VARCHAR(255),
    ip_address      VARCHAR(100),
    location        VARCHAR(200),
    is_active       BOOLEAN DEFAULT TRUE,
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON user_sessions(refresh_token);
```

### 3.3 Email Verification Tokens Table
```sql
CREATE TABLE email_verification_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    used        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.4 Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    used        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.5 URLs Table
```sql
CREATE TABLE urls (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL, -- NULL = guest

    original_url    TEXT NOT NULL,
    short_code      VARCHAR(50) UNIQUE NOT NULL,
    title           VARCHAR(150),

    active          BOOLEAN DEFAULT TRUE,
    deleted         BOOLEAN DEFAULT FALSE,
    expiry_date     TIMESTAMP,
    password_hash   VARCHAR(255),           -- optional link password

    total_clicks    BIGINT DEFAULT 0,
    unique_clicks   BIGINT DEFAULT 0,

    -- Flags
    suspicious      BOOLEAN DEFAULT FALSE,
    suspicious_reason VARCHAR(255),

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_short_code ON urls(short_code);
CREATE INDEX idx_url_user_id ON urls(user_id);
CREATE INDEX idx_url_expiry_date ON urls(expiry_date);
CREATE INDEX idx_url_active ON urls(active);
```

### 3.6 URL Clicks Table
```sql
CREATE TABLE url_clicks (
    id              BIGSERIAL PRIMARY KEY,
    url_id          BIGINT NOT NULL REFERENCES urls(id) ON DELETE CASCADE,

    ip_address      VARCHAR(100),
    browser         VARCHAR(100),
    os              VARCHAR(100),
    device_type     VARCHAR(50),    -- Desktop | Mobile | Tablet

    referrer        TEXT,
    country         VARCHAR(100),
    city            VARCHAR(100),

    clicked_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_url_clicks_url_id ON url_clicks(url_id);
CREATE INDEX idx_url_clicks_clicked_at ON url_clicks(clicked_at);
CREATE INDEX idx_url_clicks_ip ON url_clicks(ip_address);
```

---

## 4. Technology Stack

### 4.1 Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 | Programming language |
| Spring Boot | 4.x | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | Latest | Database access (ORM) |
| JWT (jjwt) | 0.12.x | Token-based authentication |
| PostgreSQL | 15+ | Primary relational database |
| Redis | 7.x | URL caching & session store |
| Flyway | 9.x | Database migrations |
| Springdoc OpenAPI | 3.x | Swagger UI & API documentation |
| Lombok | Latest | Boilerplate reduction |
| Spring Mail | Latest | Email verification & reset |
| Docker | Latest | Containerization |

### 4.2 Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| ReactJS | 18.x | UI framework |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| React Router | 6.x | Client-side routing |
| TanStack Query | 5.x | Server state management & caching |
| Axios | 1.x | HTTP client with interceptors |
| Zustand | 4.x | Global state management |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| Recharts | 2.x | Analytics charts |
| Headless UI | 1.x | Accessible UI primitives |
| Heroicons | 2.x | Icon set |

---

## 5. Architecture

### 5.1 Backend Package Structure
```
com.aryan.project.smarturlshortner
 ├── auth/
 │   ├── controller/    (AuthController)
 │   ├── service/       (AuthService, AuthServiceImpl)
 │   ├── dto/           (LoginRequest, RegisterRequest, TokenResponse...)
 │   └── entity/        (EmailVerificationToken, PasswordResetToken)
 ├── user/
 │   ├── controller/    (UserController)
 │   ├── service/       (UserService, UserServiceImpl)
 │   ├── repository/    (UserRepository, UserSessionRepository)
 │   ├── dto/           (UserProfileResponse, UpdateProfileRequest...)
 │   └── entity/        (User, UserSession)
 ├── url/
 │   ├── controller/    (UrlController, RedirectController)
 │   ├── service/       (UrlService, UrlServiceImpl, Base62Service)
 │   ├── repository/    (UrlRepository)
 │   ├── dto/           (CreateUrlRequest, UrlResponse, AliasCheckResponse...)
 │   └── entity/        (Url)
 ├── analytics/
 │   ├── controller/    (AnalyticsController)
 │   ├── service/       (AnalyticsService, AnalyticsServiceImpl, ClickTrackingService)
 │   ├── repository/    (UrlClickRepository)
 │   ├── dto/           (AnalyticsResponse, ClickLogResponse, DashboardStatsResponse...)
 │   └── entity/        (UrlClick)
 ├── admin/
 │   ├── controller/    (AdminUserController, AdminUrlController, AdminDashboardController)
 │   ├── service/       (AdminService, AdminServiceImpl)
 │   └── dto/           (AdminUserResponse, AdminUrlResponse, PlatformStatsResponse...)
 ├── public/
 │   └── controller/    (PublicController — public stats, redirect)
 ├── security/
 │   ├── JwtAuthFilter.java
 │   ├── JwtTokenProvider.java
 │   ├── SecurityConfig.java
 │   └── UserDetailsServiceImpl.java
 ├── exception/
 │   ├── GlobalExceptionHandler.java
 │   ├── ResourceNotFoundException.java
 │   ├── UnauthorizedException.java
 │   ├── AliasAlreadyTakenException.java
 │   └── RateLimitExceededException.java
 ├── config/
 │   ├── RedisConfig.java
 │   ├── SwaggerConfig.java
 │   ├── CorsConfig.java
 │   └── MailConfig.java
 ├── common/
 │   ├── ApiResponse.java
 │   ├── PageResponse.java
 │   └── RateLimiter.java
 └── scheduler/
     ├── ExpiredUrlCleanupJob.java
     └── AnalyticsAggregationJob.java
```

### 5.2 Frontend Project Structure
```
src/
 ├── api/               (axios instance + API function definitions)
 ├── components/
 │   ├── common/        (Button, Input, Modal, Toast, DataTable, Spinner, Badge)
 │   ├── layout/        (Navbar, Sidebar, Footer, PageShell)
 │   └── features/      (UrlCard, AnalyticsChart, StatsCard, QRCodeDisplay...)
 ├── pages/
 │   ├── public/        (LandingPage, LoginPage, RegisterPage)
 │   ├── auth/          (ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage)
 │   ├── user/          (DashboardPage, MyUrlsPage, CreateUrlPage, EditUrlPage,
 │   │                   AnalyticsPage, ProfilePage)
 │   ├── admin/         (AdminDashboardPage, AdminUsersPage, AdminUrlsPage)
 │   └── error/         (NotFoundPage, ExpiredPage, DisabledPage, PasswordPromptPage)
 ├── store/             (authStore, urlStore, analyticsStore — Zustand)
 ├── hooks/             (useAuth, useDebounce, useCopyToClipboard, usePagination)
 ├── utils/             (formatDate, formatNumber, truncateUrl, parseUserAgent)
 └── router/            (AppRouter, ProtectedRoute, AdminRoute, GuestRedirect)
```

### 5.3 Key Patterns
- **DTO-based** request/response models (no entity exposure)
- **Global exception handling** with clear 400 / 401 / 403 / 404 / 409 / 500 distinction
- **JWT authentication filter** — access token (15 min) + refresh token (30 days)
- **BCrypt** password hashing
- **Base62 encoding** for guaranteed-unique, short code generation
- **Redis caching** with TTL for O(1) short-code lookup
- **Async click tracking** with `@Async` Spring annotation
- **@Scheduled jobs** for expired URL cleanup + analytics aggregation
- **Rate limiting** (IP-based for guests, user-based for registered users)
- **Pagination** on all list endpoints

### 5.4 Short Code Generation (Base62)
```
1. Get auto-incremented ID from DB sequence
2. Encode ID using Base62 (chars: 0-9, a-z, A-Z)
3. Result: guaranteed uniqueness + 6-character minimum
```

### 5.5 Redis Cache Strategy
```
Key:   url:shortcode:{shortCode}
Value: serialized UrlCacheDTO (originalUrl, active, expiryDate, passwordProtected)
TTL:   matches URL expiry date or 24h default
```

---

## 6. Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Authentication | JWT access token (15 min) + refresh token (30 days) |
| Password Storage | BCrypt hashing (strength 12) |
| Authorization | Role-based access control (RBAC) — USER / ADMIN |
| Input Validation | DTO-level Bean Validation + Zod (frontend) |
| URL Safety | Regex URL validation + malicious domain blocklist |
| Rate Limiting | 5 URLs/day for guests (IP-based), configurable for users |
| CORS | Strict origin whitelist (frontend domain only) |
| Admin Protection | Admin-only endpoints secured with `@PreAuthorize("hasRole('ADMIN')")` |
| Session Security | Refresh token rotation, device tracking, selective revoke |
| Brute Force | Failed login attempt tracking, account lockout after 5 attempts |
| Email Verification | Required for full account activation |
| IP Masking | Last octet masked in click logs display |

---

## 7. API Response Format (Standardized)

### Success Response
```json
{
  "status": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

### Paginated List Response
```json
{
  "status": 200,
  "message": "URLs retrieved successfully",
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 10,
    "totalElements": 24,
    "totalPages": 3,
    "last": false
  }
}
```

### Error Response
```json
{
  "status": 404,
  "message": "URL not found",
  "error": "ResourceNotFoundException",
  "timestamp": "2026-04-26T08:00:00"
}
```

---

## 8. Business Rules

1. Short code must be **globally unique** — enforced at DB level with UNIQUE constraint
2. Custom alias **cannot be reused** even after soft-delete
3. Expired URLs (`expiry_date < NOW()`) **must not redirect** (return 410)
4. Disabled URLs (`active = FALSE`) **must not redirect** (return 403)
5. Guest users can create maximum **5 URLs/day** by IP (rate-limited)
6. Registered users can manage **only their own URLs** (ownership check in service layer)
7. Admin can manage **all URLs and all users**
8. Every valid redirect **must create a click record** asynchronously
9. Invalid/malicious URLs **must be rejected at creation** with 400 error
10. Passwords **must be stored BCrypt-hashed** only
11. Soft-deleted users (`deleted = TRUE`) **must not be able to log in**
12. Blocked users (`status = BLOCKED`) **must have all their URLs auto-disabled** on block
13. Soft-deleted URLs are **not shown** in user lists (no restore feature)
14. Guest URL (user_id = NULL) is stored in DB, managed by IP identity
15. Analytics click counts are **aggregated asynchronously** and updated on the URL record

---

## 9. Development Phases

### Phase 1 — Foundation
- [x] Initialize Spring Boot project with dependencies
- [ ] Initialize React + Vite + Tailwind project
- [ ] Design database schema + Flyway migrations
- [ ] Implement URL entity + Base62 short code generation
- [ ] Build redirect endpoint with fallback logic
- [ ] Build landing page with shorten form

### Phase 2 — Authentication
- [ ] User registration + login (JWT)
- [ ] Access + refresh token lifecycle
- [ ] User session management
- [ ] RBAC implementation
- [ ] Protected routes in React + Zustand auth store
- [ ] Email verification flow

### Phase 3 — URL Management
- [ ] Full CRUD for URLs
- [ ] Custom alias + alias availability check
- [ ] Expiry date handling + scheduled cleanup job
- [ ] User dashboard + My URLs page
- [ ] Search, filter, pagination

### Phase 4 — Analytics
- [ ] Async click tracking (IP, browser, OS, device, geo, referrer)
- [ ] Analytics aggregation API
- [ ] Recharts dashboard components
- [ ] Raw click logs API + Recent Clicks table

### Phase 5 — Performance & Security
- [ ] Redis caching for redirect O(1)
- [ ] Rate limiting (guest + user)
- [ ] URL malicious detection + blocklist
- [ ] QR code generation
- [ ] @Scheduled background jobs

### Phase 6 — Admin & Advanced
- [ ] Full admin panel (users + URLs + dashboard)
- [ ] User profile page + session management
- [ ] Forgot/reset password flow
- [ ] Link password protection
- [ ] Bulk URL upload (CSV)
- [ ] Bulk admin operations

### Phase 7 — Production
- [ ] Dockerize backend + frontend
- [ ] Nginx reverse proxy + HTTPS/SSL
- [ ] Swagger API documentation complete
- [ ] Deploy to cloud (AWS / GCP / Railway)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring with Spring Actuator

---

## 10. Complete API Inventory Summary

| Module | Count | Endpoints |
|--------|-------|-----------|
| Auth | 9 | A1–A9 |
| User Profile | 7 | P1–P7 |
| URL Management | 7 | U1–U7 |
| Redirection | 1 | R1 |
| Analytics | 3 | N1–N3 |
| Admin | 12 | M1–M12 |
| **Total** | **39** | |

---

## 11. Screen Inventory Summary

| Category | Route | Screen |
|----------|-------|--------|
| Public | `/` | Landing Page |
| Public | `/login` | Login Page |
| Public | `/register` | Register Page |
| Auth | `/forgot-password` | Forgot Password Page |
| Auth | `/reset-password?token=` | Reset Password Page |
| Auth | `/verify-email?token=` | Email Verification Page |
| User | `/dashboard` | User Dashboard |
| User | `/urls` | My URLs (List, Search, Filter) |
| User | `/urls/new` | Create Short URL |
| User | `/urls/:id/edit` | Edit URL |
| User | `/urls/:id/analytics` | URL Analytics Detail |
| User | `/profile` | User Profile + Sessions |
| Admin | `/admin/dashboard` | Admin Dashboard |
| Admin | `/admin/users` | Admin User Management |
| Admin | `/admin/urls` | Admin URL Management |
| Admin | `/admin/settings` | Platform Settings (Phase 6) |
| Error | `/error/404` | Short Code Not Found |
| Error | `/error/410` | URL Expired |
| Error | `/error/403` | URL Disabled |
| Special | `/{shortCode}/unlock` | Password Prompt Page |
| **Total** | **20 screens** | |

---

## 12. Resolved Gap Analysis Items

The following mismatches from the original BRD vs Frontend Design have been resolved in this final BRD:

| Gap | Resolution |
|-----|------------|
| User Profile APIs missing | Added P1–P7 (7 APIs) |
| Alias availability check missing | Added U6 (`GET /urls/check-alias`) |
| Raw click logs API missing | Added N3 (`GET /analytics/{urlId}/clicks`) |
| Public stats API for landing page | Added A9 (`GET /public/stats`) |
| Forgot/Reset password APIs missing | Added A5, A6 |
| Email verification APIs missing | Added A7, A8 |
| QR code generation API | Added U7 (`GET /urls/{id}/qr`) |
| Admin user detail / role APIs missing | Added M2, M4 |
| Admin hard delete user missing | Added M5 |
| Bulk admin operations missing | Added M6, M10, M11 |
| URL password update API | Handled via U4 (PUT includes password field) |
| Error pages (404, 410, 403) | Added to screen inventory + redirection logic |
| Forgot/Reset password pages | Added to screen inventory |
| URL Password Prompt page | Added as `/{shortCode}/unlock` screen |
| Admin settings page | Added to screen inventory (Phase 6) |
| Analytics endpoint standardized | Standardized to `GET /api/v1/analytics/{urlId}` |
| Soft delete restore ambiguity | Clarified: no restore; deleted URLs not shown |

---

*Final Master BRD — Version 2.0 — April 2026*
*Ready for implementation after team review.*
