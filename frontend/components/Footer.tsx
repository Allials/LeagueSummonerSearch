import { IoLogoGithub, IoLogoLinkedin } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="border-t border-black/5 py-8 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <a
            className="btn-press flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-gold-300"
            href="https://github.com/andrew-vasquez"
            target="_blank"
            rel="noreferrer noopener"
          >
            <IoLogoGithub className="text-lg" />
            GitHub
          </a>
          <a
            className="btn-press flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-gold-300"
            href="https://www.linkedin.com/in/andrew-vasquez-000434237/"
            target="_blank"
            rel="noreferrer noopener"
          >
            <IoLogoLinkedin className="text-lg" />
            LinkedIn
          </a>
        </div>
        <p className="max-w-md text-center text-xs leading-relaxed text-stone-400 dark:text-stone-500">
          Data provided by Riot Games&apos; Developer API. Not endorsed by Riot
          Games and doesn&apos;t reflect the views or opinions of Riot Games.
        </p>
      </div>
    </footer>
  );
};

export default Footer;