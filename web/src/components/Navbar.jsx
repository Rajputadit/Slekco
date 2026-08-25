import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const NAV_LINKS = [
  { label: "Shop", to: "/shop" },
  { label: "Footwear", to: "/shop?category=footwear" },
  { label: "Apparel", to: "/shop?category=apparel" },
  { label: "Tech", to: "/shop?category=audio" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function onSearch(e) {
    e.preventDefault();
    navigate(`/shop${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-paper/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="font-display text-2xl tracking-tight">
          Slekco
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-ink/70 transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <form onSubmit={onSearch} className="hidden md:block">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Search products…"
              aria-label="Search products"
              className="w-56 rounded-full border border-ink/15 bg-white px-4 py-2 text-sm outline-none focus:border-ink/40"
            />
          </form>

          <Link
            to="/cart"
            aria-label="View cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 hover:border-ink/30"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink/5 bg-paper md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            <form onSubmit={onSearch} className="mb-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Search products…"
                aria-label="Search products"
                className="input"
              />
            </form>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
