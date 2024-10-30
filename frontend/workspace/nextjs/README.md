
## Setup

```
pnpm install
pnpm run dev
```

`.env` template:

```ini
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Init step (for record)

```
pnpm dlx create-next-app@latest --use-pnpm

pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add avatar
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add breadcrumb
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add sheet
pnpm dlx shadcn@latest add tooltip
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add alert-dialog
pnpm dlx shadcn@latest add progress
pnpm dlx shadcn@latest add accordion

pnpm install @react-oauth/google@latest
pnpm install axios

pnpm install jwt-decode
```

https://docs.fontawesome.com/web/use-with/react

```
pnpm install --save @fortawesome/fontawesome-svg-core
pnpm install --save @fortawesome/free-solid-svg-icons
pnpm install --save @fortawesome/free-regular-svg-icons
pnpm install --save @fortawesome/free-brands-svg-icons
pnpm install --save @fortawesome/react-fontawesome@latest
```

___

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
