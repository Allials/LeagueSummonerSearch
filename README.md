# LeagueSummonerSearch

A Next.js app using the Riot Games API to find and display League of Legends profile data such as level, icon, ranked stats, and champion mastery.

## Features

- Search any North American (NA) League of Legends account by summoner name
- Ranked Solo/Duo and Ranked Flex stats (tier, rank, LP, wins/losses, win rate bar)
- Top 6 highest mastery champions with mastery badges, tokens progression, and last-played dates
- Recent match history (last 10 games: champion, mode, KDA, outcome)
- Recent searches + example hint + `/` keyboard shortcut to focus search
- Dark/light mode toggle with system preference detection and sliding thumb
- Server-side Riot API calls — your API key never leaves the server
- Marcellus display type + Poppins UI, LoL-inspired palette, reduced-motion support

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
| `pnpm lint`     | ESLint                     |
| `pnpm test`     | Jest tests                 |

## Stack

- Next.js (App Router, server components) — project lives at the repo root
- React 19
- TypeScript
- Tailwind CSS
- Axios
- oxlint + Jest
- pnpm

## Notes

- Only NA accounts are supported at the moment.
- Static data (champion ids, rank/mastery images) lives in `components/` and `components/imgs/`.