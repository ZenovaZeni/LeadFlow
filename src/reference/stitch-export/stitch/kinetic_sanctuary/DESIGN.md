# Design System Specification: High-Performance Kinetic Sanctuary

## 1. Overview & Creative North Star: "The Precise Sanctuary"
This design system moves beyond the standard "SaaS dashboard" aesthetic to create a **Precise Sanctuary**. It is a high-performance environment that balances the clinical authority of a data-driven tool with the atmospheric calm of a premium digital lounge. 

The transition from violet to **High-Performance Indigo (#4F46E5)** signals a shift from "creative play" to "executive execution." We break the "template" look through **intentional asymmetry**, where heavy typographic headers are balanced by vast amounts of negative space, and elements are layered using tonal depth rather than structural lines. The goal is a UI that feels "carved" out of a single, dark obsidian block rather than assembled from separate boxes.

---

## 2. Colors: Tonal Architecture
The palette is rooted in deep navy neutrals (`#060e20`) and energized by the Indigo-Blue primary suite. 

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. To separate a sidebar from a main feed, use a shift from `surface` to `surface-container-low`. 

### Surface Hierarchy & Nesting
Depth is achieved through a "nested" approach. Treat the UI as physical layers of smoked glass:
*   **Base Level:** `surface` (#060e20)
*   **Deepest Recess:** `surface-container-lowest` (#000000) for immersive backgrounds.
*   **Elevated Content:** `surface-container` (#0f1930) or `surface-container-high` (#141f38) for cards and modals.

### The "Glass & Gradient" Rule
To avoid a flat, "boxy" feel, floating elements (Modals, Hover Tooltips) should use **Glassmorphism**:
*   **Fill:** `surface-variant` at 60% opacity.
*   **Effect:** Backdrop blur of 20px–40px.
*   **Signature Glow:** Primary CTAs should utilize a subtle linear gradient: `primary-dim` to `primary` at a 135° angle.

---

## 3. Typography: Editorial Authority
We utilize **Manrope** across all scales. The hierarchy is designed to feel like a high-end financial journal.

*   **Display (lg/md/sm):** Used for "Hero" moments and data milestones. Set with a tight letter-spacing (-0.02em) to feel authoritative.
*   **Headline (lg/md/sm):** The workhorse for section titles. Use `on-surface` color to maintain high contrast against the dark sanctuary background.
*   **Body (lg/md/sm):** Set in `on-surface-variant` (#a3aac4) to reduce eye strain. Use `body-lg` for lead paragraphs to guide the user's eye.
*   **Labels:** Always uppercase with 0.05em tracking when used for categorization or small metadata.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We use **Ambient Radiance** to convey height.

*   **The Layering Principle:** Place a `surface-container-low` card on a `surface` background. The subtle shift in hex value provides enough "lift" without visual clutter.
*   **Ambient Shadows:** For high-elevation elements (Modals), use a shadow with a 64px blur, 0px offset, and 8% opacity using the `primary` color (#a7a5ff) to create a "blue-tinted atmospheric glow."
*   **The Ghost Border Fallback:** If a divider is mandatory for accessibility, use the `outline-variant` (#40485d) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Precision Primitives

### Buttons
*   **Primary:** Background: Gradient (`primary-dim` to `primary`). Text: `on-primary`. Corner: `md` (0.75rem).
*   **Secondary:** Background: `surface-container-highest`. Text: `primary`. No border.
*   **States:** On hover, primary buttons should emit a `primary_fixed_dim` outer glow (8px blur).

### Cards & Lists
*   **The Divider Ban:** Never use lines between list items. Use `spacing-4` (1rem) of vertical whitespace or alternating `surface-container-low` and `surface-container` backgrounds.
*   **Interaction:** Cards should subtly scale (1.02x) and shift from `surface-container` to `surface-bright` on hover.

### Input Fields
*   **Style:** Background: `surface-container-lowest`. 
*   **Active State:** The bottom edge glows with a 2px `primary` underline. The label should float and shift to `primary` color.
*   **Corner:** `sm` (0.25rem) for a more "technical" feel.

### Signature Component: The "Kinetic Metric"
A large `display-lg` number paired with a `label-md` descriptor. The number should use a subtle vertical gradient from `on-surface` to `primary` to make the data feel alive.

---

## 6. Do's and Don'ts

### Do
*   **Use Asymmetry:** Place a large headline on the left and a small "ghost" button on the far right to create a sophisticated, editorial balance.
*   **Embrace the Dark:** Keep 90% of the UI in the `surface` and `surface-container` range. Use the Indigo `primary` only for the "surgical strike"—where the user must act.
*   **Soft Corners:** Stick to the `md` (0.75rem) and `lg` (1rem) tokens for a "sanctuary" feel that avoids the aggression of sharp corners.

### Don't
*   **No Pure White:** Never use #FFFFFF. Use `on-surface` (#dee5ff) to maintain the blue-tinted dark mode harmony.
*   **No "Box-in-a-Box":** Avoid nesting more than two levels of containers. If you need a third level, use a typography shift instead of a new background color.
*   **No Standard Blue:** Ensure you are using the High-Performance Indigo (`#4F46E5` and its variants) and not a generic "Royal Blue."

---

## 7. Token Summary Reference

| Category | Token | Value |
| :--- | :--- | :--- |
| **Primary Accent** | `primary` | #a7a5ff (Indigo Tint) |
| **Deep Neutral** | `surface` | #060e20 |
| **Input Background**| `surface-container-lowest` | #000000 |
| **Main Heading** | `display-lg` | 3.5rem / Manrope |
| **Rounding** | `md` | 0.75rem |
| **Space** | `4` | 1rem |