import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

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

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
}));

describe("Home", () => {
  it("renders the summoner search form", () => {
    render(<Home />);
    expect(screen.getByPlaceholderText("Summoner name#NA1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByText("Try: Doublelift")).toBeInTheDocument();
  });

  it("navigates to the player page when searching", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.type(screen.getByPlaceholderText("Summoner name#NA1"), "Doublelift");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByPlaceholderText("Summoner name#NA1")).toBeInTheDocument();
  });
});