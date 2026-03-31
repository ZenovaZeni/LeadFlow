# 🛡️ Governance & Guardrails

To maintain a **premium, professional, and High-Converting UX**, all future edits, additions, and updates must adhere strictly to these rules.

---

## 🎨 Visual Guidelines

### 1. Color Palette
-   **Primary Background**: `rgba(10, 11, 14, 1)` (Deep Obsidian/Slate).
-   **Accent Tones**: Midnight Blue, subtle Frost Glass effects.
-   **Typography**: pure white (#FFFFFF), and muted subtitle gray (#94A3B8).
-   **Forbidden**: Neon/Gamer greens, hot-pinks, or generic bright blues.

### 2. Aesthetics & Depth
-   Use **subtle gradients** over solid blocks for premium feels.
-   Maximize depth with **layered box-shadow blur** (`box-shadow: 0 10px 50px rgba(0,0,0,0.5)`).
-   Transitions must be **smooth and deliberate** (`transition: all 0.3s ease-out`). No jarring jumps.

---

## ✍️ Copywriting Standards

### 1. Results > Tech
-   🚨 **NEVER** lead with the term "AI" in titles. It’s an implementation detail, not the selling point.
-   ✅ **Focus on**: Instant speeds, never missing jobs, organizing intake automatically.

### 2. No Jargon
-   Use terms local owners understand: "Dashboard," "Text Notifications," "Leads," "Replies."
-   Avoid: "Automation workflows," "Webhook streaming," "LLM endpoints."

---

## 📐 Code and Components

### 1. Pure Vanilla CSS
-   No TailwindCSS. Maintain maximum fidelity and ease-of-extension via bespoke components and layout weights.
-   Components must be structured modularly so individual views (Dashboard, Marketing) can be decoupled cleanly if later ported.

### 2. Framed View Management
-   Since this is an interactive product mockup, the Dashboard, SMS transitions, and Marketing site must allow fluid toggling of viewports to show the interconnected flow gracefully.
-   All inputs/outputs must render **realistic sample data** (e.g., Tree service, electrical, cleaners templates).
