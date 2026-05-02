import { Instagram, Linkedin } from "lucide-react";

const platforms = [
  {
    key: "instagram",
    label: "Instagram",
    Icon: Instagram,
  },
  {
    key: "twitter",
    label: "X",
    mark: "X",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    Icon: Linkedin,
  },
];

function getAccentColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : "#1e3a5f";
}

function hexToRgba(hex, alpha) {
  const normalized = getAccentColor(hex).replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getExternalUrl(value) {
  const url = typeof value === "string" ? value.trim() : "";

  if (!url) {
    return "";
  }

  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function SocialLinkIcons({ socialLinks, accentColor, className = "" }) {
  const color = getAccentColor(accentColor);
  const links = platforms
    .map((platform) => ({
      ...platform,
      href: getExternalUrl(socialLinks?.[platform.key]),
    }))
    .filter((platform) => platform.href);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map(({ key, label, Icon, mark, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2"
          style={{
            backgroundColor: hexToRgba(color, 0.1),
            borderColor: hexToRgba(color, 0.28),
            color,
            "--tw-ring-color": hexToRgba(color, 0.35),
          }}
        >
          {Icon ? <Icon className="h-5 w-5" /> : mark}
        </a>
      ))}
    </div>
  );
}
