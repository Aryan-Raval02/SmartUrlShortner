# BRD ↔ Frontend Design — Cross-Reference Gap Analysis

**Date:** April 2026  
**Project:** Smart URL Shortener Platform  
**Purpose:** Identify missing APIs, missing screens, and mismatches between BRD and Frontend Design

---

## 1. API Inventory (from BRD)

### Auth Module (4 APIs)
| # | Method | Endpoint | Frontend Screen(s) |
|---|--------|----------|-------------------|
| A1 | POST | `/api/v1/auth/register` | Register Page |
| A2 | POST | `/api/v1/auth/login` | Login Page |
| A3 | POST | `/api/v1/auth/refresh` | Global (silent token refresh) |
| A4 | POST | `/api/v1/auth/logout` | Navbar → Logout |

### URL Module (5 APIs)
| # | Method | Endpoint | Frontend Screen(s) |
|---|--------|----------|-------------------|
| U1 | POST | `/api/v1/urls` | Landing Page, Dashboard, Create URL |
| U2 | GET | `/api/v1/urls` | Dashboard, My URLs |
| U3 | GET | `/api/v1/urls/{id}` | URL Detail, Edit URL |
| U4 | PUT | `/api/v1/urls/{id}` | Edit URL |
| U5 | DELETE | `/api/v1/urls/{id}` | My URLs, URL Detail |

### Redirection (1 API)
| # | Method | Endpoint | Frontend Screen(s) |
|---|--------|----------|-------------------|
| R1 | GET | `/{shortCode}` | External (redirect) |

### Analytics (2 APIs)
| # | Method | Endpoint | Frontend Screen(s) |
|---|--------|----------|-------------------|
| N1 | GET | `/api/v1/analytics/{urlId}` | URL Detail + Analytics |
| N2 | GET | `/api/v1/analytics/dashboard` | Dashboard |

### Admin (6 APIs)
| # | Method | Endpoint | Frontend Screen(s) |
|---|--------|----------|-------------------|
| M1 | GET | `/api/v1/admin/users` | Admin Users Management |
| M2 | PUT | `/api/v1/admin/users/{id}/block` | Admin Users Management |
| M3 | GET | `/api/v1/admin/urls` | Admin URLs Management |
| M4 | PUT | `/api/v1/admin/urls/{id}/disable` | Admin URLs Management |
| M5 | DELETE | `/api/v1/admin/urls/{id}` | Admin URLs Management |
| M6 | GET | `/api/v1/admin/dashboard` | Admin Dashboard |

**Total BRD APIs: 18**

---

## 2. Screen Inventory (from Frontend Design)

### Public Screens
| Route | Screen | APIs Used |
|-------|--------|-----------|
| `/` | Landing Page | U1 (POST shorten), R1 (redirect) |
| `/login` | Login Page | A2 |
| `/register` | Register Page | A1 |

### User Screens
| Route | Screen | APIs Used |
|-------|--------|-----------|
| `/dashboard` | Dashboard | U2, N2, U1 |
| `/urls` | My URLs | U2, U5, U4 |
| `/urls/new` | Create URL | U1 |
| `/urls/:id/edit` | Edit URL | U3, U4 |
| `/urls/:id/analytics` | URL Analytics | U3, N1 |
| `/profile` | User Profile | **NONE DEFINED** |

### Admin Screens
| Route | Screen | APIs Used |
|-------|--------|-----------|
| `/admin/dashboard` | Admin Dashboard | M6, M1, M3 |
| `/admin/users` | Admin Users | M1, M2 |
| `/admin/urls` | Admin URLs | M3, M4, M5 |

---

## 3. 🔴 CRITICAL GAPS — Missing APIs (Frontend needs, BRD missing)

### 3.1 User Profile APIs
The Frontend Design has a full **Profile Page** (`/profile`) with:
- View/Edit profile info (full name, username, email, phone)
- Change password
- View active sessions
- Revoke sessions

**Missing BRD APIs:**
| Needed API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Get Current User | GET | `/api/v1/users/me` | Load profile data |
| Update Profile | PUT | `/api/v1/users/me` | Save profile changes |
| Change Password | PUT | `/api/v1/users/me/password` | Update password |
| Get Sessions | GET | `/api/v1/users/me/sessions` | List active sessions |
| Revoke Session | DELETE | `/api/v1/users/me/sessions/{id}` | Logout from device |
| Delete Account | DELETE | `/api/v1/users/me` | Account deletion |
| Upload Avatar | POST | `/api/v1/users/me/avatar` | Profile photo |

**Impact:** HIGH — Profile page is fully designed but has zero backend support.

---

### 3.2 Alias Availability Check API
The Frontend Design shows **real-time alias availability checking** with debounce:
```
Typing... → Debounce 500ms → API check → ✅ Available / ❌ Taken
```

**Missing BRD API:**
| Needed API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Check Alias | GET | `/api/v1/urls/check-alias?alias={alias}` | Validate alias availability before submission |

