# Smart URL Shortener Platform — Final Backend API Specification

**Version:** 2.0 (Final — Production Ready)
**Date:** April 2026
**Base URL:** `http://localhost:8080` (dev) | `https://api.shortly.com` (prod)
**API Version Prefix:** `/api/v1`
**Framework:** Java 21 + Spring Boot 4.x + Spring Security + Spring Data JPA
**Auth:** JWT Bearer Token (Access Token: 15 min, Refresh Token: 30 days)
**Documentation:** Swagger UI at `/swagger-ui.html`

---

## Global Standards

### Request Headers
```
Content-Type:  application/json
Authorization: Bearer {access_token}   ← Required on all protected endpoints
```

### Standard Success Response
```json
{
  "status": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "status": 200,
  "message": "Data retrieved successfully",
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10,
    "last": false
  }
}
```

### Error Response
```json
{
  "status": 404,
  "message": "Resource not found",
  "error": "ResourceNotFoundException",
  "timestamp": "2026-04-26T08:00:00",
  "path": "/api/v1/urls/999"
}
```

### HTTP Status Code Usage
| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation failure) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (wrong role, disabled URL) |
| 404 | Not Found |
| 409 | Conflict (duplicate alias, email taken) |
| 410 | Gone (expired URL) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## Module A — Authentication

### A1. Register
```
POST /api/v1/auth/register
Auth: None

Request Body:
{
  "fullName":    "John Doe",              // string, 2–150 chars
  "username":    "johndoe",              // string, 3–50 chars, [a-zA-Z0-9_] only
  "email":       "john@example.com",     // valid email, unique
  "password":    "SecurePass1"           // min 8 chars, 1 upper, 1 lower, 1 digit
}

Response 201:
{
  "status": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "id":        1,
    "username":  "johndoe",
    "email":     "john@example.com",
    "fullName":  "John Doe",
    "role":      "USER",
    "emailVerified": false,
    "createdAt": "2026-04-26T08:00:00"
  }
}

Errors:
  409 — Email already registered
  409 — Username already taken
  400 — Validation failure (field-level errors)

Side Effects:
  - Sends verification email with token link
  - Creates user with status=ACTIVE, emailVerified=false
```

### A2. Login
```
POST /api/v1/auth/login
Auth: None

Request Body:
{
  "email":    "john@example.com",
  "password": "SecurePass1"
}

Response 200:
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "accessToken":        "eyJhbGciOi...",
    "refreshToken":       "eyJhbGciOi...",
    "tokenType":          "Bearer",
    "accessTokenExpiry":  900,           // seconds = 15 min
    "refreshTokenExpiry": 2592000,       // seconds = 30 days
    "user": {
      "id":           1,
      "username":     "johndoe",
      "email":        "john@example.com",
      "fullName":     "John Doe",
      "role":         "USER",
      "avatarUrl":    null,
      "emailVerified": true
    }
  }
}

Errors:
  401 — Invalid email or password
  403 — Account is blocked
  403 — Account is deleted
  423 — Account locked (too many failed attempts) → includes retryAfterSeconds

Side Effects:
  - Increments failed_login_attempts on failure
  - Resets failed_login_attempts on success
  - Creates a new user_sessions record
  - Updates last_login_at
```

### A3. Refresh Token
```
POST /api/v1/auth/refresh
Auth: None (refresh token in body — NOT Authorization header)

Request Body:
{
  "refreshToken": "eyJhbGciOi..."
}

Response 200:
{
  "status": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken":       "eyJhbGciOi...(new)",
    "refreshToken":      "eyJhbGciOi...(rotated)",
    "tokenType":         "Bearer",
    "accessTokenExpiry": 900
  }
}

Errors:
  401 — Refresh token invalid or expired
  401 — Session has been revoked

Business Rule:
  - Refresh token is rotated on use (old invalidated, new issued)
```

### A4. Logout
```
POST /api/v1/auth/logout
Auth: Bearer (access token)

Request Body:
{
  "refreshToken": "eyJhbGciOi..."    // session to invalidate
}

Response 200:
{
  "status": 200,
  "message": "Logged out successfully",
  "data": null
}

Side Effects:
  - Marks the user_session record as is_active=false
  - Tokens are effectively invalidated
```

### A5. Forgot Password
```
POST /api/v1/auth/forgot-password
Auth: None

Request Body:
{
  "email": "john@example.com"
}

Response 200:
{
  "status": 200,
  "message": "If an account with that email exists, a reset link has been sent.",
  "data": null
}

Notes:
  - Always returns 200 regardless of whether email exists (prevents email enumeration)
  - Token valid for 30 minutes
  - Only one active token per user (previous ones invalidated)

Side Effects:
  - Creates password_reset_tokens record
  - Sends email with link: https://shortly.com/reset-password?token={token}
```

