/** Shared destination links for the nav. The desktop Nav omits Home (the logo
    is the home link) while the mobile menu includes it; each file maps only the
    items it shows. */
export const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/documentation", label: "Documentation" },
  { href: "/configuration", label: "Configuration" },
  { href: "/install", label: "Install" },
];

/** Nav items without the home link, for the desktop top bar. */
export const NAV_ITEMS_DESKTOP = NAV_ITEMS.filter((i) => i.href !== "/");
