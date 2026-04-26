# Smart URL Shortener Platform — Final Frontend Design Document

**Version:** 2.0 (Final — Production Ready)
**Date:** April 2026
**Framework:** ReactJS 18 + Vite 5 + Tailwind CSS 3
**UI Library:** Headless UI + Heroicons
**Charts:** Recharts 2
**Forms:** React Hook Form 7 + Zod 3
**State:** TanStack Query 5 + Zustand 4
**HTTP:** Axios 1.x (with JWT interceptor)

---

## Design System

### Color Palette
```
Primary:          #4F46E5  (Indigo-600)
Primary Hover:    #4338CA  (Indigo-700)
Primary Light:    #EEF2FF  (Indigo-50)
Secondary:        #10B981  (Emerald-500)
Danger:           #EF4444  (Red-500)
Danger Light:     #FEF2F2  (Red-50)
Warning:          #F59E0B  (Amber-500)
Warning Light:    #FFFBEB  (Amber-50)
Background:       #F3F4F6  (Gray-100)
Surface:          #FFFFFF  (White)
Sidebar Dark:     #111827  (Gray-900)
Text Primary:     #111827  (Gray-900)
Text Secondary:   #6B7280  (Gray-500)
Border:           #E5E7EB  (Gray-200)
Success:          #10B981  (Emerald-500)
```

### Typography
```
Font Family: Inter, system-ui, sans-serif
Source:      Google Fonts (https://fonts.google.com/specimen/Inter)

H1:      text-4xl   font-extrabold  tracking-tight  text-gray-900
H2:      text-2xl   font-bold       text-gray-900
H3:      text-lg    font-semibold   text-gray-900
Body:    text-sm    text-gray-600
Caption: text-xs    text-gray-400
Label:   text-sm    font-medium     text-gray-700
```

### Spacing & Layout
```
Page Padding:    px-4 sm:px-6 lg:px-8
Card Padding:    p-6
Card Gap:        gap-6
Section Gap:     space-y-8
Max Width:       max-w-7xl mx-auto
Min Height:      min-h-screen
```

### Shadows & Borders
```
Card Shadow:      shadow-sm hover:shadow-md transition-shadow duration-200
Card Border:      border border-gray-200 rounded-xl
Input Border:     border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
Button Radius:    rounded-lg
Badge Radius:     rounded-full
```

### Button Variants
```
Primary:   bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2.5 rounded-lg text-sm font-medium
Secondary: bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm
Danger:    bg-red-600 text-white hover:bg-red-700 px-4 py-2.5 rounded-lg text-sm font-medium
Ghost:     bg-transparent text-indigo-600 hover:bg-indigo-50 px-4 py-2.5 rounded-lg text-sm
Disabled:  opacity-50 cursor-not-allowed (applied on top of any variant)
Loading:   (spinner inline left of label) + "Loading..."
```

### Status Badges
```
Active:   bg-green-100  text-green-800  px-2.5 py-0.5 rounded-full text-xs font-medium
Expired:  bg-gray-100   text-gray-800   px-2.5 py-0.5 rounded-full text-xs font-medium
Disabled: bg-red-100    text-red-800    px-2.5 py-0.5 rounded-full text-xs font-medium
USER:     bg-blue-100   text-blue-800   px-2.5 py-0.5 rounded-full text-xs font-medium
ADMIN:    bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-xs font-medium
Blocked:  bg-red-100    text-red-800    px-2.5 py-0.5 rounded-full text-xs font-medium
```

---

## 1. Global Layout (Shell)

### 1.1 Navbar (Authenticated User)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [🔗 Shortly]     Dashboard | My URLs | Analytics    [👤 John Doe ▼]   │
│                   (active: border-b-2 border-indigo-600 pb-5)           │
└─────────────────────────────────────────────────────────────────────────┘
```
**Tailwind:** `sticky top-0 z-50 bg-white border-b border-gray-200 h-16 px-4 sm:px-6 lg:px-8`

| Component | Style |
|-----------|-------|
| Logo | `text-xl font-bold text-indigo-600 flex items-center gap-2` |
| Nav Links | `hidden md:flex space-x-8 text-sm font-medium text-gray-500 hover:text-gray-900` |
| Active Link | `text-gray-900 border-b-2 border-indigo-600 pb-5` |
| Profile Dropdown | Headless UI `<Menu>` |

**Profile Dropdown Items:**
- My Profile → `/profile`
- Admin Panel → `/admin/dashboard` (only visible if `role === 'ADMIN'`)
- Divider
- Logout (calls logout API + clears store)

### 1.2 Navbar (Guest)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [🔗 Shortly]                              [Login]  [Get Started →]     │
└─────────────────────────────────────────────────────────────────────────┘
```
**Login:** `text-sm font-medium text-gray-500 hover:text-gray-900`
**Get Started:** Primary button variant

### 1.3 Admin Sidebar (Admin Routes Only)
```
┌────────┬────────────────────────────────────────────────────────────────┐
│  🔗    │                                                                │
│Shortly │                   Main Content Area                             │
│  ────  │                                                                │
│  📊    │   Dashboard                                                    │
│  👥    │   Users                                                        │
│  🔗    │   URLs                                                         │
│  ⚙️    │   Settings                                                     │
│        │                                                                │
└────────┴────────────────────────────────────────────────────────────────┘
```
**Tailwind:** `w-64 bg-gray-900 text-white flex flex-col fixed h-full`
**Active Item:** `bg-gray-800 text-white rounded-lg`
**Inactive Item:** `text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg`

**Sidebar Menu Items:**
| Icon | Label | Route |
|------|-------|-------|
| 📊 | Dashboard | `/admin/dashboard` |
| 👥 | Users | `/admin/users` |
| 🔗 | URLs | `/admin/urls` |
| ⚙️ | Settings | `/admin/settings` |

### 1.4 Footer
```
┌─────────────────────────────────────────────────────────────────────────┐
│  © 2026 Shortly. All rights reserved.       [GitHub] [Twitter] [LinkedIn]│
└─────────────────────────────────────────────────────────────────────────┘
```
**Tailwind:** `bg-white border-t border-gray-200 py-8 mt-auto`

