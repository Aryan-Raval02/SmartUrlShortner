# Smart URL Shortener — Frontend Design Document (Raw Markdown)

**Version:** 1.0  
**Framework:** ReactJS + Vite + Tailwind CSS  
**UI Library:** Headless UI + Heroicons  
**Charts:** Recharts  
**Forms:** React Hook Form + Zod  
**State:** React Query (TanStack Query) + Zustand  

---

## Design System

### Color Palette
```
Primary:       #4F46E5 (Indigo-600)
Primary Hover: #4338CA (Indigo-700)
Secondary:     #10B981 (Emerald-500)
Danger:        #EF4444 (Red-500)
Warning:       #F59E0B (Amber-500)
Background:    #F3F4F6 (Gray-100)
Surface:       #FFFFFF (White)
Text Primary:  #111827 (Gray-900)
Text Secondary:#6B7280 (Gray-500)
Border:        #E5E7EB (Gray-200)
Success:       #10B981 (Emerald-500)
```

### Typography
```
Font Family: Inter, system-ui, sans-serif
H1: text-4xl font-extrabold tracking-tight
H2: text-2xl font-bold
H3: text-lg font-semibold
Body: text-sm text-gray-600
Caption: text-xs text-gray-400
```

### Spacing
```
Page Padding: px-4 sm:px-6 lg:px-8
Card Padding: p-6
Card Gap: gap-6
Section Gap: space-y-8
Max Width: max-w-7xl mx-auto
```

### Shadows & Borders
```
Card Shadow: shadow-sm hover:shadow-md transition
Card Border: border border-gray-200 rounded-xl
Input Border: border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500
Button Radius: rounded-lg
```

---

## 1. Global Layout (Shell)

### 1.1 Navbar (Authenticated)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo: 🔗 Shortly]     Dashboard | My URLs | Analytics    [👤 Profile ▼] │
│                           (active: border-b-2 border-indigo-600)        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Tailwind:** `sticky top-0 z-50 bg-white border-b border-gray-200 h-16`

**Components:**
- Logo: `text-xl font-bold text-indigo-600 flex items-center gap-2`
- Nav Links: `hidden md:flex space-x-8 text-sm font-medium text-gray-500 hover:text-gray-900`
- Active Link: `text-gray-900 border-b-2 border-indigo-600 pb-5`
- Profile Dropdown: Headless UI Menu
  - My Profile
  - Settings
  - Admin Panel (conditional: role === 'ADMIN')
  - Divider
  - Logout

### 1.2 Navbar (Guest)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo: 🔗 Shortly]                              [Login] [Register]      │
│                                          (Login: text-sm font-medium)    │
│                                          (Register: btn-primary)         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Sidebar (Admin Only)
```
┌────────┬────────────────────────────────────────────────────────────────┐
│        │                                                                │
│  Logo  │                     Main Content Area                          │
│        │                                                                │
│  ────  │                                                                │
│  📊    │                                                                │
│  👥    │                                                                │
│  🔗    │                                                                │
│  ⚙️    │                                                                │
│        │                                                                │
└────────┴────────────────────────────────────────────────────────────────┘
```

**Tailwind:** `w-64 bg-gray-900 text-white flex flex-col fixed h-full`

**Menu Items:**
- Dashboard (`/admin/dashboard`)
- Users (`/admin/users`)
- URLs (`/admin/urls`)
- Settings (`/admin/settings`)