### A6. Reset Password
```
POST /api/v1/auth/reset-password
Auth: None

Request Body:
{
  "token":           "abc123xyz",        // from email link
  "newPassword":     "NewSecure1",       // min 8, 1 upper, 1 lower, 1 digit
  "confirmPassword": "NewSecure1"
}

Response 200:
{
  "status": 200,
  "message": "Password reset successfully. Please log in.",
  "data": null
}

Errors:
  400 — Token is invalid or expired
  400 — Passwords do not match
  400 — Password does not meet strength requirements

Side Effects:
  - Updates user.password_hash
  - Marks token as used
  - Invalidates ALL existing sessions for that user (security)
```

### A7. Resend Verification Email
```
POST /api/v1/auth/verify-email/resend
Auth: Bearer

Request Body: (none)

Response 200:
{
  "status": 200,
  "message": "Verification email sent.",
  "data": null
}

Errors:
  400 — Email already verified

Side Effects:
  - Invalidates previous verification token
  - Creates new email_verification_tokens record
  - Sends email with link: https://shortly.com/verify-email?token={token}
```

### A8. Verify Email
```
GET /api/v1/auth/verify-email?token={token}
Auth: None

Response 200:
{
  "status": 200,
  "message": "Email verified successfully.",
  "data": {
    "emailVerified": true
  }
}

Errors:
  400 — Token invalid or expired
  400 — Token already used

Side Effects:
  - Sets user.email_verified = true
  - Marks token as used
```

### A9. Public Stats
```
GET /api/v1/public/stats
Auth: None

Response 200:
{
  "status": 200,
  "message": "Platform statistics",
  "data": {
    "totalUrls":   1000000,
    "totalClicks": 50000000,
    "totalUsers":  10000
  }
}

Notes:
  - Cached in Redis (TTL: 1 hour) — do not query DB on every call
```

---

## Module P — User Profile

### P1. Get Current User Profile
```
GET /api/v1/users/me
Auth: Bearer (USER, ADMIN)

Response 200:
{
  "status": 200,
  "message": "Profile retrieved",
  "data": {
    "id":           1,
    "username":     "johndoe",
    "email":        "john@example.com",
    "fullName":     "John Doe",
    "phoneNumber":  "+1 (555) 123-4567",
    "avatarUrl":    "https://cdn.shortly.com/avatars/1.png",
    "role":         "USER",
    "status":       "ACTIVE",
    "emailVerified": true,
    "createdAt":    "2026-04-01T10:00:00",
    "lastLoginAt":  "2026-04-26T08:00:00"
  }
}
```

### P2. Update Profile
```
PUT /api/v1/users/me
Auth: Bearer (USER, ADMIN)

Request Body (all fields optional):
{
  "fullName":    "John Updated",
  "username":    "john_new",          // must be unique
  "phoneNumber": "+44 7911 123456"
}

Response 200:
{
  "status": 200,
  "message": "Profile updated successfully",
  "data": { ...updated user profile... }
}

Errors:
  409 — Username already taken
  400 — Validation failure

Notes:
  - Email cannot be changed via this endpoint (separate flow)
```

### P3. Change Password
```
PUT /api/v1/users/me/password
Auth: Bearer (USER, ADMIN)

Request Body:
{
  "currentPassword":  "OldPass1",
  "newPassword":      "NewPass1",
  "confirmPassword":  "NewPass1"
}

Response 200:
{
  "status": 200,
  "message": "Password changed successfully",
  "data": null
}

Errors:
  400 — Current password is incorrect
  400 — New password same as current password
  400 — Passwords do not match
  400 — Password too weak

Side Effects:
  - Invalidates all other sessions (user must re-login on other devices)
```

### P4. Upload Avatar
```
POST /api/v1/users/me/avatar
Auth: Bearer (USER, ADMIN)
Content-Type: multipart/form-data

Form Fields:
  avatar: (file) — JPEG, PNG, WebP — max 2MB

Response 200:
{
  "status": 200,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "https://cdn.shortly.com/avatars/1_v2.png"
  }
}

Errors:
  400 — File format not supported
  400 — File too large (> 2MB)
```

### P5. Get Active Sessions
```
GET /api/v1/users/me/sessions
Auth: Bearer (USER, ADMIN)

Response 200:
{
  "status": 200,
  "message": "Sessions retrieved",
  "data": [
    {
      "id":          5,
      "deviceInfo":  "Chrome on Windows",
      "ipAddress":   "192.168.1.***",
      "location":    "New York, USA",
      "isCurrent":   true,           // true for the session matching this request's token
      "lastActiveAt": "2026-04-26T08:00:00",
      "createdAt":   "2026-04-01T10:00:00"
    },
    {
      "id":          8,
      "deviceInfo":  "Safari on iPhone",
      "ipAddress":   "203.0.113.***",
      "location":    "Mumbai, India",
      "isCurrent":   false,
      "lastActiveAt": "2026-04-25T06:00:00",
      "createdAt":   "2026-04-10T12:00:00"
    }
  ]
}

Notes:
  - Only returns active (is_active=true) sessions
  - IP last octet is masked
```

