/** Shared destination links for the nav. The desktop Nav omits Home (the logo
    is the home link) and Install (it is the primary button), while the mobile
    menu includes every item. */
export const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/documentation", label: "Documentation" },
  { href: "/canvas", label: "Live map" },
  { href: "/install", label: "Install" },
];

/** Nav items for the desktop top bar. */
export const NAV_ITEMS_DESKTOP = NAV_ITEMS.filter((i) => i.href !== "/" && i.href !== "/install");