### 1.5 Mobile Navigation (< 640px)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [☰]  🔗 Shortly                                              [👤]      │
└─────────────────────────────────────────────────────────────────────────┘
```
**☰ Click → Slide-in Drawer (Headless UI `<Dialog>`):**
```
┌────────────────┐
│  ✕  🔗 Shortly │
│  ──────────── │
│  📊 Dashboard  │
│  🔗 My URLs    │
│  📈 Analytics  │
│  ──────────── │
│  👤 Profile    │
│  🚪 Logout     │
└────────────────┘
```
**Drawer Tailwind:** `fixed inset-0 z-50 flex`
**Panel:** `relative flex-1 flex flex-col max-w-xs w-full bg-white`

---

## 2. Landing Page (`/`)

### 2.1 Hero Section
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Navbar — Guest]                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                    🔗 Smart URL Shortener                               │
│                                                                         │
│           Shorten, track, and manage your links                         │
│              with powerful built-in analytics.                          │
│                                                                         │
│     ┌─────────────────────────────────────────────────────────┐         │
│     │  🌐  https://paste-your-long-link-here          [Shorten →]      │
│     └─────────────────────────────────────────────────────────┘         │
│                                                                         │
│          ✓ Free to use    ✓ Analytics dashboard    ✓ Custom aliases    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
**Section Tailwind:** `bg-gradient-to-b from-indigo-50 to-white py-20 lg:py-32 text-center`

| Component | Style |
|-----------|-------|
| Hero Title | `text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight` |
| Subtitle | `mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto` |
| Input Group | `mt-10 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3` |
| URL Input | `flex-1 px-5 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500` |
| Shorten Button | Primary button `px-8 py-4 text-base` |
| Feature Tags | `mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500` |

**Frontend Logic:**
- No auth required to shorten (guest mode)
- After success → show **Shorten Result Card** below form
- Guest IP rate limit: 5 URLs/day → show friendly error on exceed

### 2.2 Shorten Result Card (Appears after successful creation)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✅ Your shortened link is ready!                                       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔗 https://shortly.com/abc123                    [📋 Copy] [↗] │   │
│  │  Original: https://very-long-example.com/products/...           │   │
│  │  Expires: Never                        [📱 QR Code]             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [🔗 Create Another]        [👤 Sign up for analytics →]               │
└─────────────────────────────────────────────────────────────────────────┘
```
**Tailwind:** `mt-8 max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fade-in`

**State:** `interface ShortenResult { shortUrl, originalUrl, shortCode, expiryDate, qrCodeUrl }`

**Copy Button:** Uses navigator.clipboard API → show "Copied!" toast (2s)
**QR Button:** Toggle inline QR code image (fetched from `/api/v1/urls/{id}/qr`)

### 2.3 Features Grid
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Why choose Shortly?                                                    │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   ⚡ Fast    │  │  📊 Analytics│  │  🔒 Secure   │  │  🎨 Custom   ││
│  │   Redirects  │  │  Tracking    │  │  Links       │  │  Aliases     ││
│  │              │  │              │  │              │  │              ││
│  │  Redis-backed│  │  Clicks, geo,│  │  Password    │  │  Memorable   ││
│  │  under 10ms  │  │  device stats│  │  protection  │  │  short codes ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```
**Grid Tailwind:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16`
**Card:** `bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition text-center`
**Icon Container:** `w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4`

### 2.4 Stats Banner (uses `/api/v1/public/stats` or hardcoded fallback)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   1M+        │  │   50M+       │  │   99.9%      │  │   10K+       ││
│  │   URLs       │  │   Clicks     │  │   Uptime     │  │   Users      ││
│  │   Shortened  │  │   Tracked    │  │   Guaranteed │  │   Worldwide  ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```
**Section Tailwind:** `bg-indigo-600 text-white py-16 mt-20`
**Value Style:** `text-4xl font-extrabold`
**Label Style:** `text-indigo-200 text-sm mt-2`
**API:** `GET /api/v1/public/stats` → `{ totalUrls, totalClicks, totalUsers }`

---

## 3. Authentication Pages

### 3.1 Login Page (`/login`)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Navbar — Guest]                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                    ┌─────────────────────────────┐                      │
│                    │    🔗 Shortly               │                      │
│                    │                             │                      │
│                    │    Sign in to your account  │                      │
│                    │                             │                      │
│                    │  Email address              │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │ you@example.com      │   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │                             │                      │
│                    │  Password                   │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │ ••••••••         [👁]│   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │                             │                      │
│                    │  [□ Remember me]            │                      │
│                    │                   Forgot password? →               │
│                    │                             │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │     Sign In →       │   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │                             │                      │
│                    │  Don't have an account?     │                      │
│                    │  Sign up →                  │                      │
│                    └─────────────────────────────┘                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
**Page Tailwind:** `min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8`
**Card:** `sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10`

**Form Fields (React Hook Form + Zod):**

| Field | Type | Validation | ID |
|-------|------|------------|-----|
| Email | email | `z.string().email("Invalid email address")` | `login-email` |
| Password | password | `z.string().min(1, "Password is required")` | `login-password` |
| Remember Me | checkbox | `z.boolean().optional()` | `login-remember` |

**API Used:** `POST /api/v1/auth/login`
**Request:** `{ email, password }`
**On Success:** Store tokens + user in Zustand → redirect to `/dashboard`
**On Error 401:** Show inline form error: *"Invalid email or password"*
**On Error 423:** Show: *"Account locked. Try again in X minutes."*
**"Forgot password?"** → Navigate to `/forgot-password`

**Error Display:**
```
Field Error: text-red-500 text-sm mt-1 (below input)
Form Error:  bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 (above submit)
```

### 3.2 Register Page (`/register`)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Navbar — Guest]                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                    ┌─────────────────────────────┐                      │
│                    │    🔗 Shortly               │                      │
│                    │    Create your account      │                      │
│                    │                             │                      │
│                    │  Full Name                  │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │ John Doe             │   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │  Username                   │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │ johndoe              │   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │  Email address              │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │ you@example.com      │   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │  Password                   │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │ ••••••••         [👁]│   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │  [███████░░░] Medium         │                      │
│                    │  Confirm Password            │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │ ••••••••             │   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │                             │                      │
│                    │  [□ I agree to Terms of Service]                   │
│                    │                             │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │  Create Account →   │   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │                             │                      │
│                    │  Already have an account?   │                      │
│                    │  Sign in →                  │                      │
│                    └─────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘
```