### P6. Revoke Session
```
DELETE /api/v1/users/me/sessions/{sessionId}
Auth: Bearer (USER, ADMIN)
Path Param: sessionId (Long)

Response 200:
{
  "status": 200,
  "message": "Session revoked",
  "data": null
}

Errors:
  404 — Session not found or does not belong to current user
  400 — Cannot revoke current session (use /logout instead)
```

### P7. Delete Account
```
DELETE /api/v1/users/me
Auth: Bearer (USER, ADMIN)

Request Body:
{
  "password": "CurrentPass1"    // Confirm identity before delete
}

Response 200:
{
  "status": 200,
  "message": "Account scheduled for deletion",
  "data": null
}

Side Effects:
  - Sets user.deleted = true, user.deleted_at = NOW()
  - Sets user.status = 'DELETED'
  - Invalidates ALL sessions
  - Soft-deletes all user's URLs
```

---

## Module U — URL Management

### U1. Create Short URL
```
POST /api/v1/urls
Auth: Optional (guest or Bearer)

Request Body:
{
  "originalUrl":   "https://example.com/long/path",   // required, valid URL
  "customAlias":   "my-alias",   // optional, 3-50 chars, [a-zA-Z0-9_-]
  "title":         "My Link",    // optional, max 150 chars
  "expiryDate":    "2026-12-31T23:59:59",  // optional, must be future
  "password":      "link-pass",  // optional, min 4 chars (stored BCrypt-hashed)
  "generateQR":    true          // optional, default false
}

Response 201:
{
  "status": 201,
  "message": "Short URL created successfully",
  "data": {
    "id":               1,
    "originalUrl":      "https://example.com/long/path",
    "shortCode":        "my-alias",
    "shortUrl":         "https://shortly.com/my-alias",
    "title":            "My Link",
    "active":           true,
    "passwordProtected": false,
    "expiryDate":       "2026-12-31T23:59:59",
    "totalClicks":      0,
    "uniqueClicks":     0,
    "qrCodeUrl":        "https://shortly.com/api/v1/urls/1/qr",  // if generateQR=true
    "createdAt":        "2026-04-26T08:00:00"
  }
}

Errors:
  400 — Invalid URL format
  400 — URL is malicious/blocked
  400 — Expiry date is in the past
  409 — Custom alias already taken (even if soft-deleted)
  429 — Guest rate limit exceeded (5/day by IP)

Business Rules:
  - If customAlias provided: use it as short_code
  - If not: auto-generate via Base62(sequenceId), min 6 chars
  - guest user_id = NULL; validated by IP
```

### U2. List User's URLs
```
GET /api/v1/urls
Auth: Bearer (USER, ADMIN)

Query Parameters:
  page=0         (default 0)
  size=10        (default 10, max 50)
  search=        (search in short_code, title, original_url)
  status=        (ACTIVE | EXPIRED | DISABLED)
  sort=          (createdAt,desc | createdAt,asc | totalClicks,desc | totalClicks,asc)

Response 200 (Paginated):
{
  "status": 200,
  "message": "URLs retrieved successfully",
  "data": {
    "content": [
      {
        "id":               1,
        "originalUrl":      "https://example.com/...",
        "shortCode":        "abc123",
        "shortUrl":         "https://shortly.com/abc123",
        "title":            "My Course Link",
        "active":           true,
        "passwordProtected": false,
        "expiryDate":       "2026-12-31T23:59:59",
        "totalClicks":      1245,
        "uniqueClicks":     895,
        "createdAt":        "2026-04-01T10:00:00",
        "updatedAt":        "2026-04-25T08:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 24,
    "totalPages": 3,
    "last": false
  }
}

Notes:
  - Returns only non-deleted URLs (deleted=false) belonging to the auth user
  - STATUS filter: ACTIVE = active&!expired, EXPIRED = expiry < now, DISABLED = active=false
```

### U3. Get URL by ID
```
GET /api/v1/urls/{id}
Auth: Bearer (USER, ADMIN)
Path Param: id (Long)

Response 200:
{
  "status": 200,
  "message": "URL retrieved",
  "data": {    // same as URLResponse above, full object
    "id": 1, "originalUrl": "...", "shortCode": "...",
    "shortUrl": "...", "title": "...", "active": true,
    "passwordProtected": false, "expiryDate": "...",
    "totalClicks": 1245, "uniqueClicks": 895,
    "qrCodeUrl": "...", "createdAt": "...", "updatedAt": "..."
  }
}

Errors:
  404 — URL not found
  403 — URL does not belong to current user (unless ADMIN)
```