**Impact:** MEDIUM — Without this, users only find out alias is taken after form submission.

---

### 3.3 Raw Click Logs API
The Frontend Design shows a **"Recent Clicks Log"** table on the Analytics page with individual click records:
```
| Time | IP Address | Browser | Device | Country |
```

The BRD only defines aggregated analytics (`GET /api/v1/analytics/{urlId}`) which returns totals/charts.

**Missing BRD API:**
| Needed API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Get Click Logs | GET | `/api/v1/analytics/{urlId}/clicks` | Paginated raw click records |

**Impact:** MEDIUM — The "Recent Clicks" table cannot be populated without this.

---

### 3.4 Public Stats API
The Frontend Landing Page shows a **Stats Banner**:
```
1M+ URLs Shortened | 50M+ Clicks Tracked | 99.9% Uptime | 10K+ Users
```

**Missing BRD API:**
| Needed API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Public Stats | GET | `/api/v1/public/stats` | Platform-wide public statistics |

**Impact:** LOW — Can be hardcoded initially, but needs backend for real data.

---

### 3.5 Password Reset / Forgot Password APIs
The Frontend Login Page has a **"Forgot password?"** link.

**Missing BRD APIs:**
| Needed API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Request Reset | POST | `/api/v1/auth/forgot-password` | Send reset email |
| Reset Password | POST | `/api/v1/auth/reset-password` | Confirm reset with token |

**Impact:** MEDIUM — Common real-world feature, but can be deferred to Phase 7.

---

### 3.6 Email Verification APIs
The BRD mentions "Email verification support" and the Frontend Register has terms checkbox, but no verification flow APIs exist.

**Missing BRD APIs:**
| Needed API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Resend Verification | POST | `/api/v1/auth/verify-email/resend` | Resend verification email |
| Verify Email | GET | `/api/v1/auth/verify-email?token={token}` | Confirm email via token |

**Impact:** LOW — Can be deferred; BRD mentions it as a feature but no endpoints.

---

### 3.7 QR Code Generation API
The BRD mentions "QR code generation for short URLs" and Frontend shows QR codes, but no dedicated API.

**Missing BRD API:**
| Needed API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Get QR Code | GET | `/api/v1/urls/{id}/qr` | Generate/download QR code |

**Impact:** LOW — Can be generated client-side or as part of URL response.

---

### 3.8 Bulk Operations APIs
The Frontend Admin pages show **"Block Selected"** and **"Delete Selected"** bulk action buttons.

**Missing BRD APIs:**
| Needed API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Bulk Block Users | PUT | `/api/v1/admin/users/bulk/block` | Block multiple users |
| Bulk Delete URLs | DELETE | `/api/v1/admin/urls/bulk` | Delete multiple URLs |
| Bulk Disable URLs | PUT | `/api/v1/admin/urls/bulk/disable` | Disable multiple URLs |

**Impact:** LOW — Can loop single APIs, but inefficient for large selections.

---

### 3.9 Admin User Detail / Role Update APIs
The Frontend Admin Users page shows actions: **"View Profile | Edit Role | Block/Unblock | Delete Account"**

**Missing BRD APIs:**
| Needed API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Get User Detail | GET | `/api/v1/admin/users/{id}` | View full user profile |
| Update User Role | PUT | `/api/v1/admin/users/{id}/role` | Change USER ↔ ADMIN |
| Delete User | DELETE | `/api/v1/admin/users/{id}` | Hard delete user |

**Impact:** MEDIUM — "Edit Role" and "Delete Account" actions have no backend.

---

### 3.10 URL Password Update API
The Frontend URL Detail page shows a **"Password"** action button to add/change link password.

**Missing BRD API:**
| Needed API | Method | Endpoint | Purpose |
|------------|--------|----------|---------|
| Update URL Password | PUT | `/api/v1/urls/{id}/password` | Add/change/remove link password |

**Impact:** LOW — Link password is a Phase 6 advanced feature.

---

## 4. 🟡 MISSING SCREENS (BRD mentions, Frontend missing)

### 4.1 Email Verification Page
The BRD mentions "Email verification support" but Frontend has no verification success/failure page.

**Missing Screen:** `/verify-email?token=xxx` — Show success/error message

### 4.2 Password Reset Pages
The BRD doesn't define APIs, but Frontend has "Forgot password?" link with no destination.

**Missing Screens:**
- `/forgot-password` — Enter email form
- `/reset-password?token=xxx` — New password form

### 4.3 URL Password Prompt Page
The BRD mentions "URL password-protected → Password prompt page" but Frontend has no such screen.

**Missing Screen:** `/{shortCode}?password=true` — Password input before redirect

### 4.4 Error Pages
The BRD defines multiple redirect error states (404, 410, 403) but Frontend has no error pages.

**Missing Screens:**
- `/error/404` — Short code not found
- `/error/410` — URL expired
- `/error/403` — URL disabled

