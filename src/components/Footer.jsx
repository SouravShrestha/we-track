"use client";
import { usePathname } from "next/navigation";
import packageJson from "../../package.json";

const Footer = () => {
  const pathname = usePathname();

  // Footer should only be visible on the main home screen
  if (pathname !== "/") return null;

  return (
    <footer className="w-full bg-primarydark border-t border-colorborder pt-6 pb-8 z-50 px-4 sm:px-6">
      <div className="flex flex-col items-end justify-center text-colortextsecondary text-xs sm:text-sm">
        <span className="opacity-70">v{packageJson.version}</span>
        <span className="mt-1">&copy; 2026 WeTrack. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
