import { Link, useLocation } from "wouter";
import { Users, User, LogOut, Shield, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

function fmtPoints(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

export function Navbar() {
  const [location] = useLocation();
  const { data: user } = useGetMe({ query: { retry: false } as any });
  const queryClient = useQueryClient();

  const logoutMut = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        window.location.href = import.meta.env.BASE_URL || "/";
      },
      onError: () => {
        queryClient.clear();
        window.location.href = import.meta.env.BASE_URL || "/";
      },
    }
  });

  const handleLogout = () => {
    queryClient.clear();
    logoutMut.mutate();
  };

  if (!user) return null;

  const navItems = [
    { href: "/", label: "Discover", icon: Users },
    { href: "/follows", label: "Activity", icon: Zap },
    { href: "/guide", label: "Guide", icon: BookOpen },
    { href: "/profile", label: "Profile", icon: User },
  ];

  if (user.isAdmin) {
    navItems.push({ href: "/admin", label: "Admin", icon: Shield });
  }

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-background/80 border-b border-white/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">

          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(255,0,80,0.4)]">
              <img src={`${import.meta.env.BASE_URL}tiktok-logo.png`} alt="FollowExchange" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              FollowExchange
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10 shadow-inner">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={"flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 " + (
                  location === item.href
                    ? "bg-white text-black shadow-md"
                    : "text-muted-foreground hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1.5 text-sm hidden sm:flex items-center gap-1.5 bg-secondary/10 text-secondary hover:bg-secondary/20 border-0 transition-colors cursor-default">
              <Zap size={13} className="animate-pulse" />
              <span className="font-bold">{fmtPoints(user.points)}</span>
              <span className="text-xs opacity-70">pts</span>
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMut.isPending}
              className="flex items-center gap-2 border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 rounded-full transition-all text-xs sm:text-sm"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex items-center justify-around px-2 py-1 safe-area-bottom">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={"flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all min-w-[52px] " + (
                location === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <item.icon size={20} className={location === item.href ? "drop-shadow-[0_0_6px_rgba(255,0,80,0.8)]" : ""} />
              <span className="text-[9px] font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
