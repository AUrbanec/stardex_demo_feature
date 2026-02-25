# Stardex Onboarding Prototype

Working prototype of the **Stardex Custom Field Consolidator & Schema Generator**.

## Implemented

- Next.js App Router + TypeScript + Tailwind setup
- Mocked Stardex shell layout (sidebar + top nav)
- `/onboarding` CSV upload and header analysis workflow
- `/api/analyze-schema` OpenAI integration (`gpt-5.2`, `reasoning_effort: "high"`)
- Mapping approval UI + generated TypeScript ETL script preview
- Drizzle ORM schema + SQLite/Postgres connection toggle

## Environment

Create `.env.local`:

```env
OPENAI_API_KEY=sk-your-openai-api-key
SUPABASE_URL=
NODE_ENV=development
```

## Run

```bash
npm run install
npm run dev
```

Open `http://localhost:3000/onboarding`.

## Database Commands

```bash
npm run db:generate
npm run db:push
```
