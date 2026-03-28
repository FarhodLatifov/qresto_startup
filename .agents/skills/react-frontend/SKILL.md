---
name: React 19 + Tailwind v4 UI Development
description: Skill for building and modifying React components, UI, and custom hooks using Tailwind v4, Vite, and Framer Motion.
---

# React Frontend UI/UX Skill

## Context
A modern React 19 application using Vite for building, Tailwind CSS v4 for styling, and Framer Motion for micro-animations. It contains strict separation of concerns between guest menus and the admin dashboard.

## Guidelines
1. **Component Structure**:
   - Keep UI components decoupled from business logic (data fetching/Supabase queries).
   - Use `clsx` and `tailwind-merge` for conditional class combinations.
2. **Styling**:
   - Native Tailwind v4 approaches. 
   - Avoid generic boring colors. Use rich, premium aesthetics as dictated by standard agent behavior (vibrant colors, glassmorphism if appropriate, smooth gradients).
3. **State Management**:
   - Opt for standard React hooks (`useState`, `useReducer`, `useSyncExternalStore`).
   - Push state down the tree where possible to prevent unnecessary large re-renders.
4. **Dependencies**:
   - Add new packages only if completely unavoidable. Build custom UI elements rather than importing heavy third-party libs when feasible.
5. **Animations (Framer Motion)**:
   - Use specific, subtle animations for adding items to the cart, opening modals, or status changes. Make the interface feel responsive and alive.