### 1.4 Footer
```
┌─────────────────────────────────────────────────────────────────────────┐
│  © 2026 Shortly. All rights reserved.    [GitHub] [Twitter] [LinkedIn]  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Tailwind:** `bg-white border-t border-gray-200 py-8 mt-auto`

---

## 2. Landing Page (`/`)

### 2.1 Hero Section
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│              ┌─────────────────────────────────────┐                    │
│              │   🔗 Smart URL Shortener            │                    │
│              │                                     │                    │
│              │   Shorten, track, and manage        │                    │
│              │   your links with powerful          │                    │
│              │   analytics.                        │                    │
│              │                                     │                    │
│              │   ┌─────────────────────────────┐   │                    │
│              │   │ https://very-long-url...    │   │                    │
│              │   │ [Shorten →]                 │   │                    │
│              │   └─────────────────────────────┘   │                    │
│              │                                     │                    │
│              │   ✓ Free to use  ✓ Analytics     │                    │
│              │   ✓ Custom aliases               │                    │
│              └─────────────────────────────────────┘                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Tailwind:** `bg-gradient-to-b from-indigo-50 to-white py-20 lg:py-32`

**Components:**
- Hero Title: `text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight`
- Subtitle: `mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto`
- URL Input Group:
  - Container: `mt-10 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3`
  - Input: `flex-1 min-w-0 px-5 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`
  - Button: `px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition`
- Feature Tags: `mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500`

### 2.2 Shorten Result Card (Appears after submission)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✅ Your shortened link is ready!                                       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🌐 https://shortly.com/abc123                    [📋 Copy] [🔗] │   │
│  │  Original: https://very-long-example.com/...                     │   │
│  │  Expires: 2026-12-31  [QR Code 📱]                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [Create Another]                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Tailwind:** `mt-8 max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fade-in`

**State:**
```typescript
interface ShortenResult {
  shortUrl: string;
  originalUrl: string;
  shortCode: string;
  expiryDate: string | null;
  qrCodeUrl: string;
}
```

### 2.3 Features Grid
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Why choose Shortly?                                                    │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   ⚡         │  │   📊         │  │   🔒         │  │   🎨         ││
│  │   Fast       │  │   Analytics  │  │   Secure     │  │   Custom     ││
│  │   Redirects  │  │   Tracking   │  │   Links      │  │   Aliases    ││
│  │              │  │              │  │              │  │              ││
│  │  Lightning   │  │  Detailed    │  │  Password    │  │  Create      ││
│  │  fast with   │  │  insights    │  │  protection  │  │  memorable   ││
│  │  Redis cache │  │  on clicks   │  │  & expiry    │  │  short URLs  ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

**Tailwind:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16`

**Card Style:** `bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition`

### 2.4 Stats Banner
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  1M+         │  │  50M+        │  │  99.9%       │  │  10K+        ││
│  │  URLs        │  │  Clicks      │  │  Uptime      │  │  Users       ││
│  │  Shortened   │  │  Tracked     │  │  Guaranteed  │  │  Worldwide   ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

**Tailwind:** `bg-indigo-600 text-white py-16 mt-20`

---

## 3. Authentication Pages

### 3.1 Login Page (`/login`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         ┌─────────────────────────┐                     │
│                         │      🔗 Shortly         │                     │
│                         │                         │                     │
│                         │    Sign in to your      │                     │
│                         │       account           │                     │
│                         │                         │                     │
│                         │  ┌─────────────────┐    │                     │
│                         │  │ Email           │    │                     │
│                         │  │ you@example.com │    │                     │
│                         │  └─────────────────┘    │                     │
│                         │  ┌─────────────────┐    │                     │
│                         │  │ Password        │    │                     │
│                         │  │ ********        │ 👁  │                     │
│                         │  └─────────────────┘    │                     │
│                         │                         │                     │
│                         │  [✓ Remember me]        │                     │
│                         │  Forgot password?       │                     │
│                         │                         │                     │
│                         │  ┌─────────────────┐    │                     │
│                         │  │   Sign In →     │    │                     │
│                         │  └─────────────────┘    │                     │
│                         │                         │                     │
│                         │  ───── or ─────         │                     │
│                         │                         │                     │
│                         │  [G Sign in with Google]│                     │
│                         │                         │                     │
│                         │  Don't have an account? │                     │
│                         │  Sign up                │                     │
│                         └─────────────────────────┘                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Layout:** `min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8`

**Card:** `sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10`

**Form Fields (React Hook Form + Zod):**

| Field | Type | Validation | Tailwind |
|-------|------|------------|----------|
| Email | email | `z.string().email("Invalid email")` | `w-full px-3 py-2 border rounded-md focus:ring-indigo-500` |
| Password | password | `z.string().min(8, "Min 8 characters")` | Same + `pr-10` for eye icon |
| Remember Me | checkbox | optional | `h-4 w-4 text-indigo-600 rounded` |

**Submit Button:**
```
Full width, bg-indigo-600, text-white, py-2.5, rounded-lg
Hover: bg-indigo-700
Disabled: opacity-50 cursor-not-allowed (while loading)
Loading state: spinner + "Signing in..."
```

**Error States:**
```
Field Error: text-red-500 text-sm mt-1 flex items-center gap-1
  └─ "⚠ Email is required"

Form Error (toast): bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg
  └─ "Invalid email or password"
```