**Form Fields:**

| Field | Type | Validation | ID |
|-------|------|------------|-----|
| Full Name | text | `z.string().min(2, "Min 2 chars").max(150)` | `reg-fullname` |
| Username | text | `z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/)` | `reg-username` |
| Email | email | `z.string().email()` | `reg-email` |
| Password | password | min 8, 1 uppercase, 1 lowercase, 1 number | `reg-password` |
| Confirm Password | password | Must match password | `reg-confirm-password` |
| Terms | checkbox | Must be checked | `reg-terms` |

**Password Strength Indicator:**
```
Weak (< 6 chars):        [██░░░░░░░░] Red   — "Weak"
Medium (6-10 chars):     [██████░░░░] Amber — "Medium"
Strong (>10 + patterns): [██████████] Green — "Strong"
```
**Tailwind:** `h-2 rounded-full transition-all duration-300`

**API Used:** `POST /api/v1/auth/register`
**On Success:** Redirect to `/dashboard` with success toast; show email verification banner

### 3.3 Forgot Password Page (`/forgot-password`) ← NEW
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Navbar — Guest]                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                    ┌─────────────────────────────┐                      │
│                    │    🔒 Forgot Password       │                      │
│                    │                             │                      │
│                    │  Enter your email and we'll │                      │
│                    │  send you a reset link.     │                      │
│                    │                             │                      │
│                    │  Email address              │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │ you@example.com      │   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │                             │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │ Send Reset Link →   │   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │                             │                      │
│                    │  ← Back to Login            │                      │
│                    └─────────────────────────────┘                      │
│                                                                         │
│   [After submit — Success State:]                                       │
│                    ┌─────────────────────────────┐                      │
│                    │  ✅ Check your email!       │                      │
│                    │  We've sent a password      │                      │
│                    │  reset link to              │                      │
│                    │  you@example.com            │                      │
│                    │  (Link valid for 30 minutes)│                      │
│                    └─────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘
```
**API Used:** `POST /api/v1/auth/forgot-password`
**Request:** `{ email }`
**On Success:** Show success state (same page, replace form)
**Fields:** Email only

### 3.4 Reset Password Page (`/reset-password?token={token}`) ← NEW
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ┌─────────────────────────────┐                      │
│                    │    🔒 Set New Password      │                      │
│                    │                             │                      │
│                    │  New Password               │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │ ••••••••         [👁]│   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │  Confirm New Password       │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │ ••••••••             │   │                      │
│                    │  └─────────────────────┘   │                      │
│                    │                             │                      │
│                    │  ┌─────────────────────┐   │                      │
│                    │  │  Reset Password →   │   │                      │
│                    │  └─────────────────────┘   │                      │
│                    └─────────────────────────────┘                      │
│                                                                         │
│   [If token invalid/expired:]                                           │
│                    ┌─────────────────────────────┐                      │
│                    │  ❌ Invalid or Expired Link │                      │
│                    │  Request a new reset link   │                      │
│                    │  [← Back to Forgot Password]│                      │
│                    └─────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘
```
**API Used:** `POST /api/v1/auth/reset-password`
**Request:** `{ token, newPassword, confirmPassword }`
**On Success:** Show toast → redirect to `/login`
**Token:** Extracted from URL query param on page load

### 3.5 Email Verification Page (`/verify-email?token={token}`) ← NEW
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│              [Success State:]                                           │
│              ┌─────────────────────────────┐                            │
│              │      ✅                     │                            │
│              │  Email Verified!            │                            │
│              │  Your account is now active │                            │
│              │  [→ Go to Dashboard]        │                            │
│              └─────────────────────────────┘                            │
│                                                                         │
│              [Error State:]                                             │
│              ┌─────────────────────────────┐                            │
│              │      ❌                     │                            │
│              │  Verification Failed        │                            │
│              │  Link expired or invalid.   │                            │
│              │  [Resend Email] [→ Login]   │                            │
│              └─────────────────────────────┘                            │
│                                                                         │
│              [Loading State:]                                           │
│              ┌─────────────────────────────┐                            │
│              │      ⟳ Verifying...        │                            │
│              └─────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
```
**API Used:** `GET /api/v1/auth/verify-email?token={token}` (on page mount)
**"Resend Email":** `POST /api/v1/auth/verify-email/resend`

---

## 4. User Dashboard (`/dashboard`)

### 4.1 Stats Cards Row
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Dashboard                                    [+ New Short URL]         │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   🔗          │  │  📈          │  │  ✅          │  │  ⏰           ││
│  │  Total URLs  │  │ Total Clicks │  │ Active URLs  │  │ Expired URLs ││
│  │     24       │  │   1,245      │  │     18       │  │      6       ││
│  │  ─────────── │  │  ↑ +12% week │  │              │  │              ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```
**Grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`
**Card:** `bg-white rounded-xl border border-gray-200 p-6 shadow-sm`
**Icon Container:** `w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center`
**Value:** `text-3xl font-bold text-gray-900 mt-4`
**Label:** `text-sm font-medium text-gray-500 mt-1`
**Trend:** `flex items-center gap-1 text-sm text-green-600 mt-2`

**API Used:** `GET /api/v1/analytics/dashboard`
**Response Fields:** `{ totalUrls, totalClicks, activeUrls, expiredUrls, clickTrend }`

### 4.2 Clicks Overview Chart (Last 7 Days)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Clicks Overview (Last 7 Days)                                          │
│                                                                         │
│  Clicks                                                                 │
│  200 │                                              ╭───╮              │
│  150 │            ╭──╮    ╭───╮         ╭───╮      │   │   ╭───╮     │
│  100 │    ╭──╮   │   │   │   │  ╭──╮  │   │      │   │  │   │     │
│   50 │    │  │   │   │   │   │  │  │  │   │  ╭──╮│   │  │   │     │
│    0 └────┴──┴───┴───┴───┴───┴──┴──┴──┴───┴──┴──┴┴───┴──┴───┴─     │
│         Mon   Tue   Wed   Thu   Fri   Sat   Sun                        │
└─────────────────────────────────────────────────────────────────────────┘
```
**Component:** Recharts `<AreaChart>`
```typescript
<AreaChart data={dailyClicks} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
  <defs>
    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6"/>
  <XAxis dataKey="date" tickFormatter={d => format(new Date(d), 'EEE')} />
  <YAxis />
  <Tooltip />
  <Area type="monotone" dataKey="clicks" stroke="#4F46E5"
        strokeWidth={2} fill="url(#colorClicks)" dot={{ r: 4 }} />
</AreaChart>
```