### U4. Update URL
```
PUT /api/v1/urls/{id}
Auth: Bearer (USER, ADMIN)
Path Param: id (Long)

Request Body (all fields optional — only included fields are updated):
{
  "title":      "Updated Title",
  "expiryDate": "2027-06-30T23:59:59",   // null to remove expiry
  "active":     false,                    // enable/disable
  "password":   "new-password"            // null to remove password
}

Response 200:
{
  "status": 200,
  "message": "URL updated successfully",
  "data": { ...updated URLResponse... }
}

Errors:
  404 — URL not found
  403 — Not owner (unless ADMIN)
  400 — Expiry date in the past

Notes:
  - Original URL and shortCode are immutable after creation
  - If password=null explicitly sent, password protection is removed
  - Redis cache is invalidated on update
```

### U5. Delete URL (Soft Delete)
```
DELETE /api/v1/urls/{id}
Auth: Bearer (USER, ADMIN)
Path Param: id (Long)

Response 200:
{
  "status": 200,
  "message": "URL deleted successfully",
  "data": null
}

Errors:
  404 — URL not found
  403 — Not owner (unless ADMIN)

Side Effects:
  - Sets urls.deleted = true
  - Removes from Redis cache
  - shortCode remains reserved (cannot reuse)
```

### U6. Check Alias Availability
```
GET /api/v1/urls/check-alias?alias={alias}
Auth: Optional

Query Param:
  alias: string — alias to check

Response 200:
{
  "status": 200,
  "message": "Alias availability checked",
  "data": {
    "alias":     "my-alias",
    "available": true          // false if taken or reserved
  }
}

Errors:
  400 — Alias format invalid (wrong chars, too short/long)

Notes:
  - Checks both active AND soft-deleted URLs (alias is permanently reserved)
  - Reserved words: ["api", "admin", "login", "register", "dashboard", "urls", "error", "public"]
```

### U7. Get QR Code
```
GET /api/v1/urls/{id}/qr
Auth: Bearer (USER, ADMIN)
Path Param: id (Long)

Response 200:
  Content-Type: image/png
  Body: PNG binary image of QR code (300x300px by default)

  OR if JSON preferred:
  {
    "status": 200,
    "message": "QR code generated",
    "data": {
      "qrCodeBase64": "iVBORw0KGgo..."   // base64-encoded PNG
    }
  }

Query Params:
  format=png | json (default: png)
  size=300          (px, default 300)

Errors:
  404 — URL not found
  403 — Not owner (unless ADMIN)
```

---

## Module R — Redirection Engine

### R1. Redirect Short Code
```
GET /{shortCode}
Auth: None
Path Param: shortCode (String)

Outcomes:
  302 Found       — valid URL → Location: {originalUrl}
  307 Temporary   — password-protected → Location: /{shortCode}/unlock
  404 Not Found   — code does not exist
  410 Gone        — URL has expired
  403 Forbidden   — URL is disabled/blocked

Response Layout:
  For redirect:     HTTP 302 + Location header
  For errors:       Redirect to frontend error pages OR serve error JSON

Headers on success:
  Location:         https://original-url.com/path
  Cache-Control:    no-store, no-cache
  X-Redirected-By:  Shortly/2.0

Async Side Effect:
  - Parses User-Agent header → browser, OS, device type
  - Reads IP → geo-locates (country, city)
  - Reads Referer header
  - Fires async click record creation (does not block redirect)
  - Redis cache checked first; DB on miss; result stored in Redis
```

### R1b. Verify Password & Redirect
```
POST /{shortCode}/verify
Auth: None

Request Body:
{
  "password": "link-password"
}

Response 302 — correct password → Location: {originalUrl}
Response 401 — wrong password:
{
  "status": 401,
  "message": "Incorrect password",
  "data": null
}
```

---

## Module N — Analytics

### N1. Get URL Analytics (Aggregated)
```
GET /api/v1/analytics/{urlId}
Auth: Bearer (USER, ADMIN)
Path Param: urlId (Long)

Query Params:
  range=7d | 30d | all    (default: 30d)

Response 200:
{
  "status": 200,
  "message": "Analytics retrieved",
  "data": {
    "urlId":         1,
    "shortCode":     "spring-course",
    "totalClicks":   1245,
    "uniqueClicks":  895,

    "dailyClicks": [
      { "date": "2026-04-20", "clicks": 120, "uniqueClicks": 90 },
      { "date": "2026-04-21", "clicks": 145, "uniqueClicks": 105 }
    ],

    "topBrowsers": [
      { "name": "Chrome",  "count": 560, "percentage": 45.0 },
      { "name": "Safari",  "count": 311, "percentage": 25.0 },
      { "name": "Firefox", "count": 187, "percentage": 15.0 },
      { "name": "Edge",    "count": 125, "percentage": 10.0 },
      { "name": "Other",   "count":  62, "percentage":  5.0 }
    ],

    "topDevices": [
      { "name": "Desktop", "count": 747, "percentage": 60.0 },
      { "name": "Mobile",  "count": 436, "percentage": 35.0 },
      { "name": "Tablet",  "count":  62, "percentage":  5.0 }
    ],

    "topCountries": [
      { "country": "USA",     "city": "New York", "count": 420, "uniqueCount": 310, "percentage": 33.7 },
      { "country": "India",   "city": "Mumbai",   "count": 380, "uniqueCount": 290, "percentage": 30.5 },
      { "country": "UK",      "city": "London",   "count": 180, "uniqueCount": 140, "percentage": 14.5 }
    ],

    "topReferrers": [
      { "source": "twitter.com",   "clicks": 450, "percentage": 36.1, "trend": 12.0 },
      { "source": "Direct / None", "clicks": 320, "percentage": 25.7, "trend": -5.0 },
      { "source": "facebook.com",  "clicks": 180, "percentage": 14.5, "trend":  8.0 }
    ]
  }
}

Errors:
  404 — URL not found
  403 — Not owner (unless ADMIN)
```

