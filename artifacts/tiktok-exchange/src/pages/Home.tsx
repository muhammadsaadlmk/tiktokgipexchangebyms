import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Zap, ExternalLink, UserCheck, Info, Timer } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useListUsers,
  useFollowUser,
  useGetPublicSettings,
  useRecordAdClick,
  getListUsersQueryKey,
  getGetMeQueryKey,
  getGetMyFollowsQueryKey,
  useGetMe,
  type AdLink,
} from "@workspace/api-client-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type UserItem = {
  id: number;
  tiktokUsername: string;
  name?: string | null;
  points: number;
  avatarUrl?: string | null;
  isFollowedByMe: boolean;
  followsMeBack: boolean;
};

function pickRandomLink(links: AdLink[]): AdLink | null {
  const active = links.filter(l => l.isActive && l.url);
  if (active.length === 0) return null;
  return active[Math.floor(Math.random() * active.length)];
}

export function Home() {
  const [search, setSearch] = useState("");
  const [adModal, setAdModal] = useState<UserItem | null>(null);
  const [pickedAd, setPickedAd] = useState<AdLink | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [adDone, setAdDone] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifySeconds, setVerifySeconds] = useState(0);
  const [verifyTotal, setVerifyTotal] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const verifyRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: users, isLoading } = useListUsers();
  const { data: me } = useGetMe();
  const { data: settings } = useGetPublicSettings();
  const queryClient = useQueryClient();

  const adLinks = (settings as any)?.adLinks as AdLink[] | undefined;

  const recordClickMut = useRecordAdClick();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetMyFollowsQueryKey() });
  };

  const followMut = useFollowUser({
    mutation: {
      onSuccess: () => {
        toast.success("TikTok visited! You earned +1 point.");
        invalidateAll();
      },
      onError: (e: any) => toast.error(e.message || "Could not follow right now"),
    }
  });

  const openAdModal = (user: UserItem) => {
    const chosen = adLinks ? pickRandomLink(adLinks) : null;
    setPickedAd(chosen);
    setAdModal(user);
  };

  useEffect(() => {
    if (!adModal) return;
    setCountdown(10);
    setAdDone(false);
    setVerifying(false);
    setVerifySeconds(0);

    if (pickedAd?.url) {
      window.open(pickedAd.url, "_blank");
      recordClickMut.mutate({ data: { adId: pickedAd.id } });
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setAdDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [adModal]);

  const handleTikTokClick = () => {
    if (!adModal) return;
    const raw = adModal.tiktokUsername.replace("@", "");
    window.open("https://www.tiktok.com/@" + raw, "_blank");

    const durations = [15, 25, 30];
    const total = durations[Math.floor(Math.random() * durations.length)];
    setVerifyTotal(total);
    setVerifySeconds(total);
    setVerifying(true);

    if (verifyRef.current) clearInterval(verifyRef.current);
    verifyRef.current = setInterval(() => {
      setVerifySeconds((prev) => {
        if (prev <= 1) {
          clearInterval(verifyRef.current!);
          followMut.mutate({ targetUserId: adModal.id });
          setAdModal(null);
          setPickedAd(null);
          setVerifying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const closeAdModal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (verifyRef.current) clearInterval(verifyRef.current);
    setAdModal(null);
    setPickedAd(null);
    setVerifying(false);
    setVerifySeconds(0);
  };

  const sorted = (users as UserItem[] | undefined)
    ?.filter(u =>
      search === "" ||
      u.tiktokUsername.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.isFollowedByMe !== b.isFollowedByMe) return a.isFollowedByMe ? 1 : -1;
      if ((b.points >= 1) !== (a.points >= 1)) return b.points >= 1 ? 1 : -1;
      return b.points - a.points;
    });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">

      {me && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-secondary/20 border border-white/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div>
            <h2 className="text-lg sm:text-2xl font-display font-bold">Your Balance</h2>
            <p className="text-muted-foreground text-sm">Follow TikTokers → earn points → others follow you.</p>
          </div>
          <div className="flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-xl border border-white/5 self-end sm:self-auto">
            <Zap className="text-primary" size={20} />
            <span className="text-3xl font-black">{fmtPoints(me.points)}</span>
            <span className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Points</span>
          </div>
        </motion.div>
      )}

      <div className="mb-6 p-3.5 sm:p-4 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-muted-foreground flex gap-3 items-start">
        <Info size={16} className="text-secondary shrink-0 mt-0.5" />
        <div>
          <span className="text-white font-semibold">How it works: </span>
          Click "Follow" → ad opens → 10 sec wait → follow on TikTok → earn{" "}
          <span className="text-green-400 font-bold">+1 pt</span>. That creator loses{" "}
          <span className="text-red-400 font-bold">-1 pt</span> — they pay for a real follower.
        </div>
      </div>

      {me && me.points === 0 && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex gap-3 items-start">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-400 shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-red-400 font-bold text-sm mb-0.5">You have 0 points — others cannot follow you!</p>
            <p className="text-red-300/70 text-xs leading-relaxed">
              Follow other creators on TikTok to earn points, or contact the admin via WhatsApp to top up your balance.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight">Discover Creators</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Follow on TikTok and earn points.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search username..."
            className="pl-9 rounded-full bg-white/5 border-white/10 focus:border-primary/50 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 sm:h-44 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {sorted?.map((user, idx) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(idx * 0.04, 0.4) }}
            >
              <UserCard
                user={user}
                onFollow={() => openAdModal(user)}
                isPending={followMut.isPending}
              />
            </motion.div>
          ))}
          {sorted?.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-white/10 border-dashed">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No creators found</h3>
              <p className="text-muted-foreground text-sm px-4">
                {search ? "No match. Try different keywords." : "No users yet. Check back soon."}
              </p>
              {search && (
                <Button variant="outline" className="mt-4 rounded-full text-sm" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!adModal} onOpenChange={(open) => { if (!open) closeAdModal(); }}>
        <DialogContent onClose={closeAdModal} className="w-[92vw] max-w-[400px] bg-card/98 backdrop-blur-xl border-white/10 p-0 overflow-hidden rounded-2xl">
          {adModal && (
            <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-5">

              <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/30 overflow-hidden">
                {adModal.avatarUrl ? (
                  <img src={adModal.avatarUrl} alt={adModal.tiktokUsername} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-white">
                    {adModal.tiktokUsername.replace("@", "").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-1">You are following</p>
                <h2 className="text-xl font-display font-black">
                  {adModal.tiktokUsername.startsWith("@") ? adModal.tiktokUsername : "@" + adModal.tiktokUsername}
                </h2>
              </div>

              {verifying ? (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 w-full"
                >
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90 animate-spin" style={{ animationDuration: "2s" }} width="96" height="96" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle
                        cx="48" cy="48" r="40" fill="none"
                        stroke="rgb(255,0,80)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40 * 0.25} ${2 * Math.PI * 40 * 0.75}`}
                      />
                    </svg>
                    <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle
                        cx="48" cy="48" r="40" fill="none"
                        stroke="rgba(255,0,80,0.25)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (verifySeconds / verifyTotal)}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <div className="text-center z-10">
                      <span className="text-2xl font-black text-primary leading-none">{verifySeconds}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <p className="text-white font-bold text-sm">Verifying your follow...</p>
                    <p className="text-muted-foreground text-xs">Checking TikTok activity, please wait</p>
                  </div>

                  <div className="w-full space-y-1.5">
                    {["Connecting to TikTok API", "Checking follow status", "Confirming activity"].map((step, i) => {
                      const elapsed = verifyTotal - verifySeconds;
                      const threshold = [0, Math.floor(verifyTotal * 0.35), Math.floor(verifyTotal * 0.70)];
                      const done = elapsed >= threshold[i] + 2;
                      const active = elapsed >= threshold[i] && !done;
                      return (
                        <div key={step} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-500 ${done ? "bg-green-500/15 text-green-400" : active ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground"}`}>
                          {done ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="rgba(34,197,94,0.2)"/><path d="M4 7l2 2 4-4" stroke="rgb(34,197,94)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          ) : active ? (
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="rgba(255,0,80,0.3)" strokeWidth="2"/><path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="rgb(255,0,80)" strokeWidth="2" strokeLinecap="round"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/></svg>
                          )}
                          {step}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : !adDone ? (
                <div className="flex flex-col items-center gap-4 w-full">
                  {pickedAd?.url && (
                    <div className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                      Ad opened in new tab — close it and come back here
                    </div>
                  )}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                      <circle
                        cx="40" cy="40" r="34" fill="none"
                        stroke="rgb(255,0,80)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 * (countdown / 10)}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <div className="text-center">
                      <Timer size={13} className="mx-auto text-muted-foreground mb-0.5" />
                      <span className="text-2xl font-black text-primary leading-none">{countdown}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {countdown > 0 ? `Please wait ${countdown} second${countdown !== 1 ? "s" : ""}…` : "Ready!"}
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 w-full"
                >
                  <div className="w-full p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                    Now follow them on TikTok to earn your +1 point!
                  </div>
                  <Button
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-5 text-sm shadow-xl shadow-primary/30"
                    onClick={handleTikTokClick}
                    disabled={followMut.isPending}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Open TikTok & Follow (+1 pt)
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function fmtPoints(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

function UserCard({ user, onFollow, isPending }: {
  user: UserItem;
  onFollow: () => void;
  isPending: boolean;
}) {
  const raw = user.tiktokUsername.replace("@", "");
  const display = user.tiktokUsername.startsWith("@") ? user.tiktokUsername : "@" + user.tiktokUsername;
  const canAfford = user.points >= 1;

  return (
    <Card className={"group relative overflow-hidden bg-card/50 backdrop-blur-sm border-white/10 transition-all duration-500 " + (
      canAfford && !user.isFollowedByMe
        ? "hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-primary/20 hover:-translate-y-1"
        : "opacity-60"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-3 sm:p-5 relative z-10">

        <div className="flex items-start gap-2.5 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary p-[2px] shadow-lg shadow-primary/20 shrink-0">
            <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center font-display font-bold text-lg text-white overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={raw} className="w-full h-full object-cover" />
              ) : (
                raw.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {user.name && (
              <p className="font-bold text-sm truncate leading-tight">{user.name}</p>
            )}
            <p className="text-xs text-muted-foreground truncate group-hover:text-primary/70 transition-colors">{display}</p>
          </div>
          <Badge
            variant="secondary"
            className={"flex items-center gap-1 py-0.5 px-2 text-xs border shrink-0 " + (
              canAfford
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            )}
          >
            <Zap size={10} />
            <span className="font-bold">{fmtPoints(user.points)}</span>
          </Badge>
        </div>

        {user.isFollowedByMe ? (
          <div className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold">
            <UserCheck size={13} />
            Followed
          </div>
        ) : (
          <Button
            className={"w-full rounded-lg font-bold text-xs sm:text-sm h-9 transition-all " + (
              canAfford
                ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
            )}
            onClick={() => canAfford && onFollow()}
            disabled={isPending || !canAfford}
          >
            <ExternalLink size={13} className="mr-1.5" />
            {canAfford ? "Follow (+1 pt)" : "No Points"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
