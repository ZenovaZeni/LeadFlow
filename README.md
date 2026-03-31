# 🌊 LeadFlow: AI-Powered SMS Lead Conversion

LeadFlow is a high-performance SaaS platform designed to automate lead capture, qualification, and booking via AI-driven SMS conversations. It enables service-based businesses to react instantaneously to missed calls and inquiries, ensuring no lead goes cold.

## 🚀 Core Features

### 1. **The Human-Like AI Assistant**
- **Instant Response:** Automatically triggers SMS replies to missed calls or web inquiries.
- **Dynamic Qualification:** AI asks pre-defined qualification questions (e.g., "What's the tree height?") before booking.
- **Industry Blueprints:** Pre-configured "Hard Rules" and Bio templates for various niches (Tree Service, HVAC, Plumbing, etc.).

### 2. **Admin Command Center (Agency Hub)**
- **Scanning Assistant:** Deep-scrape client websites via Firecrawl to extract services, tone, and FAQs.
- **One-Click Activation:** Approve a scraped draft to instantly provision a Supabase account, Telnyx number, and AI persona.
- **Teleportation:** Admins can "impersonate" any client dashboard to fine-tune settings or assist in high-stakes conversations.

### 3. **Real-Time Lead Management**
- **Live Pulse:** A global ticker of all incoming leads and AI interactions.
- **Lead Temperature:** Automatically scores leads (Cold, Warm, Hot) based on intent and urgency keywords.
- **Manual Escalation:** Flag high-value leads for immediate human intervention.

## 🛠 Tech Stack

- **Frontend:** React, Vite, Framer Motion, TailwindCSS.
- **Backend:** Node.js (Express) with Supabase SDK.
- **Database:** Supabase (PostgreSQL) with Row-Level Security (RLS).
- **Communication:** Telnyx API for SMS/Voice.
- **AI Engine:** Google Gemini 2.0 Flash (via `@google/generative-ai`).
- **Data Acquisition:** Firecrawl for intelligent website scraping.

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Project
- Telnyx Account & API Key
- Firecrawl API Key
- Google AI API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ZenovaZeni/LeadFlow.git
   cd LeadFlow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root and `/server` directory (see `.env.example`).

4. **Run Locally:**
   - Frontend: `npm run dev`
   - Backend: `cd server && npm start`

## 🛡 Security & Compliance
- **RLS Enabled:** All database tables are protected by Supabase Row-Level Security.
- **Admin Gating:** The Admin Command Center is restricted to authorized developer emails.

---
*Built with absolute speed and precision by ZenovaZeni.*