### N2. User Dashboard Stats
```
GET /api/v1/analytics/dashboard
Auth: Bearer (USER, ADMIN)

Response 200:
{
  "status": 200,
  "message": "Dashboard statistics",
  "data": {
    "totalUrls":     24,
    "totalClicks":   1245,
    "activeUrls":    18,
    "expiredUrls":    6,
    "disabledUrls":   1,
    "clickTrend":    12.5,     // % change vs previous 7 days

    "dailyClicks": [
      { "date": "2026-04-20", "clicks": 120 },
      { "date": "2026-04-21", "clicks": 145 },
      { "date": "2026-04-22", "clicks":  98 },
      { "date": "2026-04-23", "clicks": 134 },
      { "date": "2026-04-24", "clicks": 156 },
      { "date": "2026-04-25", "clicks": 200 },
      { "date": "2026-04-26", "clicks": 112 }
    ]
  }
}
```

### N3. Get Raw Click Logs (Paginated)
```
GET /api/v1/analytics/{urlId}/clicks
Auth: Bearer (USER, ADMIN)
Path Param: urlId (Long)

Query Params:
  page=0    (default 0)
  size=20   (default 20, max 50)
  sort=clickedAt,desc (default)

Response 200 (Paginated):
{
  "status": 200,
  "message": "Click logs retrieved",
  "data": {
    "content": [
      {
        "id":         101,
        "ipAddress":  "192.168.1.***",     // last octet masked
        "browser":    "Chrome",
        "os":         "Windows",
        "deviceType": "Desktop",
        "country":    "USA",
        "city":       "New York",
        "referrer":   "twitter.com",
        "clickedAt":  "2026-04-26T08:45:30"
      },
      {
        "id":         100,
        "ipAddress":  "203.0.113.***",
        "browser":    "Safari",
        "os":         "iOS",
        "deviceType": "Mobile",
        "country":    "India",
        "city":       "Mumbai",
        "referrer":   null,
        "clickedAt":  "2026-04-26T07:30:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1245,
    "totalPages": 63,
    "last": false
  }
}

Errors:
  404 — URL not found
  403 — Not owner (unless ADMIN)
```

---

## Module M — Admin

> All admin endpoints require `Authorization: Bearer {access_token}` where the user has `role = ADMIN`.
> Non-admin access returns `403 Forbidden`.

### M1. List All Users
```
GET /api/v1/admin/users
Auth: Bearer (ADMIN)

Query Params:
  page=0        (default 0)
  size=10       (default 10)
  search=       (search username, email, fullName)
  role=         (USER | ADMIN)
  status=       (ACTIVE | BLOCKED | DELETED)
  sort=         (createdAt,desc | createdAt,asc | username,asc)

Response 200 (Paginated):
{
  "status": 200,
  "message": "Users retrieved",
  "data": {
    "content": [
      {
        "id":          1,
        "username":    "johndoe",
        "email":       "john@example.com",
        "fullName":    "John Doe",
        "role":        "USER",
        "status":      "ACTIVE",
        "urlCount":    12,
        "emailVerified": true,
        "lastLoginAt": "2026-04-26T08:00:00",
        "createdAt":   "2026-04-01T10:00:00"
      }
    ],
    "page": 0, "size": 10, "totalElements": 1250, "totalPages": 125, "last": false
  }
}
```

### M2. Get User Detail
```
GET /api/v1/admin/users/{id}
Auth: Bearer (ADMIN)
Path Param: id (Long)

Response 200:
{
  "status": 200,
  "message": "User detail retrieved",
  "data": {
    "id":           1,
    "username":     "johndoe",
    "email":        "john@example.com",
    "fullName":     "John Doe",
    "phoneNumber":  "+1 555 123 4567",
    "avatarUrl":    "...",
    "role":         "USER",
    "status":       "ACTIVE",
    "emailVerified": true,
    "urlCount":     12,
    "totalClicks":  4567,
    "failedLoginAttempts": 0,
    "lastLoginAt":  "2026-04-26T08:00:00",
    "createdAt":    "2026-04-01T10:00:00"
  }
}
```

