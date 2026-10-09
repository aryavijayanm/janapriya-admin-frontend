# Frontend — Next.js Project

## Tech Stack
- Framework  : Next.js  (App Router)
- Language   : TypeScript
- Styling    : Tailwind CSS
- HTTP Client: Axios (or fetch)
- State      : React useState/useContext

## Folder Structure (App Router)
src/
├── app/
│   ├── (public)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   └── users/
│   │   |    └── page.tsx
        └── customer/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/         (reusable buttons, inputs, modals)
│   └── layout/     (sidebar, navbar, header)
├── lib/
│   ├── api.ts      (axios instance with base URL + interceptors)
│   └── auth.ts     (token helpers)
└── types/
    └── index.ts    (shared TypeScript interfaces)

## Coding Rules
- Use App Router (not Pages Router)
- All API calls go through lib/api.ts (never fetch directly in components)
- Use TypeScript interfaces for all API responses
- Components should be small and single responsibility

## API Connection
- Backend runs on: http://localhost:4000
- All endpoints prefixed with /api
- Auth header format: Authorization: Bearer <token>

## User Interface Rules
- Always show loading states during API calls
- Always show error messages when API fails
- Form validation on frontend too (not just backend)