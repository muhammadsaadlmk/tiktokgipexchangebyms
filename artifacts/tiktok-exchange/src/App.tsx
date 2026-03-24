import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useGetMe } from "@workspace/api-client-react";
import { Toaster } from "sonner";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AuthPage } from "@/pages/AuthPage";
import { Home } from "@/pages/Home";
import { MyFollows } from "@/pages/MyFollows";
import { Profile } from "@/pages/Profile";
import { Admin } from "@/pages/Admin";
import { Guide } from "@/pages/Guide";
import NotFound from "@/pages/not-found";
import { queryClient } from "@/lib/queryClient";

const WHATSAPP_NUMBER = "447473102782";

function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl p-4 w-64 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Contact Admin</p>
          <p className="text-sm text-white/80 mb-3 leading-relaxed">Need help or have questions? Chat with the admin on WhatsApp.</p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1db954] text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors"
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>
          <p className="text-center text-xs text-muted-foreground mt-2">+44 7473 102782</p>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#1db954] text-white shadow-lg shadow-[#25D366]/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ width: 52, height: 52 }}
        aria-label="Contact admin on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>
    </div>
  );
}

function ProtectedRoutes() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } as any });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shadow-primary/30 animate-pulse">
            <img src={`${import.meta.env.BASE_URL}tiktok-logo.png`} alt="Loading" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/follows" component={MyFollows} />
          <Route path="/guide" component={Guide} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin">
            {user.isAdmin ? <Admin /> : <Redirect to="/" />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <WhatsAppButton />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <ProtectedRoutes />
      </WouterRouter>
      <Toaster theme="dark" position="top-center" richColors />
    </QueryClientProvider>
  );
}

export default App;
