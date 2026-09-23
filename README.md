# NexGenAi - Internal Telecaller Management System

A simple, modern, fast, and stable internal telecaller management and call tracking system built for **NexGenAi**.

![NexGenAi Banner](https://img.shields.io/badge/NexGenAi-Telecaller%20System-0BAA45?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-0BAA45?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8.3-purple?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20RLS-emerald?style=flat-square)

---

## 🌟 Features

### 🛡️ Admin Portal (`/admin/*`)
- **Executive Dashboard**: 4 real-time metric cards (*Total Leads*, *Calls Today*, *Connected*, *Pending Calls*) and live recent calls feed.
- **Team Quota Tracking**: Visual progress bars showing daily call target completion (default: 15 calls/day) for every telecaller.
- **Leads Management**: Full search, filtering (*All*, *Unassigned*, *Assigned*, *Called*, *Follow-up*, *Converted*), single lead creation with duplicate phone prevention, and 1-click worker assignment.
- **Bulk CSV Tools**: CSV Import with interactive preview & row-by-row validation, and CSV Export for leads and call history.
- **Worker Management**: Create worker accounts, configure custom daily targets, toggle active/inactive status, and reset passwords.
- **Performance Analytics**: Aggregated KPIs, conversion rate calculations, interactive Recharts visualizations (*Daily Calls vs Target*, *Connected vs Not Connected*), and comparison tables.
- **Follow-ups & Audit**: Track team callbacks and scheduled appointments.
- **Settings**: Company branding (**NexGenAi**), daily quota defaults, timezone (`Asia/Kolkata`), and telephony configuration.

### 📞 Worker Portal (`/worker/*`)
- **Mobile-First Design**: Optimized for mobile devices, tablets, and desktop with a bottom navigation bar.
- **Daily Target Progress**: Prominent progress bar showing completed calls vs daily target quota (e.g. `12 / 15 Calls`, `3 calls remaining`).
- **Assigned Leads Cards**: Quick view of client name, business, city, phone number, priority, and status.
- **Prominent CALL NOW Button**: Large 54px green button triggering automated telephony.
- **Automated Call Lifecycle & Live Timer**: Tracked progression from `CALLING...` $\rightarrow$ `RINGING...` $\rightarrow$ `CONNECTED` (live seconds counter) $\rightarrow$ `COMPLETED`.
- **Post-Call Disposition**: Modal to classify call outcome (*Interested*, *Follow-up* with date/time, *Not Interested*, *Converted*) and add notes.
- **Strict Data Isolation**: Workers only see their assigned leads, calls, and follow-ups.

---

## 🎨 Color System & Design Language
Inspired by fresh, clean quick-commerce UI principles:
- **Primary Green**: `#0BAA45`
- **Secondary Green**: `#16C763`
- **Light Green**: `#E9F9EF`
- **Background**: `#F7F8F6`
- **White**: `#FFFFFF`
- **Primary Text**: `#172017`
- **Secondary Text**: `#6B756D`
- **Border**: `#E5E9E5`

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, Canvas-Confetti
- **Backend / Database**: Supabase PostgreSQL with Row Level Security (RLS) policies
- **Telephony Subsystem**: Pluggable provider architecture with `MockTelephonyProvider` & production VoIP gateway support

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/shekharapurva6-create/calling-tracker.git

# Navigate into project directory
cd calling-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build Production Bundle
```bash
npm run build
```

---

## 🔑 Demo Access Credentials
- **Admin**: `admin@nexgenai.in` (Password: `admin123`)
- **Telecaller 1**: `rahul@nexgenai.in` (Rahul Kumar)
- **Telecaller 2**: `aman@nexgenai.in` (Aman Kumar)
*(Or use the 1-click Quick Login switchers on the login screens)*

---

## 📄 License
Internal proprietary software for **NexGenAi**.