### 3.2 Register Page (`/register`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         ┌─────────────────────────┐                     │
│                         │      🔗 Shortly         │                     │
│                         │                         │                     │
│                         │    Create your account  │                     │
│                         │                         │                     │
│                         │  ┌─────────────────┐    │                     │
│                         │  │ Full Name       │    │                     │
│                         │  │ John Doe        │    │                     │
│                         │  └─────────────────┘    │                     │
│                         │  ┌─────────────────┐    │                     │
│                         │  │ Username        │    │                     │
│                         │  │ johndoe         │    │                     │
│                         │  └─────────────────┘    │                     │
│                         │  ┌─────────────────┐    │                     │
│                         │  │ Email           │    │                     │
│                         │  │ you@example.com │    │                     │
│                         │  └─────────────────┘    │                     │
│                         │  ┌─────────────────┐    │                     │
│                         │  │ Password        │    │                     │
│                         │  │ ********        │    │                     │
│                         │  └─────────────────┘    │                     │
│                         │  ┌─────────────────┐    │                     │
│                         │  │ Confirm Password│    │                     │
│                         │  │ ********        │    │                     │
│                         │  └─────────────────┘    │                     │
│                         │                         │                     │
│                         │  [✓ I agree to Terms]   │                     │
│                         │                         │                     │
│                         │  ┌─────────────────┐    │                     │
│                         │  │  Create Account │    │                     │
│                         │  └─────────────────┘    │                     │
│                         │                         │                     │
│                         │  Already have an acc?   │                     │
│                         │  Sign in                │                     │
│                         └─────────────────────────┘                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Form Fields:**

| Field | Type | Validation |
|-------|------|------------|
| Full Name | text | `z.string().min(2, "Min 2 chars").max(150)` |
| Username | text | `z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/)` |
| Email | email | `z.string().email()` |
| Password | password | `z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)` |
| Confirm Password | password | `z.string()` + custom match validator |
| Terms | checkbox | `z.boolean().refine(v => v === true)` |

**Password Strength Indicator:**
```
Weak:   [██░░░░░░░░] text-red-500   "Weak"
Medium: [██████░░░░] text-yellow-500 "Medium"
Strong: [██████████] text-green-500  "Strong"
```

---

## 4. Dashboard Page (`/dashboard`)

### 4.1 Stats Cards Row
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Dashboard                                    [+ New Short URL]         │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  Total URLs  │  │ Total Clicks │  │ Active URLs  │  │ Expired URLs ││
│  │              │  │              │  │              │  │              ││
│  │    24        │  │   1,245      │  │     18       │  │     6        ││
│  │  🔗          │  │  📈 +12%     │  │  ✅          │  │  ⏰          ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

**Card Component:**
```
Container: bg-white rounded-xl border border-gray-200 p-6 shadow-sm
Icon Container: w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center
  └─ Icon: w-6 h-6 text-indigo-600
Value: text-3xl font-bold text-gray-900 mt-4
Label: text-sm font-medium text-gray-500 mt-1
Trend: text-sm text-green-600 flex items-center gap-1 (if positive)
```

**Stats Data:**
```typescript
interface DashboardStats {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  expiredUrls: number;
  clickTrend: number; // percentage change from last week
}
```

### 4.2 Quick Shorten Widget
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Quick Shorten                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🌐 https://paste-long-url-here...                    [Shorten] │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  [Custom alias] [Expiry date ▼] [Password protection 🔒]               │
└─────────────────────────────────────────────────────────────────────────┘
```

**Container:** `bg-white rounded-xl border border-gray-200 p-6`

### 4.3 Recent Links Table
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Recent Links                                    [View All →]           │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Short URL      │ Original URL        │ Clicks │ Status │ Actions  │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ shortly.com/abc│ example.com/very... │  124   │ ✅ Active│ ⋮      │ │
│  │ shortly.com/xyz│ github.com/...      │   45   │ ✅ Active│ ⋮      │ │
│  │ shortly.com/old│ docs.spring.io/...  │  890   │ ⏰ Expir │ ⋮      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Table Style:**
```
Container: overflow-hidden rounded-xl border border-gray-200
Header: bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase
Row: bg-white border-b border-gray-200 hover:bg-gray-50 transition
Cell: px-6 py-4 whitespace-nowrap text-sm text-gray-900
```

**Status Badge:**
```
Active:   bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium
Expired:  bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium
Disabled: bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium
```

**Actions Dropdown:**
```
⋮ → Edit | Analytics | Copy | Delete
```

### 4.4 Clicks Chart (Mini)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Clicks Overview (Last 7 Days)                                          │
│                                                                         │
│  Clicks                                                                 │
│  200 │                                              ┌───┐               │
│  150 │          ┌───┐    ┌───┐         ┌───┐       │   │    ┌───┐     │
│  100 │    ┌───┐ │   │    │   │ ┌───┐   │   │       │   │    │   │     │
│   50 │    │   │ │   │    │   │ │   │   │   │ ┌───┐ │   │    │   │     │
│    0 └────┴───┴─┴───┴────┴───┴─┴───┴───┴───┴─┴───┴─┴───┴────┴───┘     │
│         Mon   Tue   Wed   Thu   Fri   Sat   Sun                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Recharts Config:**
```typescript
<AreaChart data={dailyClicks}>
  <defs>
    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" vertical={false} />
  <XAxis dataKey="date" tickFormatter={formatDate} />
  <YAxis />
  <Tooltip />
  <Area type="monotone" dataKey="clicks" stroke="#4F46E5" fill="url(#colorClicks)" />
