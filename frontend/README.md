# Kit

A League of Legends stats app — search any account for ranked stats, champion mastery, and match history. Built with the Riot Games API, styled for the Rift.

## Features

- Search any League of Legends account by summoner name or Riot ID (`Name#TAG`)
- Ranked Solo/Duo and Ranked Flex stats (tier, rank, LP, wins/losses, win rate bar)
- Top 6 highest mastery champions with mastery levels and season-milestone progress
- Recent match history with expandable details: gold/damage diff, full 5v5 rosters, per-player damage bars, item builds, and MVP
- Click any player in a match to open their profile
- Region support (NA, EUW, KR, and more) with Riot ID tags (`Name#TAG`)
- Recent searches + example hint + `/` keyboard shortcut to focus search
- Dark/light mode toggle with system preference detection and sliding thumb
- Server-side Riot API calls — your API key never leaves the server

## Getting Started

Requirements: Node.js 18+, pnpm

```bash
pnpm install
cp .env.example .env.local   # add your Riot API key
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Get a Riot API key at https://developer.riotgames.com.

## Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| `pnpm dev`      | Start the dev server       |
| `pnpm build`    | Production build           |
| `pnpm start`    | Serve the production build |
| `pnpm lint`     | oxlint                  |
| `pnpm test`     | Jest tests              |

## Stack

- Next.js (App Router, server components) — project lives at the repo root
- React 19
- TypeScript
- Tailwind CSS
- Native fetch (Riot API)
- oxlint + Jest
- pnpm

## Notes

- Static data (champion ids, rank/mastery images) lives in `components/` and `components/imgs/`.