### 4.3 Quick Shorten Widget
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Quick Shorten                                                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🌐 https://paste-long-url-here...                    [Shorten] │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  [Custom alias ▽]  [Expiry Date ▽]  [🔒 Password]                      │
└─────────────────────────────────────────────────────────────────────────┘
```
**Container:** `bg-white rounded-xl border border-gray-200 p-6`
**API Used:** `POST /api/v1/urls` (authenticated)
**On Success:** Show inline result card + update dashboard stats

### 4.4 Recent Links Table
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Recent Links                                       [View All →]        │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Short URL         │ Original URL       │ Clicks│ Status │ Actions │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ shortly.com/abc   │ example.com/very...│  124  │✅Active │  ⋮     │  │
│  │ shortly.com/xyz   │ github.com/...     │   45  │✅Active │  ⋮     │  │
│  │ shortly.com/old   │ docs.spring.io/... │  890  │⏰Expired│  ⋮     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```
**Table Container:** `overflow-hidden rounded-xl border border-gray-200`
**Header:** `bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`
**Row:** `bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors`
**Actions Dropdown (⋮):** Edit | Analytics | Copy | Delete

**API Used:** `GET /api/v1/urls?page=0&size=5&sort=createdAt,desc`

---

## 5. My URLs Page (`/urls`)

### 5.1 Header, Search & Filters
```
┌─────────────────────────────────────────────────────────────────────────┐
│  My URLs                                         [+ Create Short URL]  │
│                                                                         │
│  ┌──────────────────────────┐  ┌────────┐  ┌────────┐  ┌────────────┐  │
│  │ 🔍 Search URLs...        │  │ All ▼  │  │ Sort ▼ │  │ [🔄 Refresh]│ │
│  └──────────────────────────┘  └────────┘  └────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

| Control | Options | Query Param |
|---------|---------|-------------|
| Search | Free text | `search=` |
| Status Filter | All / Active / Expired / Disabled | `status=` |
| Sort | Newest / Oldest / Most Clicks / Least Clicks | `sort=` |

**API Used:** `GET /api/v1/urls?page=0&size=10&search=&status=&sort=createdAt,desc`
**Debounce:** Search input fires after 400ms

### 5.2 URL Cards (Grid View)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔗 shortly.com/spring-course                    ✅ Active [⋮]  │   │
│  │                                                                 │   │
│  │  🌐 https://example.com/products/spring-boot-course             │   │
│  │  📅 Created: Apr 20, 2026    ⏰ Expires: Dec 31, 2026           │   │
│  │                                                                 │   │
│  │  ┌──────────────────┐   ┌──────────────────┐                   │   │
│  │  │  1,245  👆 Clicks│   │  895  👤 Unique  │                   │   │
│  │  └──────────────────┘   └──────────────────┘                   │   │
│  │                                                                 │   │
│  │  [📋 Copy]  [📊 Analytics]  [✏️ Edit]  [🗑️ Delete]  [📱 QR]   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```
**Card Tailwind:** `bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200`
**Short URL:** `text-lg font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer`
**Original URL:** `text-sm text-gray-500 truncate mt-1 max-w-full`
**Stats Box:** `bg-gray-50 rounded-lg px-4 py-2 text-center`
**Action Buttons (inline row):**
```
Copy:       bg-gray-100 text-gray-700  px-3 py-1.5 rounded-md text-sm hover:bg-gray-200
Analytics:  bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md text-sm hover:bg-indigo-100
Edit:       bg-gray-100 text-gray-700  px-3 py-1.5 rounded-md text-sm hover:bg-gray-200
Delete:     bg-red-50 text-red-700     px-3 py-1.5 rounded-md text-sm hover:bg-red-100
QR Code:    bg-gray-100 text-gray-700  px-3 py-1.5 rounded-md text-sm hover:bg-gray-200
```