</AreaChart>
```

---

## 5. My URLs Page (`/urls`)

### 5.1 Page Header & Filters
```
┌─────────────────────────────────────────────────────────────────────────┐
│  My URLs                                          [+ Create Short URL]  │
│                                                                         │
│  ┌────────────────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ 🔍 Search URLs...      │ │ All ▼    │ │ Date ▼   │ │ [🔄 Refresh] │ │
│  └────────────────────────┘ └──────────┘ └──────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Search Input:**
```
Container: relative flex-1 max-w-lg
Input: w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
Icon: absolute left-3 top-2.5 h-5 w-5 text-gray-400
Placeholder: "Search by short code or original URL..."
```

**Filter Dropdowns:**
```
Status: All | Active | Expired | Disabled
Sort: Newest | Oldest | Most Clicks | Least Clicks
```

### 5.2 URL Cards (Grid View Option)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔗 shortly.com/spring-course                        [⋮ Menu]   │   │
│  │                                                                 │   │
│  │  🌐 https://example.com/products/spring-boot-course             │   │
│  │  📅 Created: Apr 20, 2026  ⏰ Expires: Dec 31, 2026            │   │
│  │                                                                 │   │
│  │  ┌──────────┐  ┌──────────┐                                     │   │
│  │  │ 1,245 👆 │  │ 895 👤   │                                     │   │
│  │  │ Clicks   │  │ Unique   │                                     │   │
│  │  └──────────┘  └──────────┘                                     │   │
│  │                                                                 │   │
│  │  [📋 Copy] [📊 Analytics] [✏️ Edit] [🗑️ Delete]                 │   │
│  │                                                                 │   │
│  │  ✅ Active                                          [QR 📱]    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Card Component:**
```
Container: bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition
Short URL: text-lg font-semibold text-indigo-600 hover:text-indigo-800
Original URL: text-sm text-gray-500 truncate mt-1
Meta Row: flex items-center gap-4 text-xs text-gray-400 mt-2
Stats Row: flex gap-4 mt-4
  └─ Stat Box: bg-gray-50 rounded-lg px-4 py-2 text-center
Action Row: flex gap-2 mt-4 pt-4 border-t border-gray-100
```

**Action Buttons:**
```
Copy:    bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-200
Analytics: bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md text-sm hover:bg-indigo-100
Edit:    bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-200
Delete:  bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm hover:bg-red-100
```

### 5.3 Pagination
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Showing 1-10 of 24 results                                             │
│                                                                         │
│  [← Previous]  [1] [2] [3] ... [10] [Next →]                           │
│                                                                         │
│  Items per page: [10 ▼]                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

**Pagination Style:**
```
Container: flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6
Active Page: bg-indigo-600 text-white px-3 py-1 rounded-md
Inactive Page: text-gray-500 hover:bg-gray-50 px-3 py-1 rounded-md
Disabled: opacity-50 cursor-not-allowed
```

### 5.4 Empty State
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                              🔗                                         │
│                                                                         │
│                      No URLs yet                                        │
│              Get started by creating your first short URL               │
│                                                                         │
│                        [Create Short URL]                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Tailwind:** `text-center py-20`

---

## 6. Create / Edit URL Page (`/urls/new`, `/urls/:id/edit`)

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
│  │ shortly.com/                                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Leave empty for auto-generated code                                    │
│                                                                         │
│  Title (Optional)                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ My Link Title                                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Expiry Date (Optional)                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📅 2026-12-31                                    [Calendar Icon] │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Password Protection (Optional)                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ********                                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Require password before redirecting                                    │
│                                                                         │
│  [✓ Generate QR Code]                                                   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    [🚀 Create Short URL]                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Original URL | url | Yes | `z.string().url("Invalid URL format")` |
| Custom Alias | text | No | `z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/)` |
| Title | text | No | `z.string().max(150).optional()` |
| Expiry Date | date | No | Must be future date |
| Password | password | No | `z.string().min(4).optional()` |
| Generate QR | checkbox | No | boolean |

**Alias Availability Check:**
```
Typing... → Debounce 500ms → API check →
  ✅ Available  (text-green-600)
  ❌ Taken      (text-red-600)
  🔄 Checking... (text-gray-400)
```

### 6.2 Success Modal
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          🎉 Success!                                    │
│                                                                         │
│              Your short URL has been created successfully.              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🌐 shortly.com/abc123                              [📋 Copy]   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │  📊 View     │  │  ✏️ Edit    │  │  🏠 Home    │                     │
│  │  Analytics   │  │  URL        │  │             │                     │
│  └─────────────┘  └─────────────┘  └─────────────┘                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Modal:** `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`

