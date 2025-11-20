# Components Directory

This directory contains **shared** components that are used across multiple features or pages.

## Structure

- **layout/**: Components used in page layouts (Header, Sidebar, Navigation, Logo).
- **ui/**: "Dumb" UI components (Buttons, Inputs, Cards, etc.), typically from Shadcn UI.
- **providers/**: Global providers or HOCs (e.g. `withQueryClient`).

## Guidelines

- **Feature-specific components** should NOT be here. They belong in `src/features/<feature-name>/components`.
- **Domain logic** should NOT be here. Use `src/features/<feature-name>/hooks` or `src/shared`.
