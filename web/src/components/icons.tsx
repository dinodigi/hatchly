/* Icons: minimal 1.6px line set, currentColor — ported verbatim from
   Design/app/icons.jsx (the v4 Hatchly system). Do not restyle. */

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number; sw?: number };

const Ic = ({ d, size = 18, sw = 1.6, fill = "none", children, ...p }: IconProps & { d?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

export const Icons = {
  back: (p: IconProps) => <Ic d="M15 18l-6-6 6-6" {...p} />,
  chevR: (p: IconProps) => <Ic d="M9 18l6-6-6-6" {...p} />,
  chevD: (p: IconProps) => <Ic d="M6 9l6 6 6-6" {...p} />,
  chevUp: (p: IconProps) => <Ic d="M18 15l-6-6-6 6" {...p} />,
  grid: (p: IconProps) => <Ic {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Ic>,
  plus: (p: IconProps) => <Ic d="M12 5v14M5 12h14" {...p} />,
  check: (p: IconProps) => <Ic d="M20 6L9 17l-5-5" {...p} />,
  x: (p: IconProps) => <Ic d="M18 6L6 18M6 6l12 12" {...p} />,
  lock: (p: IconProps) => <Ic {...p}><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Ic>,
  brain: (p: IconProps) => <Ic d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8A3 3 0 0 0 7 17a3 3 0 0 0 5 1 3 3 0 0 0 5-1 3 3 0 0 0 2-5.2A3 3 0 0 0 18 6a3 3 0 0 0-3-3 3 3 0 0 0-3 1.5A3 3 0 0 0 9 3zM12 4.5v13.5" {...p} />,
  target: (p: IconProps) => <Ic {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></Ic>,
  mic: (p: IconProps) => <Ic {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></Ic>,
  link: (p: IconProps) => <Ic {...p}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" /></Ic>,
  send: (p: IconProps) => <Ic d="M22 2L11 13M22 2l-7 20-4-9-9-4z" {...p} />,
  arrowUp: (p: IconProps) => <Ic d="M12 19V5M5 12l7-7 7 7" {...p} />,
  sparkle: (p: IconProps) => <Ic d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" {...p} />,
  flame: (p: IconProps) => <Ic {...p}><path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.4-2 .8-2.6C9 8 9 6 8.5 5c2 .6 3 2 3.5 4 .3-2.4 0-5-0-7z" /><path d="M12 22a5 5 0 0 0 5-5c0-2-1.2-3.2-2.2-4.2C14.5 14 13.5 15 12 15s-2.5-1-2.8-2.2C8 13.8 7 15 7 17a5 5 0 0 0 5 5z" /></Ic>,
  eye: (p: IconProps) => <Ic {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></Ic>,
  globe: (p: IconProps) => <Ic {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" /></Ic>,
  trophy: (p: IconProps) => <Ic {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M9 14.5h6M10 21h4M12 13v4" /></Ic>,
  chat: (p: IconProps) => <Ic {...p}><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l1.5-5A8.5 8.5 0 1 1 21 11.5z" /></Ic>,
  bell: (p: IconProps) => <Ic {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></Ic>,
  user: (p: IconProps) => <Ic {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Ic>,
  users: (p: IconProps) => <Ic {...p}><circle cx="9" cy="8" r="3.4" /><path d="M3 20a6 6 0 0 1 12 0M16 5.2a3.4 3.4 0 0 1 0 5.6M18 20a6 6 0 0 0-3-5.2" /></Ic>,
  dots: (p: IconProps) => <Ic {...p}><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></Ic>,
  edit: (p: IconProps) => <Ic d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" {...p} />,
  sun: (p: IconProps) => <Ic {...p}><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.4M12 19.6V22M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2 12h2.4M19.6 12H22M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" /></Ic>,
  moon: (p: IconProps) => <Ic d="M20 14.5A8 8 0 0 1 9.5 4 6.5 6.5 0 1 0 20 14.5z" {...p} />,
  settings: (p: IconProps) => <Ic {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Ic>,
  trash: (p: IconProps) => <Ic d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6" {...p} />,
  doc: (p: IconProps) => <Ic {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></Ic>,
  search: (p: IconProps) => <Ic {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></Ic>,
  voice: (p: IconProps) => <Ic d="M3 12h2l2-6 3 14 3-18 3 14 2-4h3" {...p} />,
  ext: (p: IconProps) => <Ic {...p}><path d="M15 3h6v6M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /></Ic>,
  rocket: (p: IconProps) => <Ic {...p}><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2a2.8 2.8 0 0 0-3-3z" /><path d="M9 13c5-7 9-9 12-9 0 3-2 7-9 12l-3-3z" /><circle cx="14.5" cy="8.5" r="1.3" /></Ic>,
  layers: (p: IconProps) => <Ic d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5" {...p} />,
  trend: (p: IconProps) => <Ic d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" {...p} />,
  arrowR: (p: IconProps) => <Ic d="M5 12h14M13 6l6 6-6 6" {...p} />,
  clock: (p: IconProps) => <Ic {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Ic>,
  copy: (p: IconProps) => <Ic {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></Ic>,
  flag: (p: IconProps) => <Ic d="M5 21V4M5 4h11l-1.5 3.5L16 11H5" {...p} />,
  shield: (p: IconProps) => <Ic d="M12 3l7 3v5.5c0 4.2-2.9 7.6-7 9.5-4.1-1.9-7-5.3-7-9.5V6z" {...p} />,
  logo: (p: IconProps) => (
    <Ic size={p.size || 24} sw={0} fill="currentColor">
      <path d="M12 2c-2.5 2-4 4.8-4 8 0 1.6.5 3 1.3 4.2C7.6 13.4 6 12 4.5 12c0 4 3.2 8 7.5 8s7.5-4 7.5-8c-1.5 0-3.1 1.4-4.8 2.2.8-1.2 1.3-2.6 1.3-4.2 0-3.2-1.5-6-4-8z" />
    </Ic>
  ),
};