---

## 7. URL Detail + Analytics Page (`/urls/:id/analytics`)

### 7.1 URL Info Header
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to My URLs                                                      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔗 shortly.com/spring-course                        [Status]   │   │
│  │  🌐 https://example.com/products/spring-boot-course             │   │
│  │  📅 Created: Apr 20, 2026  ⏰ Expires: Dec 31, 2026            │   │
│  │                                                                 │   │
│  │  [📋 Copy] [✏️ Edit] [🗑️ Delete] [🔒 Password] [📱 QR]         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Stats Overview Cards
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  1,245       │  │    895       │  │   89.2%      │  │   12 days    ││
│  │  Total       │  │   Unique     │  │  Bounce      │  │  Avg Lifespan││
│  │  Clicks      │  │   Visitors   │  │  Rate        │  │              ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Clicks Over Time Chart
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Clicks Over Time                                          [7D ▼] [30D ▼]│
│                                                                         │
│  Clicks                                                                 │
│  200 │                                              ┌───┐               │
│  150 │          ┌───┐    ┌───┐         ┌───┐       │   │    ┌───┐     │
│  100 │    ┌───┐ │   │    │   │ ┌───┐   │   │       │   │    │   │     │
│   50 │    │   │ │   │    │   │ │   │   │   │ ┌───┐ │   │    │   │     │
│    0 └────┴───┴─┴───┴────┴───┴─┴───┴───┴───┴─┴───┴─┴───┴────┴───┘     │
│         Mon   Tue   Wed   Thu   Fri   Sat   Sun                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Recharts Config:**
```typescript
<LineChart data={clicksOverTime}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="clicks" stroke="#4F46E5" strokeWidth={2} dot={{r: 4}} />
  <Line type="monotone" dataKey="uniqueClicks" stroke="#10B981" strokeWidth={2} dot={{r: 4}} />
</LineChart>
```

### 7.4 Browser & Device Charts (Side by Side)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐   │
│  │  Browsers                    │  │  Devices                     │   │
│  │                              │  │                              │   │
│  │     ┌───┐                    │  │     ┌───┐                    │   │
│  │  Chrome│███ 45%              │  │  Desktop│███ 60%             │   │
│  │  Safari│██   25%             │  │  Mobile │██   35%            │   │
│  │  Firefox│█   15%             │  │  Tablet │█    5%             │   │
│  │  Edge  │█   10%             │  │                              │   │
│  │  Other │     5%             │  │                              │   │
│  │                              │  │                              │   │
│  └──────────────────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Recharts Pie Chart:**
```typescript
<PieChart>
  <Pie data={browserData} cx="50%" cy="50%" innerRadius={60} outerRadius={80}
       paddingAngle={5} dataKey="value">
    {browserData.map((entry, index) => (
      <Cell key={index} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>
```

**Colors:** `['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']`

### 7.5 Top Referrers Table
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Top Referrers                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ #  │ Source              │ Clicks  │ % of Total │ Trend           │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ 1  │ twitter.com         │  450    │   36.1%    │ ▲ +12%          │ │
│  │ 2  │ Direct / None       │  320    │   25.7%    │ ▼ -5%           │ │
│  │ 3  │ facebook.com        │  180    │   14.5%    │ ▲ +8%           │ │
│  │ 4  │ linkedin.com        │  120    │    9.6%    │ ▲ +3%           │ │
│  │ 5  │ google.com          │   95    │    7.6%    │ ▼ -2%           │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.6 Geo Location Table
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Clicks by Location                                                     │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ #  │ Country     │ City        │ Clicks  │ Unique │ %            │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ 1  │ 🇺🇸 USA      │ New York    │  420    │  310   │ 33.7%        │ │
│  │ 2  │ 🇮🇳 India    │ Mumbai      │  380    │  290   │ 30.5%        │ │
│  │ 3  │ 🇬🇧 UK       │ London      │  180    │  140   │ 14.5%        │ │
│  │ 4  │ 🇩🇪 Germany  │ Berlin      │  120    │   95   │  9.6%        │ │
│  │ 5  │ 🇨🇦 Canada   │ Toronto     │   85    │   60   │  6.8%        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.7 Recent Clicks Log
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Recent Clicks (Last 50)                                                │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Time           │ IP Address    │ Browser  │ Device  │ Country    │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ 2 mins ago     │ 192.168.1.*** │ Chrome   │ Desktop │ 🇺🇸 USA     │ │
│  │ 15 mins ago    │ 203.0.113.*** │ Safari   │ Mobile  │ 🇮🇳 India   │ │
│  │ 1 hour ago     │ 198.51.100.***│ Firefox  │ Desktop │ 🇬🇧 UK      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Admin Dashboard (`/admin/dashboard`)