### 5.3 Pagination
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Showing 1-10 of 24 results                                             │
│                                                                         │
│  [← Previous]   [1] [2] [3] ... [10]   [Next →]                        │
│                                                                         │
│  Items per page: [10 ▼]                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```
**Active Page:** `bg-indigo-600 text-white px-3 py-1 rounded-md`
**Inactive Page:** `text-gray-500 hover:bg-gray-50 px-3 py-1 rounded-md`

### 5.4 Empty State
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                              🔗                                         │
│                    (w-16 h-16 text-gray-400)                            │
│                                                                         │
│                         No URLs yet                                     │
│              Get started by creating your first short link              │
│                                                                         │
│                        [+ Create Short URL]                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Create / Edit URL (`/urls/new` & `/urls/:id/edit`)

### 6.1 Create URL Form
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to My URLs                                                      │
│                                                                         │
│  Create Short URL                                                       │
│                                                                         │
│  Original URL *                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ https://                                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Enter the long URL you want to shorten                                 │
│                                                                         │
│  Custom Alias (Optional)                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ shortly.com/ [my-custom-alias                                  ]│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ✅ Available      ← appears after debounce check                       │
│                                                                         │
│  Title (Optional)                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ My Link Title                                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Expiry Date (Optional)                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📅 2026-12-31                                       [Clear ✕]   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Link Password (Optional)                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ••••••••                                             [👁]        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Require password before redirecting visitors                           │
│                                                                         │
│  [☑] Generate QR Code for this link                                     │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    🚀 Create Short URL                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Form Fields:**

| Field | ID | Required | Validation |
|-------|----|----------|------------|
| Original URL | `url-original` | Yes | `z.string().url("Invalid URL format")` |
| Custom Alias | `url-alias` | No | `z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]*$/)` |
| Title | `url-title` | No | `z.string().max(150).optional()` |
| Expiry Date | `url-expiry` | No | Future date only |
| Password | `url-password` | No | `z.string().min(4).optional()` |
| Generate QR | `url-qr` | No | boolean |

**Alias Availability Check (Real-time):**
```
Typing...      → Debounce 500ms → API call
🔄 Checking... → text-gray-400 animate-pulse
✅ Available   → text-green-600  (proceed with form)
❌ Taken       → text-red-600    (block submit)
```
**API:** `GET /api/v1/urls/check-alias?alias={alias}` → `{ available: boolean }`

**API Used (submit):** `POST /api/v1/urls`

### 6.2 Edit URL Form
Same form as Create but pre-populated. Short code field is **read-only** (cannot change alias after creation).
- `url-original` is also read-only (cannot change destination — security)
- Editable: `title`, `expiryDate`, `active` (toggle), `password`

**API Used:** `PUT /api/v1/urls/{id}`

### 6.3 Success Modal (appears after create)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  (bg-black bg-opacity-50 overlay)                                       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   🎉 URL Created!                               │   │
│  │                                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │  🔗 https://shortly.com/abc123                [📋 Copy] │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                 │   │
│  │  [QR Code Image — if generateQR was checked]                   │   │
│  │                                                                 │   │
│  │  [📊 View Analytics]   [✏️ Edit URL]   [🏠 Back to My URLs]   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```
**Modal Tailwind:** `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`

---

## 7. URL Analytics Page (`/urls/:id/analytics`)

### 7.1 URL Info Header
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to My URLs                                                      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔗 shortly.com/spring-course                    ✅ Active      │   │
│  │  🌐 https://example.com/products/spring-boot-course             │   │
│  │  📅 Created: Apr 20, 2026    ⏰ Expires: Dec 31, 2026           │   │
│  │                                                                 │   │
│  │  [📋 Copy]  [✏️ Edit]  [🗑️ Delete]  [🔒 Password]  [📱 QR Code]│   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```
**Header Card:** `bg-white rounded-xl border border-gray-200 p-6`
**APIs Used:** `GET /api/v1/urls/{id}` + `GET /api/v1/analytics/{urlId}`

### 7.2 Stats Overview Cards
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   1,245      │  │    895       │  │   Desktop    │  │   twitter.com││
│  │  Total Clicks│  │  Unique      │  │  Top Device  │  │  Top Referrer││
│  │              │  │  Visitors    │  │   60%        │  │   36.1%      ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Clicks Over Time Chart (Line Chart)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Clicks Over Time                            [7D] [30D] [All Time]      │
│                                                                         │
│  200 │  ─ Total  ─ Unique                                               │
│      │                                              ●                  │
│  150 │             ●       ●              ●        │                  │
│  100 │      ●     │        │     ●       │  ●      │                  │
│   50 │     │      │        │    │        │  │                          │
│    0 └─────────────────────────────────────────────────────            │
│        Mon    Tue    Wed    Thu    Fri    Sat    Sun                     │
└─────────────────────────────────────────────────────────────────────────┘
```
```typescript
<LineChart data={clicksOverTime}>
  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
  <XAxis dataKey="date" tickFormatter={d => format(new Date(d), 'MMM d')} />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="clicks" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} name="Total" />
  <Line type="monotone" dataKey="uniqueClicks" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Unique" />
</LineChart>
```

