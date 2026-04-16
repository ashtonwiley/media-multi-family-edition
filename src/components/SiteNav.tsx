import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Shield } from "lucide-react";

const SiteNav = () => {
  const { pathname } = useLocation();
  const linkCls = (path: string) =>
    `px-4 py-2 rounded-full text-sm font-bold transition-smooth ${
      pathname === path
        ? "bg-brand text-primary-foreground shadow-glow"
        : "text-foreground/80 hover:text-foreground hover:bg-secondary"
    }`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <nav className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Media Multi logo" className="w-10 h-10 rounded-full shadow-soft" />
          <div className="leading-tight">
            <div className="font-bold text-lg display">Media Multi</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3 text-safe" /> Family Edition
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/" className={linkCls("/")}>Home</Link>
          <Link to="/mission" className={linkCls("/mission")}>Our Mission</Link>
        </div>
      </nav>
    </header>
  );
};

export default SiteNav;
