# JodJam — Frontend

> จดจำ · หนึ่งวัน หนึ่งความทรงจำ

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Stack

- React 18 + Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Framer Motion
- Recharts
- Zod

## Structure

```
src/
├── api/          API calls
├── app/          router, providers, layouts
├── components/   reusable UI components
├── hooks/        custom hooks (TanStack Query)
├── lib/          axios, query-client, utils
├── pages/        route pages
├── schemas/      Zod validation
├── store/        Zustand global state
├── types/        TypeScript types
└── styles/       global CSS
```
