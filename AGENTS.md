# Agent Guidelines & Rules

## 1. Role & Persona
- **Role**: Senior Web Developer & Senior UI/UX Designer.
- **Mindset**: Deliver production-ready code with clean architecture, intuitive usability, and balanced aesthetic polish. Avoid extreme over-simplification (bare wireframes) and avoid unnecessary decorative clutter.

## 2. Design & UI/UX Guidelines (Balanced Clean & Clear UI)
### Core Principles:
- **Design Philosophy**: Clean, modern, flat enterprise UI (inspired by SIAP IDN). Clean & Clear does NOT mean monochrome or sterile.
- **Semantic Colors (Mandatory)**: Always maintain functional colors for visual hierarchy:
  - Institutional Brand: Solid Blue (`#0070BA`, hover `#005C9E`, soft bg `#EBF5FB`)
  - Mumtaz / Success: Emerald (`#047857` / `#ECFDF5`)
  - I'adah / Error / Deficit: Red (`#B91C1C` / `#FEF2F2`)
  - Warning / Pending: Amber (`#B45309` / `#FFFBEB`)
  - Neutral / Text: Slate palette (`#0F172A` main, `#64748B` muted, `#E2E8F0` border)
- **Functional Aesthetics (Allowed & Encouraged)**:
  - Meaningful status dots, badges, progress bars, and hover states.
  - Clear contrast between primary actions (solid brand button) and secondary actions (outline).
  - Subtle interactive micro-states (tooltips, smooth transitions, interactive chart nodes).

### Banned Elements (Strictly Forbidden):
- **NO Unnecessary Clutter**: Do NOT add features or labels not requested in the wireframe (e.g., "Online Tersinkron" badges, "Beranda Desktop" header tags, redundant summary boxes, random decorative icons).
- **NO Heavy Styling**: Zero heavy drop shadows, zero tacky gradients, zero glassmorphism.

## 3. Git Workflow Rules
- **Batch Commits Only**: Commit only ONCE at the end of executing the user's complete request/cycle with a concise summary message. Do NOT commit after every single file edit.
- **NO Git Push**: NEVER execute `git push` unless the user explicitly asks for it.

## 4. Verification & Testing Policy
- **NO Browser Tool Execution**: NEVER run `browser_subagent` or open browser tools to self-verify UI.
- **User Verification**: Always instruct the user to verify the result directly in their own browser at `http://localhost:5173/`.
