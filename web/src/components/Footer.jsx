import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/5 bg-white">
      <div className="container-page grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-xl">Slekco</div>
          <p className="mt-3 max-w-xs text-sm text-ink/60">
            A multipurpose e-commerce brand spanning footwear, apparel, tech and home —
            one considered catalog, many categories.
          </p>
        </div>
        <div>
          <div className="label">Shop</div>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link to="/shop?category=footwear" className="hover:text-ink">Footwear</Link></li>
            <li><Link to="/shop?category=apparel" className="hover:text-ink">Apparel</Link></li>
            <li><Link to="/shop?category=audio" className="hover:text-ink">Audio</Link></li>
            <li><Link to="/shop?category=wearables" className="hover:text-ink">Wearables</Link></li>
          </ul>
        </div>
        <div>
          <div className="label">Company</div>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link to="/contact" className="hover:text-ink">Contact</Link></li>
            <li><Link to="/shop" className="hover:text-ink">All products</Link></li>
          </ul>
        </div>
        <div>
          <div className="label">Support</div>
          <ul className="space-y-2 text-sm text-ink/70">
            <li>Shipping &amp; returns</li>
            <li>Order tracking</li>
            <li>FAQ</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/5 py-5">
        <p className="container-page text-xs text-ink/45">
          © {new Date().getFullYear()} Slekco. Built for a technical assessment — not a real store.
        </p>
      </div>
    </footer>
  );
}
