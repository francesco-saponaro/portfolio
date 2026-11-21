# Francesco Saponaro, the site

My personal site: who I am, where I've worked, what I've built and how to reach me. One page, dark, with a small robot that flies from section to section as you scroll.

Live: https://portfolio-francesco-saponaro.netlify.app

## Stack

Next.js 15 (App Router, static export), React 19, TypeScript strict, plain CSS. Unbounded and Instrument Sans come in through `next/font`, so no request goes to Google from the visitor's browser. Tests with Vitest and Testing Library.

## Run it

```sh
npm ci
npm run dev        # http://localhost:3000
npm test -- --run  # the tests
npm run build      # static files in out/
```

## Add a project

Open `src/data/projects.ts` and push an object into `PROJECTS`:

```ts
{
  slug: "stix-lens",
  name: "STIX Lens",
  summary: "See what is inside a STIX 2.1 bundle before you import it.",
  stack: ["Vite", "React", "TypeScript"],
  repo: "https://github.com/francesco-saponaro/stix-lens",
  live: "https://stix-lens.netlify.app",
  year: 2026,
  image: { src: "/work/stix-lens.webp", alt: "What the screenshot shows" },
}
```

The screenshot goes in `public/work/`, 960 by 600 pixels, WebP. Retest has its own section: its words, numbers and screens are in `src/data/retest.ts`.

The projects strip picks it up on the next build: one card per entry, in the order of the array, with its screenshot on top.

## Where things are

- `src/data/site.ts`: the words on the page.
- `src/data/projects.ts`: the projects list.
- `src/components/site/home.tsx`: the page, section by section.
- `src/components/site/robot*.tsx|css`: the robot and the stage it flies on.
- `src/components/site/site.css`: the stylesheet, tokens at the top.