### 7.4 Browser & Device Charts (Side by Side)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────┐   ┌───────────────────────────┐         │
│  │  Browser Distribution     │   │  Device Distribution       │         │
│  │                           │   │                           │         │
│  │      ╭───────╮            │   │      ╭───────╮           │         │
│  │   ╭──┤  45%  ├──╮         │   │   ╭──┤  60%  ├──╮        │         │
│  │   │  │Chrome │  │         │   │   │  │Desktop│  │        │         │
│  │   │  ╰───────╯  │         │   │   │  ╰───────╯  │        │         │
│  │   │             │         │   │   │             │        │         │
│  │  ■ Chrome  45%  │         │   │  ■ Desktop 60% │        │         │
│  │  ■ Safari  25%  │         │   │  ■ Mobile  35% │        │         │
│  │  ■ Firefox 15%  │         │   │  ■ Tablet   5% │        │         │
│  │  ■ Edge    10%  │         │   │                │        │         │
│  └───────────────────────────┘   └───────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```
```typescript
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
<PieChart>
  <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80}
       paddingAngle={5} dataKey="value">
    {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
  </Pie>
  <Tooltip formatter={(val) => `${val}%`} />
  <Legend />
</PieChart>
```

### 7.5 Top Referrers Table
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Top Referrers                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  # │ Source              │ Clicks │ % of Total │ Trend           │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  1 │ twitter.com         │  450   │   36.1%    │ ▲ +12%          │  │
│  │  2 │ Direct / None       │  320   │   25.7%    │ ▼ -5%           │  │
│  │  3 │ facebook.com        │  180   │   14.5%    │ ▲ +8%           │  │
│  │  4 │ linkedin.com        │  120   │    9.6%    │ ▲ +3%           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```
**Trend Up:** `text-green-600 flex items-center gap-1`
**Trend Down:** `text-red-600 flex items-center gap-1`

### 7.6 Geo Location Breakdown
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Clicks by Location                                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  # │ Country       │ City       │ Clicks │ Unique │ %           │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  1 │ 🇺🇸 USA        │ New York   │  420   │  310   │ 33.7%       │  │
│  │  2 │ 🇮🇳 India      │ Mumbai     │  380   │  290   │ 30.5%       │  │
│  │  3 │ 🇬🇧 UK         │ London     │  180   │  140   │ 14.5%       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.7 Recent Clicks Log (NEW — requires API N3)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Recent Clicks                                         [Load More]      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Time          │ IP Address      │ Browser │ Device  │ Country    │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 2 mins ago    │ 192.168.1.***   │ Chrome  │ Desktop │ 🇺🇸 USA    │  │
│  │ 15 mins ago   │ 203.0.113.***   │ Safari  │ Mobile  │ 🇮🇳 India  │  │
│  │ 1 hour ago    │ 198.51.100.***  │ Firefox │ Desktop │ 🇬🇧 UK     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```
**API Used:** `GET /api/v1/analytics/{urlId}/clicks?page=0&size=20`
**IP Display:** Last octet masked with `***` for privacy

---

## 8. User Profile Page (`/profile`)

### 8.1 Profile Information Section
```
┌─────────────────────────────────────────────────────────────────────────┐
│  My Profile                                                             │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────────────────────────────────┐  │
│  │                 │  │  Profile Information                        │  │
│  │   ┌──────────┐  │  │                                             │  │
│  │   │    👤    │  │  │  Full Name                                  │  │
│  │   │  w-24    │  │  │  ┌─────────────────────────────────────┐   │  │
│  │   │  h-24    │  │  │  │ John Doe                            │   │  │
│  │   │ rounded- │  │  │  └─────────────────────────────────────┘   │  │
│  │   │  full    │  │  │                                             │  │
│  │   └──────────┘  │  │  Username                                   │  │
│  │                 │  │  ┌─────────────────────────────────────┐   │  │
│  │ [📷 Change Photo]│  │  │ johndoe                             │   │  │
│  └─────────────────┘  │  └─────────────────────────────────────┘   │  │
│                        │                                             │  │
│                        │  Email (read-only)                         │  │
│                        │  ┌─────────────────────────────────────┐   │  │
│                        │  │ john@example.com              🔒    │   │  │
│                        │  └─────────────────────────────────────┘   │  │
│                        │                                             │  │
│                        │  Phone Number                               │  │
│                        │  ┌─────────────────────────────────────┐   │  │
│                        │  │ +1 (555) 123-4567                   │   │  │
│                        │  └─────────────────────────────────────┘   │  │
│                        │                                             │  │
│                        │  [💾 Save Changes]                          │  │
│                        └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```
**APIs Used:** `GET /api/v1/users/me` (load), `PUT /api/v1/users/me` (save), `POST /api/v1/users/me/avatar` (photo)

### 8.2 Security / Change Password Section
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔒 Security                                                            │
│                                                                         │
│  Current Password                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ••••••••                                              [👁]       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  New Password                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ••••••••                                              [👁]       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Confirm New Password                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ••••••••                                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [🔑 Change Password]                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```
**API Used:** `PUT /api/v1/users/me/password`
**Request:** `{ currentPassword, newPassword, confirmPassword }`

### 8.3 Active Sessions Section
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📱 Active Sessions                                                     │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🖥️  Chrome on Windows — New York, USA                          │   │
│  │     Current session  ·  IP: 192.168.1.***  ·  Last: Just now   │   │
│  │                                                     [Current]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  📱 Safari on iPhone — Mumbai, India                            │   │
│  │     Last active: 2 hours ago  ·  IP: 203.0.113.***              │   │
│  │                                              [Revoke ✕]          │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  💻 Firefox on macOS — London, UK                               │   │
│  │     Last active: 3 days ago  ·  IP: 198.51.100.***              │   │
│  │                                              [Revoke ✕]          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [🚪 Revoke All Other Sessions]                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
**APIs Used:** `GET /api/v1/users/me/sessions` (load), `DELETE /api/v1/users/me/sessions/{id}` (revoke)
**"Current" Badge:** `bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full`
**"Revoke" Button:** `text-red-500 hover:text-red-700 text-sm`

### 8.4 Danger Zone
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚠️ Danger Zone                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Delete Account                                                 │   │
│  │  Once deleted, all your data will be permanently lost.          │   │
│  │                                             [Delete My Account] │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```
**Container:** `border border-red-200 rounded-xl p-6`
**Delete Button:** Danger variant → opens confirmation dialog
**API:** `DELETE /api/v1/users/me`

---

## 9. Admin Dashboard (`/admin/dashboard`)

### 9.1 Admin Stats Cards
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                                        │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  👥 1,250    │  │  🔗 24,500   │  │  📊 1.2M     │  │  ⚠️ 15      ││
│  │  Total Users │  │  Total URLs  │  │ Total Clicks │  │ Suspicious   ││
│  │  ↑ +45 today │  │  ↑ +320 today│  │  ↑ +89K today│  │ URLs Flagged ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```
**API:** `GET /api/v1/admin/dashboard`
**Suspicious card:** `bg-red-50 border-red-200` (highlighted if > 0)

### 9.2 Platform Activity Chart (Dual Axis Bar Chart)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Platform Activity (Last 30 Days)                     [7D] [30D] [90D] │
│                                                                         │
│  ■ URLs Created     ■ Total Clicks                                      │
│                                                                         │
│  [Dual-axis bar chart — URLs on left Y axis, Clicks on right Y axis]   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.3 User Growth Chart (Line Chart)

### 9.4 Recent Registered Users Table
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Recent Users                                    [View All Users →]     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ User          │ Email            │ Role   │ Status    │ Joined    │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 👤 John Doe   │ john@email.com   │ USER   │ ✅ Active  │ 2 hrs ago │  │
│  │ 👤 Jane Smith │ jane@email.com   │ USER   │ ✅ Active  │ 5 hrs ago │  │
│  │ 👤 Spam Bot   │ spam@evil.com    │ USER   │ 🚫 Blocked │ 2 days ago│  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.5 Suspicious URLs Alert Panel
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚠️ Suspicious URLs Requiring Attention                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Short URL      │ Original URL          │ Reason    │ Actions      │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ shortly.com/x1 │ phishing-bank.com     │ Phishing  │ [Disable]    │  │
│  │ shortly.com/x2 │ malware-site.com      │ Malware   │ [Disable]    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```
**Container:** `bg-red-50 border border-red-200 rounded-xl p-6`
**Disable Button:** `bg-red-100 text-red-700 text-sm px-3 py-1.5 rounded-md hover:bg-red-200`

---

## 10. Admin Users Management (`/admin/users`)

### 10.1 Users Table
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Users Management                                                       │
│                                                                         │
│  ┌─────────────────────────┐  ┌──────────┐  ┌──────────┐               │
│  │ 🔍 Search users...      │  │ Role ▼   │  │ Status ▼ │               │
│  └─────────────────────────┘  └──────────┘  └──────────┘               │
│                                                                         │
│  [□ Select All]                          [Block Selected] [Delete Selected]│
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │[□]│ User      │ Email         │ Role  │ Status  │ URLs │ Actions  │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │[□]│ John Doe  │ john@...      │ USER  │ ✅Active │  12  │ ⋮       │  │
│  │[□]│ Jane S.   │ jane@...      │ USER  │ ✅Active │   8  │ ⋮       │  │
│  │[□]│ Admin     │ admin@...     │ ADMIN │ ✅Active │  45  │ ⋮       │  │
│  │[□]│ Spam Bot  │ spam@...      │ USER  │ 🚫Block  │   0  │ ⋮       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Showing 1-10 of 1,250                  ← 1  2  3 ... →                │
└─────────────────────────────────────────────────────────────────────────┘
```

**Row Actions Dropdown (⋮):**
| Action | API |
|--------|-----|
| View Profile | `GET /api/v1/admin/users/{id}` |
| Edit Role | `PUT /api/v1/admin/users/{id}/role` |
| Block / Unblock | `PUT /api/v1/admin/users/{id}/block` |
| Delete Account | `DELETE /api/v1/admin/users/{id}` |

**Bulk Actions:**
- Block Selected → `PUT /api/v1/admin/users/bulk/block` (body: `{ userIds: [...] }`)
- Delete Selected → Confirmation dialog → `DELETE /api/v1/admin/users/{id}` in loop

**Filter Options:**

| Filter | Options |
|--------|---------|
| Role | All / USER / ADMIN |
| Status | All / Active / Blocked |

---

## 11. Admin URLs Management (`/admin/urls`)

### 11.1 URLs Table
```
┌─────────────────────────────────────────────────────────────────────────┐
│  URLs Management                                                        │
│                                                                         │
│  ┌─────────────────────────┐  ┌──────────┐  ┌──────────┐               │
│  │ 🔍 Search URLs...       │  │ Status ▼ │  │ User ▼   │               │
│  └─────────────────────────┘  └──────────┘  └──────────┘               │
│                                                                         │
│  [Disable Selected]  [Delete Selected]                                  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │[□]│ Short URL   │ Original URL      │ Owner    │ Clicks│ Status │⋮ │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │[□]│ shortly/abc │ example.com/...   │ John Doe │ 1,245 │✅Active │⋮ │  │
│  │[□]│ shortly/xyz │ github.com/...    │ Jane S.  │    45 │✅Active │⋮ │  │
│  │[□]│ shortly/bad │ evil.com/...      │ Spam Bot │     0 │🚫Disabled│⋮│  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Row Actions (⋮):**
| Action | API |
|--------|-----|
| Enable / Disable | `PUT /api/v1/admin/urls/{id}/disable` |
| Delete | `DELETE /api/v1/admin/urls/{id}` |

**Bulk Actions:**
- Disable Selected → `PUT /api/v1/admin/urls/bulk/disable`
- Delete Selected → `DELETE /api/v1/admin/urls/bulk` (body: `{ urlIds: [...] }`)

---

## 12. Error Pages

### 12.1 URL Not Found (`/error/404` or shown when /{shortCode} returns 404)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                             🔗                                          │
│                          404                                            │
│                   Link Not Found                                        │
│                                                                         │
│   The short URL you're looking for doesn't exist or may have been      │
│   deleted.                                                              │
│                                                                         │
│   [🏠 Go to Homepage]       [🔗 Create a New Short URL]                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
**Triggered by:** `/{shortCode}` → backend returns 404

### 12.2 URL Expired (`/error/410`)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                             ⏰                                           │
│                          410 Gone                                       │
│                   This link has expired                                 │
│                                                                         │
│   This short URL was only available for a limited time and has now     │
│   expired.                                                              │
│                                                                         │
│   [🏠 Go to Homepage]                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.3 URL Disabled (`/error/403`)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                             🚫                                           │
│                      Link Unavailable                                   │
│                                                                         │
│   This link has been disabled and is no longer accessible.             │
│                                                                         │
│   [🏠 Go to Homepage]                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.4 Password Prompt Page (`/{shortCode}/unlock`) ← NEW
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Navbar — Guest]                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│              ┌─────────────────────────────┐                            │
│              │    🔒 Password Protected    │                            │
│              │                             │                            │
│              │  This link requires a       │                            │
│              │  password to access.        │                            │
│              │                             │                            │
│              │  ┌─────────────────────┐   │                            │
│              │  │ Enter password...   │   │                            │
│              │  └─────────────────────┘   │                            │
│              │                             │                            │
│              │  ┌─────────────────────┐   │                            │
│              │  │  🔓 Unlock & Redirect│  │                            │
│              │  └─────────────────────┘   │                            │
│              │                             │                            │
│              │  [Wrong password error]     │                            │
│              └─────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
```
**Triggered by:** Backend returns 200 with `{ passwordRequired: true }` for `/{shortCode}`
**Submit:** POST same `/{shortCode}` with `{ password }` in body
**On correct password:** Follow redirect to original URL
**On wrong:** Show inline "Incorrect password. Try again."

---

## 13. Shared Components

### 13.1 Toast Notifications
```
Position: fixed top-4 right-4 z-50 flex flex-col gap-2
```

| Variant | Style |
|---------|-------|
| Success | `bg-green-50 border border-green-200 text-green-800` |
| Error | `bg-red-50 border border-red-200 text-red-800` |
| Info | `bg-blue-50 border border-blue-200 text-blue-800` |
| Warning | `bg-yellow-50 border border-yellow-200 text-yellow-800` |

**Animation:** Slide in from right (300ms), auto-dismiss after 4s
**Dismiss:** Click ✕ icon

### 13.2 Confirmation Dialog (Delete)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  (overlay: bg-black bg-opacity-50)                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        🗑️                                       │   │
│  │                 Delete this URL?                                │   │
│  │                                                                 │   │
│  │  This action cannot be undone. This will permanently           │   │
│  │  remove the short URL and all its analytics data.              │   │
│  │                                                                 │   │
│  │  ┌───────────┐    ┌──────────────────────┐                     │   │
│  │  │  Cancel   │    │  Yes, Delete         │                     │   │
│  │  └───────────┘    │ (bg-red-600 text-white)│                    │   │
│  │                   └──────────────────────┘                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.3 Loading Skeleton
```
Animated pulse shimmer blocks in the shape of the target component.
Tailwind: animate-pulse bg-gray-200 rounded
```

### 13.4 Data Table Component
```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  sorting?: SortingState;
  onSortChange?: (sort: SortingState) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  bulkActions?: React.ReactNode;
  loading?: boolean;
  emptyState?: React.ReactNode;
}
```

---

## 14. Responsive Breakpoints

| Breakpoint | Range | Behavior |
|-----------|-------|----------|
| Mobile | < 640px | Stack all columns, hamburger menu, scroll tables |
| Tablet | 640–1024px | 2-col grids, condensed tables |
| Desktop | > 1024px | Full multi-column layout, fixed sidebar (admin) |

### Mobile Card (My URLs)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔗 shortly.com/abc123                        ✅Active  [⋮]    │   │
│  │  🌐 https://example.com/very-long-url          Apr 20, 2026    │   │
│  │                                                                 │   │
│  │  1,245 Clicks   895 Unique                                      │   │
│  │                                                                 │   │
│  │  [📋]  [📊]  [✏️]  [🗑️]                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 15. State Management (Zustand Stores)

### 15.1 Auth Store
```typescript
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User) => void;
}
```

### 15.2 URL Store
```typescript
interface URLStore {
  urls: URLItem[];
  selectedUrl: URLItem | null;
  filters: { search: string; status: string; sort: string };
  pagination: { page: number; size: number; total: number };
  setFilters: (f: Partial<URLFilters>) => void;
  setPage: (page: number) => void;
}
```

### 15.3 Analytics Store
```typescript
interface AnalyticsStore {
  dashboardStats: DashboardStats | null;
  urlAnalytics: URLAnalytics | null;
  dateRange: '7d' | '30d' | 'all';
  setDateRange: (range: string) => void;
}
```

---

## 16. Zod Validation Schemas
```typescript
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  fullName: z.string().min(2).max(150),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only"),
  email: z.string().email(),
  password: z.string().min(8)
    .regex(/[A-Z]/, "Min 1 uppercase letter")
    .regex(/[a-z]/, "Min 1 lowercase letter")
    .regex(/[0-9]/, "Min 1 number"),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(v => v === true, "You must accept the terms"),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const createURLSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
  customAlias: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]*$/).optional().or(z.literal('')),
  title: z.string().max(150).optional(),
  expiryDate: z.string().optional(),
  password: z.string().min(4).optional().or(z.literal('')),
  generateQR: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8)
    .regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
```

---

## 17. Animation Specifications

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Page Fade In | Route change | 200ms | ease-out |
| Card Hover Shadow | Mouse enter | 150ms | ease-in-out |
| Modal Open | Click | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Modal Backdrop | Toggle | 150ms | ease-out |
| Toast Slide In | State update | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Skeleton Pulse | Loading | 2s infinite | ease-in-out |
| Dropdown Open | Click | 100ms | ease-out |
| Stats Counter | Mount | 1s | ease-out |
| Chart Draw | Data load | 800ms | ease-out |
| Password Strength | Keydown | 300ms | ease-in-out |

```css
/* Custom Tailwind Animations (add to tailwind.config.js) */
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

animation: {
  'fade-in': 'fadeIn 200ms ease-out',
  'slide-in-right': 'slideInRight 300ms cubic-bezier(0.4, 0, 0.2, 1)',
}
```

---

## 18. Routing Map
```
/                          → LandingPage          (public)
/login                     → LoginPage            (public, redirect if authed)
/register                  → RegisterPage         (public, redirect if authed)
/forgot-password           → ForgotPasswordPage   (public)
/reset-password            → ResetPasswordPage    (public, requires ?token=)
/verify-email              → VerifyEmailPage      (public, requires ?token=)
/dashboard                 → DashboardPage        (protected: USER)
/urls                      → MyUrlsPage           (protected: USER)
/urls/new                  → CreateUrlPage        (protected: USER)
/urls/:id/edit             → EditUrlPage          (protected: USER)
/urls/:id/analytics        → AnalyticsPage        (protected: USER)
/profile                   → ProfilePage          (protected: USER)
/admin/dashboard           → AdminDashboardPage   (protected: ADMIN)
/admin/users               → AdminUsersPage       (protected: ADMIN)
/admin/urls                → AdminUrlsPage        (protected: ADMIN)
/admin/settings            → AdminSettingsPage    (protected: ADMIN)
/error/404                 → NotFoundPage         (public)
/error/410                 → ExpiredPage          (public)
/error/403                 → DisabledPage         (public)
/:shortCode/unlock         → PasswordPromptPage   (public)
*                          → 404 redirect
```

---

*Final Frontend Design Document — Version 2.0 — April 2026*
*20 screens, all gaps from BRD-Frontend Gap Analysis resolved.*
