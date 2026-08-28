import Link from "next/link";
import Image from "next/image";
import logo from "@/components/imgs/logo.png";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { HeaderSearch } from "./HeaderSearch";

const Header = () => {
  return (
    <header className="glass sticky top-0 z-[60] border-b border-black/5 bg-[#F5F2EC]/70 backdrop-blur-md after:pointer-events-none after:absolute after:left-0 after:right-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-[#F5F2EC]/70 after:to-transparent dark:border-white/5 dark:bg-night-950/70 dark:after:from-night-950/70">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="brand-link btn-press flex shrink-0 items-center gap-2.5">
          <Image
            src={logo}
            alt="Teemo Logo"
            className="brand-logo h-9 w-9 rounded-lg ring-1 ring-gold-400/30"
          />
          <span className="brand-name text-sm font-extrabold tracking-tight text-stone-800 dark:text-gold-300 md:text-base">
            Kit
            <span className="text-gold-500 dark:text-gold-400">.GG</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <HeaderSearch />
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
};

export default Header;