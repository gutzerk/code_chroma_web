/** Shared destination links. Desktop uses the logo for Home;
    the mobile menu includes every item. */
export const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/documentation", label: "Documentation" },
  { href: "/canvas", label: "Live map" },
  { href: "/install", label: "Install" },
];

/** Nav items for the desktop top bar. */
export const NAV_ITEMS_DESKTOP = NAV_ITEMS.filter((i) => i.href !== "/");