### 8.1 Admin Stats Cards
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                                        │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  1,250       │  │   24,500     │  │  1.2M        │  │     15       ││
│  │  Total Users │  │  Total URLs  │  │ Total Clicks │  │ Suspicious   ││
│  │  ↑ +45       │  │  ↑ +320      │  │  ↑ +89K      │  │ URLs Flagged ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

**Admin Card Style:** Same as dashboard but with admin accent colors

### 8.2 Platform Activity Chart
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Platform Activity (Last 30 Days)                                       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  [Bar Chart: URLs Created vs Clicks per day]                    │   │
│  │                                                                 │   │
│  │  URLs ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │   │
│  │  Clicks ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Recharts Config:**
```typescript
<BarChart data={platformActivity}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />
  <Tooltip />
  <Legend />
  <Bar yAxisId="left" dataKey="urlsCreated" fill="#4F46E5" name="URLs Created" />
  <Bar yAxisId="right" dataKey="clicks" fill="#10B981" name="Clicks" />
</BarChart>
```

### 8.3 User Growth Chart
```
┌─────────────────────────────────────────────────────────────────────────┐
│  User Growth                                                            │
│                                                                         │
│  Users                                                                  │
│  1.5K│                                          ●────●                 │
│  1.2K│                                    ●────●                       │
│  900 │                              ●────●                             │
│  600 │                        ●────●                                   │
│  300 │                  ●────●                                         │
│    0 ●────●────●────●────●                                             │
│      Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.4 Recent Users Table
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Recent Users                                      [View All Users →]   │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ User            │ Email           │ Role   │ Status │ Joined     │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ 👤 John Doe     │ john@email.com  │ USER   │ ✅ Active│ 2 hrs ago │ │
│  │ 👤 Jane Smith   │ jane@email.com  │ USER   │ ✅ Active│ 5 hrs ago │ │
│  │ 👤 Admin User   │ admin@site.com  │ ADMIN  │ ✅ Active│ 1 day ago │ │
│  │ 👤 Spam Bot     │ spam@evil.com   │ USER   │ 🚫 Block│ 2 days ago│ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.5 Suspicious URLs Alert
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚠️ Suspicious URLs Requiring Attention                                 │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Short URL      │ Original URL        │ Reason      │ Actions      │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ shortly.com/x1 │ phishing-bank.com   │ Phishing    │ [Disable]    │ │
│  │ shortly.com/x2 │ malware-site.com    │ Malware     │ [Disable]    │ │
│  │ shortly.com/x3 │ spam-link.com       │ Spam        │ [Disable]    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Alert Container:** `bg-red-50 border border-red-200 rounded-xl p-6`

---

## 9. Admin Users Management (`/admin/users`)

### 9.1 Users Table
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Users Management                                                       │
│                                                                         │
│  ┌────────────────────────┐ ┌──────────┐ ┌──────────┐                  │
│  │ 🔍 Search users...     │ │ Role ▼   │ │ Status ▼ │                  │
│  └────────────────────────┘ └──────────┘ └──────────┘                  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ [✓] │ User      │ Email       │ Role  │ Status │ URLs │ Actions  │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ [✓] │ John Doe  │ john@...    │ USER  │ ✅     │  12  │ ⋮        │ │
│  │ [✓] │ Jane S.   │ jane@...    │ USER  │ ✅     │   8  │ ⋮        │ │
│  │ [✓] │ Admin     │ admin@...   │ ADMIN │ ✅     │  45  │ ⋮        │ │
│  │ [✓] │ Spam B.   │ spam@...    │ USER  │ 🚫     │   0  │ ⋮        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  [Block Selected] [Delete Selected]          ← Previous  [1] [2] Next →│
└─────────────────────────────────────────────────────────────────────────┘
```

**Actions Dropdown per User:**
```
⋮ → View Profile | Edit Role | Block/Unblock | Delete Account
```

**Role Badge:**
```
USER:  bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs
ADMIN: bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs
```

---

## 10. Admin URLs Management (`/admin/urls`)

