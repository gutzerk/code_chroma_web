"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Drop the trailing slash (`trailingSlash: true` yields "/install/") so paths compare. */
const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

/** Nav link that highlights itself when it points at the current page. */
export default function NavLink({
  href,
  className = "",
  activeClassName = "",
  onClick,
  children,
}: {
  href: string;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = normalize(pathname ?? "") === normalize(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? activeClassName : ""}`.trim()}
    >
      {children}
    </Link>
  );
}