### M3. Block / Unblock User
```
PUT /api/v1/admin/users/{id}/block
Auth: Bearer (ADMIN)
Path Param: id (Long)

Request Body:
{
  "block": true,           // true = block, false = unblock
  "reason": "Spam activity"   // optional reason
}

Response 200:
{
  "status": 200,
  "message": "User blocked successfully",
  "data": {
    "id": 1, "status": "BLOCKED"
  }
}

Side Effects (when blocking):
  - Sets user.status = 'BLOCKED'
  - Sets active = false on ALL of user's active URLs
  - Invalidates all user sessions
```

### M4. Update User Role
```
PUT /api/v1/admin/users/{id}/role
Auth: Bearer (ADMIN)
Path Param: id (Long)

Request Body:
{
  "role": "ADMIN"    // USER | ADMIN
}

Response 200:
{
  "status": 200,
  "message": "User role updated",
  "data": {
    "id": 1, "role": "ADMIN"
  }
}

Errors:
  400 — Cannot change your own role
```

### M5. Delete User (Hard Delete)
```
DELETE /api/v1/admin/users/{id}
Auth: Bearer (ADMIN)
Path Param: id (Long)

Request Body:
{
  "confirm": true    // must be true to proceed
}

Response 200:
{
  "status": 200,
  "message": "User deleted permanently",
  "data": null
}

Errors:
  400 — Cannot delete your own admin account

Side Effects:
  - Hard deletes user record
  - Cascades: deletes sessions, tokens; soft-deletes URLs
```

### M6. Bulk Block Users
```
PUT /api/v1/admin/users/bulk/block
Auth: Bearer (ADMIN)

Request Body:
{
  "userIds": [1, 2, 5, 8],
  "block": true
}

Response 200:
{
  "status": 200,
  "message": "4 users blocked successfully",
  "data": {
    "processed": 4,
    "failed":    0
  }
}
```

### M7. List All URLs (Admin View)
```
GET /api/v1/admin/urls
Auth: Bearer (ADMIN)

Query Params:
  page=0, size=10
  search=         (shortCode, originalUrl, owner username)
  status=         (ACTIVE | DISABLED | EXPIRED | SUSPICIOUS)
  userId=         (filter by owner)
  sort=           (createdAt,desc | totalClicks,desc)

Response 200 (Paginated):
{
  "status": 200,
  "message": "URLs retrieved",
  "data": {
    "content": [
      {
        "id":           1,
        "shortCode":    "abc123",
        "shortUrl":     "https://shortly.com/abc123",
        "originalUrl":  "https://example.com/...",
        "title":        "My Link",
        "active":       true,
        "suspicious":   false,
        "totalClicks":  1245,
        "owner": {
          "id":       1,
          "username": "johndoe",
          "email":    "john@example.com"
        },
        "createdAt":    "2026-04-01T10:00:00"
      }
    ],
    "page": 0, "size": 10, "totalElements": 24500, "totalPages": 2450, "last": false
  }
}
```

### M8. Enable / Disable URL
```
PUT /api/v1/admin/urls/{id}/disable
Auth: Bearer (ADMIN)
Path Param: id (Long)

Request Body:
{
  "disable": true,          // true = disable, false = re-enable
  "reason": "Phishing URL"  // optional
}

Response 200:
{
  "status": 200,
  "message": "URL disabled successfully",
  "data": {
    "id": 1, "active": false
  }
}

Side Effects:
  - Sets urls.active = false/true
  - Invalidates Redis cache for this shortCode
  - Sets suspicious=true / suspicious_reason if disabling due to policy violation
```

### M9. Hard Delete URL
```
DELETE /api/v1/admin/urls/{id}
Auth: Bearer (ADMIN)
Path Param: id (Long)

Response 200:
{
  "status": 200,
  "message": "URL permanently deleted",
  "data": null
}

Side Effects:
  - Hard deletes URL and ALL click records (CASCADE)
  - Removes from Redis cache
  - shortCode remains reserved in a blocked list to prevent reuse
```

### M10. Bulk Delete URLs
```
DELETE /api/v1/admin/urls/bulk
Auth: Bearer (ADMIN)

Request Body:
{
  "urlIds": [10, 11, 12, 15]
}

Response 200:
{
  "status": 200,
  "message": "4 URLs deleted successfully",
  "data": {
    "processed": 4,
    "failed": 0
  }
}
```

### M11. Bulk Disable URLs
```
PUT /api/v1/admin/urls/bulk/disable
Auth: Bearer (ADMIN)

Request Body:
{
  "urlIds": [5, 6, 7],
  "disable": true
}

Response 200:
{
  "status": 200,
  "message": "3 URLs disabled successfully",
  "data": {
    "processed": 3,
    "failed": 0
  }
}
```