### 10.1 URLs Table
```
┌─────────────────────────────────────────────────────────────────────────┐
│  URLs Management                                                        │
│                                                                         │
│  ┌────────────────────────┐ ┌──────────┐ ┌──────────┐                  │
│  │ 🔍 Search URLs...      │ │ Status ▼ │ │ User ▼   │                  │
│  └────────────────────────┘ └──────────┘ └──────────┘                  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Short URL    │ Original URL    │ Owner    │ Clicks │ Status │ ⋮   │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ shortly/abc  │ example.com/... │ John Doe │ 1,245  │ ✅     │ ⋮   │ │
│  │ shortly/xyz  │ github.com/...  │ Jane S.  │   45   │ ✅     │ ⋮   │ │
│  │ shortly/bad  │ evil.com/...    │ Spam B.  │    0   │ 🚫     │ ⋮   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 11. User Profile Page (`/profile`)

### 11.1 Profile Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  My Profile                                                             │
│                                                                         │
│  ┌──────────────────┐  ┌─────────────────────────────────────────────┐ │
│  │                  │  │  Profile Information                        │ │
│  │    ┌──────┐      │  │                                             │ │
│  │    │  👤  │      │  │  Full Name                                  │ │
│  │    │      │      │  │  ┌─────────────────────────────────────┐   │ │
│  │    └──────┘      │  │  │ John Doe                            │   │ │
│  │                  │  │  └─────────────────────────────────────┘   │ │
│  │  [Change Photo]  │  │                                             │ │
│  │                  │  │  Username                                   │ │
│  │                  │  │  ┌─────────────────────────────────────┐   │ │
│  │                  │  │  │ johndoe                             │   │ │
│  │                  │  │  └─────────────────────────────────────┘   │ │
│  │                  │  │                                             │ │
│  │                  │  │  Email                                      │ │
│  │                  │  │  ┌─────────────────────────────────────┐   │ │
│  │                  │  │  │ john@example.com                    │   │ │
│  │                  │  │  └─────────────────────────────────────┘   │ │
│  │                  │  │                                             │ │
│  │                  │  │  Phone Number                               │ │
│  │                  │  │  ┌─────────────────────────────────────┐   │ │
│  │                  │  │  │ +1 (555) 123-4567                   │   │ │
│  │                  │  │  └─────────────────────────────────────┘   │ │
│  │                  │  │                                             │ │
│  │                  │  │  ┌─────────────────────────────────────┐   │ │
│  │                  │  │  │     [💾 Save Changes]               │   │ │
│  │                  │  │  └─────────────────────────────────────┘   │ │
│  └──────────────────┘  └─────────────────────────────────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Security                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │ Current Password                                        │   │   │
│  │  │ ┌─────────────────────────────────────────────────────┐ │   │   │
│  │  │ │ ********                                            │ │   │   │
│  │  │ └─────────────────────────────────────────────────────┘ │   │   │
│  │  │ New Password                                            │   │   │
│  │  │ ┌─────────────────────────────────────────────────────┐ │   │   │
│  │  │ │ ********                                            │ │   │   │
│  │  │ └─────────────────────────────────────────────────────┘ │   │   │
│  │  │ Confirm New Password                                    │   │   │
│  │  │ ┌─────────────────────────────────────────────────────┐ │   │   │
│  │  │ │ ********                                            │ │   │   │
│  │  │ └─────────────────────────────────────────────────────┘ │   │   │
│  │  │                                                       │   │   │
│  │  │ ┌─────────────────────────────────────────────────────┐ │   │   │
│  │  │ │     [🔒 Change Password]                          │ │   │   │
│  │  │ └─────────────────────────────────────────────────────┘ │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Active Sessions                                                │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │ 🖥️  Chrome on Windows - New York, USA                   │   │   │
│  │  │     Current session · IP: 192.168.1.1                   │   │   │
│  │  │                                                       │   │   │
│  │  │ 📱 Safari on iPhone - Mumbai, India                     │   │   │
│  │  │     Last active: 2 hours ago · [Revoke]                 │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Avatar:**
```
Container: w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center
Fallback: text-4xl font-bold text-gray-400 (initials)
```

---

## 12. Shared Components

### 12.1 Toast Notifications
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ✅ Success              │  ❌ Error              │  ℹ️ Info      │   │
│  │  URL created!            │  Failed to create URL │  Loading...   │   │
│  │                          │                       │               │   │
│  │  [✕]                     │  [✕]                  │  [✕]          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Position:** `fixed top-4 right-4 z-50`

**Variants:**
```
Success: bg-green-50 border-green-200 text-green-800
Error:   bg-red-50 border-red-200 text-red-800
Info:    bg-blue-50 border-blue-200 text-blue-800
Warning: bg-yellow-50 border-yellow-200 text-yellow-800
```

### 12.2 Modal / Dialog
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Title                                    [✕]                   │   │
│  │                                                                 │   │
│  │  Content goes here...                                           │   │
│  │                                                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐                               │   │
│  │  │   Cancel    │  │   Confirm   │                               │   │
│  │  └─────────────┘  └─────────────┘                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ████████████████████████████████████████████████████████████████████   │
│  (Backdrop: bg-black bg-opacity-50)                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Confirm Button:** `bg-indigo-600 text-white hover:bg-indigo-700`
**Cancel Button:** `bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`

### 12.3 Loading States

**Skeleton Loader:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ┌────────┐                                                      │   │
│  │  │ ██████ │  ████████████████                                   │   │
│  │  │ ██████ │  ████████████████████████████                       │   │
│  │  │ ██████ │  ████████████                                       │   │
│  │  └────────┘                                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Tailwind:** `animate-pulse bg-gray-200 rounded`

**Spinner:**
```
Border: border-4 border-gray-200
Spinner: border-t-4 border-indigo-600 rounded-full w-8 h-8 animate-spin
```

### 12.4 Confirmation Dialog (Delete)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        🗑️                                       │   │
│  │                                                                 │   │
│  │              Delete this URL?                                   │   │
│  │                                                                 │   │
│  │  This action cannot be undone. This will permanently            │   │
│  │  delete the short URL and all associated analytics.             │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐                       │   │
│  │  │    Cancel       │  │    Delete       │                       │   │
│  │  └─────────────────┘  └─────────────────┘                       │   │
│  │                       (bg-red-600 text-white)                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.5 Data Table Component
```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination: PaginationState;
  sorting: SortingState;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  selectable?: boolean;
  loading?: boolean;
}
```

**Features:**
- Sortable headers (click to sort ↑↓)
- Row selection (checkbox)
- Bulk actions toolbar
- Empty state
- Loading skeleton
- Responsive horizontal scroll

---

## 13. Responsive Breakpoints

```
Mobile:  < 640px   (sm)  → Stack all columns, hide sidebar, hamburger menu
Tablet:  640-1024px (md)  → 2-column grids, condensed tables
Desktop: > 1024px   (lg)  → Full layout, sidebar visible, multi-column
```

### Mobile Navigation
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [☰]  🔗 Shortly                              [👤]                     │
└─────────────────────────────────────────────────────────────────────────┘

☰ Click → Slide-in Drawer:
┌────────┐
│  ✕     │
│  ────  │
│  Dashboard
│  My URLs
│  Analytics
│  ────  │
│  Profile
│  Settings
│  Logout
└────────┘
```

