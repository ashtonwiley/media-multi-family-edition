import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Shield, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SiteNav = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const linkCls = (path: string) =>
    `px-4 py-2 rounded-full text-sm font-bold transition-smooth ${
      pathname === path
        ? "bg-brand text-primary-foreground shadow-glow"
        : "text-foreground/80 hover:text-foreground hover:bg-secondary"
    }`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <nav className="container flex items-center justify-between py-4 gap-4">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img src={logo} alt="Media Multi logo" className="w-10 h-10 rounded-full shadow-soft" />
          <div className="leading-tight truncate">
            <div className="font-bold text-lg display">Media Multi</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3 text-safe" /> Family Edition
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          <Link to="/" className={linkCls("/")}>Home</Link>
          <Link to="/mission" className={linkCls("/mission")}>Our Mission</Link>
          {user && (
            <Link to="/kid" className={linkCls("/kid")}>
              <span className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3" />Kid</span>
            </Link>
          )}
          {user ? (
            <Link to="/parent" className={linkCls("/parent")}>
              <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" />Parents</span>
            </Link>
          ) : (
            <Link to="/auth" className={linkCls("/auth")}>
              <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" />Parents</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default SiteNav;
