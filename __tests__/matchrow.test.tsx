import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchRow } from "@/components/MatchRow";
import type { MatchSummary, MatchParticipant } from "@/lib/types";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: {
    src: string | { src: string };
    alt?: string;
    className?: string;
    priority?: boolean;
    width?: number;
    height?: number;
  }) => {
    const { src, alt, priority: _priority, ...rest } = props;
    // oxlint-disable-next-line next/no-img-element
    return <img src={typeof src === "string" ? src : src.src} alt={alt} {...rest} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const participant = (id: string, teamId: number): MatchParticipant => ({
  teamId,
  puuid: id,
  riotIdGameName: `Player${id}`,
  riotIdTagLine: "NA1",
  championId: 1,
  championName: "Annie",
  kills: 3,
  deaths: 2,
  assists: 5,
  cs: 180,
  goldEarned: 9200,
  totalDamageDealtToChampions: 15200,
  items: [1001, 1054, 0, 0, 0, 0, 3340],
  win: teamId === 100,
});

const match: MatchSummary = {
  id: "match-1",
  gameMode: "CLASSIC",
  championId: 1,
  championName: "Annie",
  win: true,
  kills: 3,
  deaths: 2,
  assists: 5,
  cs: 180,
  gameEndTimestamp: 1782431407000,
  gameDurationSec: 1542,
  winningTeamId: 100,
  participants: [
    ...Array.from({ length: 5 }, (_, i) => participant(`b${i}`, 100)),
    ...Array.from({ length: 5 }, (_, i) => participant(`r${i}`, 200)),
  ],
};

describe("MatchRow", () => {
  it("shows a damage bar under each player on the Players tab", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MatchRow match={match} ddVersion="15.4.1" champIcons={{}} selfPuuid="b0" />
    );
    await user.click(screen.getByRole("button", { name: /Victory/ }));
    expect(container.querySelectorAll('[aria-hidden="true"] .bg-sky-500\\/80, [aria-hidden="true"] .bg-red-500\\/80').length).toBeGreaterThanOrEqual(9);
    expect(screen.getAllByText(/dmg$/).length).toBeGreaterThanOrEqual(10);
  });

  it("renders items under each player on the Items tab", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MatchRow match={match} ddVersion="15.4.1" champIcons={{}} selfPuuid="b0" />
    );
    await user.click(screen.getByRole("button", { name: /Victory/ }));
    await user.click(screen.getByRole("tab", { name: "Items" }));

    const itemRows = container.querySelectorAll('[aria-label$=" items"]');
    expect(itemRows.length).toBe(10);
    const slots = container.querySelectorAll('[aria-label$=" items"] img');
    expect(slots.length).toBeGreaterThanOrEqual(20);
    expect(screen.getByText("Blue Side")).toBeInTheDocument();
    expect(screen.getByText("Red Side")).toBeInTheDocument();
    expect(itemRows[0].querySelectorAll("img").length).toBe(3);
    expect(itemRows[0].querySelectorAll(".border-dashed").length).toBe(4);
  });
});