### Mobile Cards (My URLs)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔗 shortly.com/abc123                               [⋮]       │   │
│  │  🌐 example.com/very-long-url...                                │   │
│  │  📅 Apr 20, 2026                                                │   │
│  │                                                                 │   │
│  │  [1,245 Clicks]  [895 Unique]                                   │   │
│  │                                                                 │   │
│  │  [📋] [📊] [✏️] [🗑️]                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 14. State Management (Zustand Stores)

### 14.1 Auth Store
```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

### 14.2 URL Store
```typescript
interface URLStore {
  urls: URLItem[];
  selectedUrl: URLItem | null;
  filters: URLFilters;
  pagination: PaginationState;
  setFilters: (filters: URLFilters) => void;
  createUrl: (data: CreateURLDTO) => Promise<void>;
  deleteUrl: (id: string) => Promise<void>;
}
```

### 14.3 Analytics Store
```typescript
interface AnalyticsStore {
  dashboardStats: DashboardStats | null;
  urlAnalytics: URLAnalytics | null;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  fetchDashboardStats: () => Promise<void>;
  fetchUrlAnalytics: (urlId: string) => Promise<void>;
}
```

---

## 15. Form Validation Rules (Zod Schemas)

```typescript
// Login
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

// Register
const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(150),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  email: z.string().email(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(v => v === true, "You must accept the terms"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Create URL
const createURLSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL").min(1),
  customAlias: z.string()
    .max(50)
    .regex(/^[a-zA-Z0-9_-]*$/, "Only letters, numbers, hyphens, and underscores")
    .optional(),
  title: z.string().max(150).optional(),
  expiryDate: z.string().datetime().optional(),
  password: z.string().min(4, "Min 4 characters").optional(),
  generateQR: z.boolean().optional(),
});
```

---

## 16. Animation Specifications

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Page Fade In | Route change | 200ms | ease-out |
| Card Hover | Mouse enter | 150ms | ease-in-out |
| Modal Open | Click | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Modal Backdrop | Click | 150ms | ease-out |
| Toast Slide In | State change | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Skeleton Pulse | Loading | 2s | ease-in-out (infinite) |
| Dropdown Menu | Click | 100ms | ease-out |
| Stats Counter | Mount | 1s | ease-out |
| Chart Draw | Data load | 800ms | ease-out |

**Tailwind Classes:**
```
Fade In: animate-fade-in (custom)
Slide In: animate-slide-in-right (custom)
Pulse: animate-pulse
Spin: animate-spin
Transition: transition-all duration-200 ease-in-out
```

---

*End of Frontend Design Document*
