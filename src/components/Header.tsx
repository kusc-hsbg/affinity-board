/* 원본 사이트 헤더: 로고 + GNB + 우측 유틸(LOGIN/JOIN/Cart/검색) */
const MENUS = [
  { label: "ABOUT", href: "https://affinityuniverse.com/About" },
  { label: "PORTFOLIO", href: "https://affinityuniverse.com/PORTFOLIO" },
  { label: "ART BOOK DESIGN", href: "https://affinityuniverse.com" },
  { label: "AFFINITY DESIGN", href: "https://affinityuniverse.com" },
  { label: "PICTURE BOOK DESIGN", href: "https://affinityuniverse.com" },
  { label: "CHARACTER IP DESIGN", href: "https://affinityuniverse.com" },
  { label: "DIGITAL DRAWING", href: "https://affinityuniverse.com" },
  { label: "VIDEO PRODUCTION", href: "https://affinityuniverse.com" },
  { label: "WEB DESIGN", href: "https://affinityuniverse.com" },
  { label: "CODE DESIGN", href: "https://affinityuniverse.com" },
  { label: "CONTACT US", href: "https://affinityuniverse.com/CONTACTUS" },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="inside">
        <div className="top-bar">
          <a href="https://affinityuniverse.com">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://cdn.imweb.me/thumbnail/20230511/ecde84ca9b797.png"
              alt="AFFINITY UNIVERSE 어피니티 유니버스"
              width={230}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </a>
          <div className="util">
            <a href="https://affinityuniverse.com/login">LOGIN</a>
            <a href="https://affinityuniverse.com/join">JOIN</a>
            <a href="https://affinityuniverse.com/cart">Cart 0</a>
            <a href="https://affinityuniverse.com/search" aria-label="site search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
            </a>
          </div>
        </div>
        <nav className="gnb">
          {MENUS.map((m) => (
            <a key={m.label} href={m.href}>
              {m.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