### M12. Platform Analytics Dashboard
```
GET /api/v1/admin/dashboard
Auth: Bearer (ADMIN)

Response 200:
{
  "status": 200,
  "message": "Admin dashboard data retrieved",
  "data": {
    "totalUsers":       1250,
    "newUsersToday":      45,
    "totalUrls":        24500,
    "newUrlsToday":       320,
    "totalClicks":    1200000,
    "clicksToday":      89000,
    "suspiciousUrls":      15,
    "blockedUsers":        30,

    "userGrowth": [
      { "month": "2026-01", "total": 800 },
      { "month": "2026-02", "total": 950 },
      { "month": "2026-03", "total": 1100 },
      { "month": "2026-04", "total": 1250 }
    ],

    "dailyActivity": [
      { "date": "2026-04-20", "urlsCreated": 280, "clicks": 82000 },
      { "date": "2026-04-21", "urlsCreated": 310, "clicks": 91000 },
      { "date": "2026-04-26", "urlsCreated": 320, "clicks": 89000 }
    ],

    "suspiciousUrlList": [
      {
        "id":          99,
        "shortCode":   "x1",
        "originalUrl": "http://phishing-site.com",
        "reason":      "Phishing",
        "createdAt":   "2026-04-25T12:00:00"
      }
    ]
  }
}
```

---

## Background Jobs (Scheduled)

### Job 1 — Expired URL Cleanup
```java
@Scheduled(cron = "0 0 2 * * ?")   // Runs daily at 2:00 AM
ExpiredUrlCleanupJob {
  // Action: Set active=false for all URLs where expiry_date < NOW() and active=true
  // Also: Invalidate Redis cache for those shortCodes
}
```

### Job 2 — Analytics Aggregation
```java
@Scheduled(fixedRate = 60000)       // Runs every 60 seconds
AnalyticsAggregationJob {
  // Action: Flush async click events from in-memory queue to url_clicks table
  // Update total_clicks + unique_clicks on urls table
}
```

### Job 3 — Expired Token Cleanup
```java
@Scheduled(cron = "0 0 3 * * ?")   // Runs daily at 3:00 AM
TokenCleanupJob {
  // Action: Delete expired password_reset_tokens and email_verification_tokens
}
```

---

## Security Configuration

### JWT Configuration
```yaml
# application.yaml
jwt:
  secret: ${JWT_SECRET}                    # 256-bit secret from env
  access-token-expiry: 900                 # 15 minutes in seconds
  refresh-token-expiry: 2592000            # 30 days in seconds
```

### Spring Security — Endpoint Permissions
```java
http.authorizeHttpRequests(auth -> auth
  // Public
  .requestMatchers(GET, "/{shortCode}").permitAll()
  .requestMatchers(POST, "/{shortCode}/verify").permitAll()
  .requestMatchers(POST, "/api/v1/auth/**").permitAll()
  .requestMatchers(GET, "/api/v1/auth/verify-email").permitAll()
  .requestMatchers(GET, "/api/v1/public/**").permitAll()
  .requestMatchers(GET, "/api/v1/urls/check-alias").permitAll()
  .requestMatchers(POST, "/api/v1/urls").permitAll()   // guest allowed
  .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

  // Admin only
  .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

  // Authenticated
  .anyRequest().authenticated()
);
```

### Rate Limiting
| Rule | Limit |
|------|-------|
| Guest URL creation | 5 per day per IP |
| Login attempts | 5 per 15 min per IP before lockout |
| Forgot password | 3 per hour per IP |
| Redirect endpoint | 1000 per minute per IP (DDoS guard) |

### CORS Configuration
```yaml
cors:
  allowed-origins:
    - "http://localhost:5173"      # Vite dev server
    - "https://shortly.com"        # Production frontend
  allowed-methods: [GET, POST, PUT, DELETE, OPTIONS]
  allowed-headers: [Authorization, Content-Type]
  allow-credentials: true
```

---

## Redis Cache Design

| Cache Key Pattern | Value | TTL |
|-------------------|-------|-----|
| `url:shortcode:{code}` | UrlCacheDTO (originalUrl, active, expiryDate, passwordProtected) | Until expiry or 24h |
| `stats:public` | PublicStatsDTO | 1 hour |
| `analytics:dashboard:{userId}` | DashboardStatsDTO | 5 minutes |
| `ratelimit:guest:{ip}` | count (int) | Until end of day (UTC) |

### UrlCacheDTO (serialized in Redis)
```java
public record UrlCacheDTO(
    Long id,
    String originalUrl,
    boolean active,
    boolean passwordProtected,
    LocalDateTime expiryDate
) {}
```

---

