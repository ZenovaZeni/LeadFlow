# 🧠 Knowledge Base - SMS Lead Follow-Up System

## 🌟 Business Overview
This project is an **Instant SMS Lead Follow-Up System** designed for **local service operators** (Plumbers, Roofers, Cleaners, Detailers, Tree Services, etc.).

### 🔴 The Problem
Local business owners are busy (on jobs, in transit) and often reply to leads too late. If they don't reply in **< 5 minutes**, the lead goes to a competitor. This results in **lost revenue** and anxiety.

### 🟢 The Solution
A **24/7 Digital Intake Assistant** that:
1.  **Instantly replies via SMS** to new leads.
2.  **Qualifies leads** with short, natural questions (Gathering scope, address, urgency).
3.  **Summarizes** the interaction and sends a push notification to the owner.
4.  **Organizes** leads in a clean dashboard for follow-up scheduling.

---

## 🏗 System Architecture (Advanced v2.0)

### 1. **Data Acquisition (Firecrawl)**
The system uses **Firecrawl** to perform deep-scrapes of prospective client websites. It extracts:
- Core services and pricing models.
- Business hours and service areas.
- Frequently Asked Questions (FAQs).
- Brand "Voice" and "Tone" for the AI persona.

### 2. **The Hybrid DFY (Done-For-You) Strategy**
Instead of a complex self-serve onboarding, the Admin (Agency) performs the heavy lifting:
1. **Scrape:** Admin enters a URL.
2. **Review:** Admin reviews the extracted "Draft Profile".
3. **Activate:** One-click provisioning of the sub-account.
4. **Teleport:** Admin "jumps in" to the client's dashboard to refine the AI's "Hard Rules".

### 3. **AI Persona Engine**
- **LLM:** Google Gemini 2.0 Flash.
- **Context:** Highly specific "AI Bio" + "Hard Rules" (e.g., "Always ask for photos of the tree").
- **Escalation:** Automatic detection of keywords (emergency, leak, ASAP) for manual handoff.

### 4. **Infrastructure**
- **Auth:** Supabase Auth (Admin-initiated invites).
- **Storage:** Supabase PostgreSQL (Leads, Bookings, Businesses, Notification tables).
- **SMS:** Telnyx Messaging API.
- **Backend:** Express.js proxy for secure API key management and webhook handling.

---

## 🎯 Target Audience
*   **Trades & Hard Services**: Tree Service, Landscaping, HVAC, Plumbers, Handymen (High urgency, emergency-adjacent).
*   **Cleaning & Detailing**: Maids, Auto Detailers (Requires schedule management).

---

## 💡 Core Philosophy & Sales Strategy
*   **Don't just show data; show MONEY.** Business owners think in potential revenue and lost jobs, not "leads".
*   **Make the AI visible.** The owner needs to feel "Holy sh*t, this thing is doing work for me."
*   **Build Urgency & Loss Aversion.** Highlight missed opportunities, slow responses, and unreturned messages.
*   **Frictionless Demo**: A simulated live event showing a user submitting a form and the system responding in real-time is the "WOW" moment for sales.

---

## 🔧 Product Features & Terminology
*   **AI Qualification Script**: The questions the AI asks to qualify a lead.
*   **Potential Revenue**: Calculated value of open leads ($250 min ticket default).
*   **Booked Revenue**: Value of jobs scheduled.
*   **Missed Revenue**: Value of leads lost/unresponded.
*   **Live Activity Feed**: Real-time log of leads, AI responses, and customer replies.
*   **Teleport / Impersonation**: Admin ability to view the app as a specific client.

---
*Updated: 2026-03-31*
