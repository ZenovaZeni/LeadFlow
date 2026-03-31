# Design System Specification: High-Performance Lead Management

## 1. Overview & Creative North Star
### The Creative North Star: "The Kinetic Sanctuary"
This design system rejects the cluttered, utility-first aesthetics of traditional CRM tools in favor of a "Kinetic Sanctuary." It is a high-performance environment that feels both intellectually sharp and visually calming. We move beyond the "SaaS Template" by utilizing **Atmospheric Depth**—a technique where UI elements aren't just placed on a grid, but inhabit a 3D space defined by light, blur, and tonal shifts.

By utilizing intentional asymmetry and expansive breathing room (the "Luxury Gap"), we signal to the user that their time is valuable and their data is handled with elite precision. We don't use lines to separate ideas; we use the gravity of typography and the soft boundaries of light.

---

## 2. Color Theory & Tonal Architecture
The palette is rooted in a "Deep Sea" dark mode (`background: #060e20`) that provides a stable, high-trust foundation for the vibrant Indigo and Violet energy.

### The "No-Line" Rule
**Strict Mandate:** Prohibit the use of 1px solid borders for sectioning or containment. 
Structure must be defined by:
- **Background Shifts:** Placing a `surface-container-low` component on a `surface` background.
- **Tonal Transitions:** Using the `surface-container` hierarchy (Lowest to Highest) to "nest" importance. 
- **Light as Structure:** A subtle `0.5px` inner glow (using `outline-variant` at 10% opacity) is the only acceptable "edge" for glassmorphic cards.

### Signature Textures & Glass
To achieve the "SaaS-Elite" feel, main CTAs and "Live Mode" indicators should utilize a linear gradient: 
`linear-gradient(135deg, #a3a6ff 0%, #8455ef 100%)`.
For floating stat cards, apply `backdrop-blur: 20px` with a background color of `surface-variant` at 60% opacity. This "Glassmorphic" layer allows the deep neutrals of the background to bleed through, creating a sense of integrated sophistication.

---

## 3. Typography: The Editorial Authority
We pair the technical precision of **Inter** for utility with the confident, geometric presence of **Manrope** for display moments.

- **Display (Manrope):** Used for "Hero Stats" and high-level headers. The large scale (`display-lg: 3.5rem`) creates an editorial feel that demands attention without shouting.
- **Body (Inter):** Reserved for SMS simulations and data labels. Inter’s high x-height ensures legibility during high-speed lead follow-ups.
- **Hierarchy as Navigation:** Use `label-sm` in `secondary-dim` for metadata to create a clear "read-order" that doesn't rely on icons or dividers.

---

## 4. Elevation & Depth: Tonal Layering
We avoid the "shadow-heavy" look of 2010s material design. Instead, we use **Tonal Stacking**.

- **The Layering Principle:** 
    - **Base:** `surface-dim` (#060e20)
    - **Sections:** `surface-container-low` (#091328)
    - **Primary Cards:** `surface-container` (#0f1930)
    - **Active/Hover States:** `surface-container-highest` (#192540)
- **Ambient Shadows:** When an element must "float" (e.g., a modal or a primary action button), use an extra-diffused shadow: `box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.45)`. The shadow must never be pure black; it should be a deep tint of the `on-surface` color to mimic natural light absorption.
- **The Ghost Border:** For accessibility, use a "Ghost Border" of `outline-variant` at **15% opacity**. This provides a hint of a boundary that disappears into the background upon casual glance.

---

## 5. Elite Components

### Glassmorphic Stat Cards
- **Structure:** `surface-variant` at 40% opacity + `backdrop-blur(16px)`.
- **Glow:** An inner-shadow of `primary-dim` (10% opacity) at the top-left corner to simulate a light source.
- **Content:** Use `display-sm` for the primary metric. No dividers; use a `2.5rem` (Space 10) gap between the metric and the trend line.

### SMS Simulation (The iPhone Frame)
- **Container:** A sleek, minimal SVG frame using `outline` token at 20% opacity.
- **Bubbles:** Lead messages use `surface-container-high`; User replies use the `secondary-container` to create a clear "Action vs. Observation" distinction.
- **Animation:** Messages should slide in with a "Spring" curve (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`).

### Interactive Line Charts
- **The "Pulse" Line:** The path should use `primary` with a 2px stroke width.
- **The "Area" Glow:** A gradient fill from `primary` (20% opacity) to `transparent` at the baseline.
- **Interaction:** Hovering over data points triggers a `tertiary` pulsing dot (the "Live" indicator) to signal real-time data fetching.

### Modern Multi-Step Steppers
- **Progress:** Forgo the "Circle and Line" standard. Use a horizontal bar where the active step is `primary-fixed` and inactive steps are `surface-container-highest`.
- **Motion:** As users move between steps, the entire container should perform a subtle `20px` horizontal slide to reinforce the "Flow" in LeadFlow.

---

## 6. Do’s and Don’ts

### Do:
- **Use "The Luxury Gap":** Use `Space 12` (3rem) or `Space 16` (4rem) between major sections. Whitespace is a premium feature.
- **Embrace Asymmetry:** Align metrics to the left while keeping descriptive text right-aligned in a 2-column grid to break the "SaaS grid" monotony.
- **Pulsing States:** Use a subtle scale animation (1.0 to 1.05) on the "Live Mode" indicator using `secondary`.

### Don't:
- **Never use 100% opaque borders.** It breaks the "Kinetic Sanctuary" atmosphere.
- **Avoid standard "Drop Shadows."** If it looks like a shadow from 2014, it is too heavy. Use tonal shifts instead.
- **No Divider Lines.** If you feel the need to add a line between list items, increase the `spacing` to `Space 4` or `Space 5` and use a `surface-container` background shift instead.
- **Don't over-saturate.** Keep the `tertiary` (pink/magenta) colors for micro-moments and alerts only; the "Elite" feeling comes from the restrained use of the `primary` Indigo.