## Database Indexes Reference

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| users | `idx_users_email` | email | Login lookup |
| users | `idx_users_username` | username | Uniqueness check |
| users | `idx_users_status` | status | Admin filter |
| user_sessions | `idx_sessions_user_id` | user_id | Sessions per user |
| user_sessions | `idx_sessions_refresh_token` | refresh_token | Token validation |
| urls | `idx_short_code` | short_code | O(1) redirect lookup (UNIQUE) |
| urls | `idx_url_user_id` | user_id | My URLs list |
| urls | `idx_url_expiry_date` | expiry_date | Cleanup job |
| urls | `idx_url_active` | active | Active URL filter |
| url_clicks | `idx_url_clicks_url_id` | url_id | Analytics aggregation |
| url_clicks | `idx_url_clicks_clicked_at` | clicked_at | Date-range analytics |
| url_clicks | `idx_url_clicks_ip` | ip_address | Unique click detection |

---

## Complete API Summary Table

| Module | # | Method | Endpoint | Screen(s) That Use It |
|--------|---|--------|----------|------------------------|
| Auth | A1 | POST | `/api/v1/auth/register` | Register Page |
| Auth | A2 | POST | `/api/v1/auth/login` | Login Page |
| Auth | A3 | POST | `/api/v1/auth/refresh` | Global (Axios interceptor) |
| Auth | A4 | POST | `/api/v1/auth/logout` | Navbar dropdown |
| Auth | A5 | POST | `/api/v1/auth/forgot-password` | Forgot Password Page |
| Auth | A6 | POST | `/api/v1/auth/reset-password` | Reset Password Page |
| Auth | A7 | POST | `/api/v1/auth/verify-email/resend` | Profile Page, Verify Email |
| Auth | A8 | GET | `/api/v1/auth/verify-email` | Verify Email Page |
| Auth | A9 | GET | `/api/v1/public/stats` | Landing Page Stats Banner |
| Profile | P1 | GET | `/api/v1/users/me` | Profile Page |
| Profile | P2 | PUT | `/api/v1/users/me` | Profile Page (save) |
| Profile | P3 | PUT | `/api/v1/users/me/password` | Profile Page (security) |
| Profile | P4 | POST | `/api/v1/users/me/avatar` | Profile Page (photo) |
| Profile | P5 | GET | `/api/v1/users/me/sessions` | Profile Page (sessions) |
| Profile | P6 | DELETE | `/api/v1/users/me/sessions/{id}` | Profile Page (revoke) |
| Profile | P7 | DELETE | `/api/v1/users/me` | Profile Page (danger zone) |
| URL | U1 | POST | `/api/v1/urls` | Landing Page, Dashboard, Create URL |
| URL | U2 | GET | `/api/v1/urls` | Dashboard, My URLs |
| URL | U3 | GET | `/api/v1/urls/{id}` | Analytics Page, Edit URL |
| URL | U4 | PUT | `/api/v1/urls/{id}` | Edit URL Page |
| URL | U5 | DELETE | `/api/v1/urls/{id}` | My URLs (delete button) |
| URL | U6 | GET | `/api/v1/urls/check-alias` | Create URL (alias field) |
| URL | U7 | GET | `/api/v1/urls/{id}/qr` | URL Card, Analytics Page |
| Redirect | R1 | GET | `/{shortCode}` | External bookmark/link |
| Redirect | R1b | POST | `/{shortCode}/verify` | Password Prompt Page |
| Analytics | N1 | GET | `/api/v1/analytics/{urlId}` | Analytics Page |
| Analytics | N2 | GET | `/api/v1/analytics/dashboard` | Dashboard Page |
| Analytics | N3 | GET | `/api/v1/analytics/{urlId}/clicks` | Analytics Page (click log) |
| Admin | M1 | GET | `/api/v1/admin/users` | Admin Users Page |
| Admin | M2 | GET | `/api/v1/admin/users/{id}` | Admin Users (view profile) |
| Admin | M3 | PUT | `/api/v1/admin/users/{id}/block` | Admin Users (block action) |
| Admin | M4 | PUT | `/api/v1/admin/users/{id}/role` | Admin Users (role dropdown) |
| Admin | M5 | DELETE | `/api/v1/admin/users/{id}` | Admin Users (delete action) |
| Admin | M6 | PUT | `/api/v1/admin/users/bulk/block` | Admin Users (bulk block) |
| Admin | M7 | GET | `/api/v1/admin/urls` | Admin URLs Page |
| Admin | M8 | PUT | `/api/v1/admin/urls/{id}/disable` | Admin URLs (disable action) |
| Admin | M9 | DELETE | `/api/v1/admin/urls/{id}` | Admin URLs (delete action) |
| Admin | M10 | DELETE | `/api/v1/admin/urls/bulk` | Admin URLs (bulk delete) |
| Admin | M11 | PUT | `/api/v1/admin/urls/bulk/disable` | Admin URLs (bulk disable) |
| Admin | M12 | GET | `/api/v1/admin/dashboard` | Admin Dashboard Page |
| **Total** | **40** | | | |

---

*Final Backend API Specification — Version 2.0 — April 2026*
*40 APIs — All gaps resolved — Full frontend coverage verified.*