### 4.5 Bulk URL Upload Page
The BRD mentions "Bulk URL upload (CSV)" as an advanced feature but Frontend has no upload screen.

**Missing Screen:** `/urls/bulk-upload` — CSV upload with preview

### 4.6 Admin Settings Page
The Frontend Admin Sidebar has a "Settings" menu item (`/admin/settings`) but no corresponding screen design.

**Missing Screen:** `/admin/settings` — Platform configuration

---

## 5. 🟢 ORPHAN APIs (BRD defines, Frontend doesn't use)

| API | Endpoint | Issue |
|-----|----------|-------|
| POST `/api/v1/auth/refresh` | A3 | Used silently by Axios interceptor, not tied to a visible screen. **OK — background usage.** |
| GET `/{shortCode}` | R1 | External redirect, not a frontend screen. **OK — backend-only.** |

**Result: No true orphan APIs.** All BRD APIs have frontend consumers.

---

## 6. ⚠️ MISMATCHES & AMBIGUITIES

### 6.1 Analytics Endpoint Mismatch
- **BRD:** `GET /api/v1/analytics/url/{urlId}` (Section 5.4, original doc) vs `GET /api/v1/analytics/{urlId}` (merged BRD)
- **Recommendation:** Standardize to `GET /api/v1/analytics/{urlId}`

### 6.2 Admin Dashboard Stats
- **BRD:** `GET /api/v1/admin/dashboard` returns platform analytics
- **Frontend:** Admin Dashboard shows "Total Users, Total URLs, Total Clicks, Suspicious URLs"
- **Gap:** The "Suspicious URLs" count needs a separate data source or filter on the admin dashboard API.

### 6.3 Guest Shorten on Landing Page
- **BRD:** Guest can create limited URLs (rate-limited, 5/day)
- **Frontend:** Landing Page allows shortening without login
- **Gap:** Need to clarify if guest-created URLs are stored in DB with `user_id = NULL` or require a temporary session. The DB schema shows `user_id BIGINT REFERENCES users(id)` which allows NULL, so this works.

### 6.4 URL Soft Delete
- **BRD:** `DELETE /api/v1/urls/{id}` says "Delete URL (soft delete)"
- **Frontend:** Shows "Delete" button with confirmation
- **Gap:** If soft delete, should the "My URLs" page show deleted URLs with a "Restore" option? Currently Frontend has no "Trash/Deleted" filter.

---

## 7. 📋 SUMMARY MATRIX

### By Priority

| Priority | Item | Type | Count |
|----------|------|------|-------|
| 🔴 HIGH | User Profile APIs | Missing API | 7 |
| 🔴 HIGH | Alias Availability API | Missing API | 1 |
| 🟡 MEDIUM | Raw Click Logs API | Missing API | 1 |
| 🟡 MEDIUM | Password Reset APIs | Missing API | 2 |
| 🟡 MEDIUM | Admin User Detail/Role APIs | Missing API | 3 |
| 🟢 LOW | Public Stats API | Missing API | 1 |
| 🟢 LOW | Email Verification APIs | Missing API | 2 |
| 🟢 LOW | QR Code API | Missing API | 1 |
| 🟢 LOW | Bulk Operation APIs | Missing API | 3 |
| 🟢 LOW | URL Password Update API | Missing API | 1 |
| 🟡 MEDIUM | Error Pages (404/410/403) | Missing Screen | 3 |
| 🟡 MEDIUM | Password Reset Pages | Missing Screen | 2 |
| 🟢 LOW | Email Verification Page | Missing Screen | 1 |
| 🟢 LOW | URL Password Prompt | Missing Screen | 1 |
| 🟢 LOW | Bulk Upload Page | Missing Screen | 1 |
| 🟢 LOW | Admin Settings Page | Missing Screen | 1 |

**Total Missing APIs: 22**  
**Total Missing Screens: 9**

---

## 8. 💡 RECOMMENDATIONS

### Immediate (Phase 2-3)
1. **Add User Profile APIs** — The profile page is fully designed and must have backend support
2. **Add Alias Check API** — Critical for UX during URL creation
3. **Standardize analytics endpoint** — Pick one path format

### Short-term (Phase 4-5)
4. **Add Raw Click Logs API** — Required for the "Recent Clicks" table
5. **Add Password Reset APIs + Screens** — Complete the auth flow
6. **Add Admin User Detail/Role APIs** — Complete admin user management
7. **Add Error Pages** — 404, 410, 403 for redirect failures

### Long-term (Phase 6-7)
8. **Add Email Verification APIs + Screen** — Production-ready auth
9. **Add Bulk Operations APIs** — For admin efficiency
10. **Add Public Stats API** — For landing page credibility
11. **Add QR Code API** — If not generating client-side
12. **Add URL Password Prompt Screen** — For protected links
13. **Add Bulk Upload Screen** — CSV upload feature

---

*End of Gap Analysis*
