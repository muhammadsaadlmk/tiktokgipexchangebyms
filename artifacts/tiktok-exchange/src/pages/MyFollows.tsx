import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowRightLeft, ExternalLink, TrendingUp } from "lucide-react";
import { useGetMyFollows } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type FollowUser = {
  id: number;
  tiktokUsername: string;
  points: number;
  avatarUrl?: string | null;
};

function fmtPoints(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

export function MyFollows() {
  const { data, isLoading } = useGetMyFollows();
  const [activeTab, setActiveTab] = useState<"following" | "followers">("following");

  const following = (data?.following || []) as FollowUser[];
  const followers = (data?.followers || []) as FollowUser[];

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight mb-2">My Activity</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
          Track who you followed on TikTok and who followed you back.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("following")}
            className={"flex-1 sm:flex-none px-5 sm:px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 " + (
              activeTab === "following"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-white"
            )}
          >
            <ExternalLink size={15} />
            I Followed
            <span className={"px-2 py-0.5 rounded-full text-xs " + (activeTab === "following" ? "bg-white/20" : "bg-white/10")}>
              {following.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("followers")}
            className={"flex-1 sm:flex-none px-5 sm:px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 " + (
              activeTab === "followers"
                ? "bg-secondary text-black shadow-lg shadow-secondary/20"
                : "text-muted-foreground hover:text-white"
            )}
          >
            <Users size={15} />
            Followed Me
            <span className={"px-2 py-0.5 rounded-full text-xs " + (activeTab === "followers" ? "bg-black/20" : "bg-white/10")}>
              {followers.length}
            </span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse border border-white/5" />)}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {activeTab === "following" && following.map((user, idx) => (
              <motion.div key={user.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                <ListRow user={user} type="following" />
              </motion.div>
            ))}
            {activeTab === "followers" && followers.map((user, idx) => (
              <motion.div key={user.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                <ListRow user={user} type="followers" />
              </motion.div>
            ))}

            {((activeTab === "following" && following.length === 0) ||
              (activeTab === "followers" && followers.length === 0)) && (
              <div className="py-20 text-center bg-card/30 backdrop-blur border border-white/10 rounded-3xl border-dashed">
                <ArrowRightLeft className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-display font-bold mb-2">Nothing here yet</h3>
                <p className="text-muted-foreground text-sm px-6">
                  {activeTab === "following"
                    ? "Go to Discover and follow creators on TikTok to earn points!"
                    : "No one has followed your TikTok yet. Keep following others to get noticed!"}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function ListRow({ user, type }: { user: FollowUser; type: "following" | "followers" }) {
  const raw = user.tiktokUsername.replace("@", "");
  const display = user.tiktokUsername.startsWith("@") ? user.tiktokUsername : "@" + user.tiktokUsername;
  const tiktokUrl = "https://www.tiktok.com/@" + raw;

  return (
    <Card className="hover:bg-white/5 transition-all duration-300 border-white/5 bg-card/50 backdrop-blur">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={"w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-base shadow-inner shrink-0 overflow-hidden " + (
            type === "following"
              ? "bg-primary/20 text-primary border border-primary/20"
              : "bg-secondary/20 text-secondary border border-secondary/20"
          )}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={raw} className="w-full h-full object-cover" />
            ) : (
              raw.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm sm:text-base tracking-tight truncate">{display}</h4>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
            >
              <ExternalLink size={10} />
              View on TikTok
            </a>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <TrendingUp size={10} /> {fmtPoints(user.points)} pts
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={"shrink-0 px-2.5 py-1 font-bold text-xs hidden sm:flex " + (
            type === "following"
              ? "border-primary/30 text-primary bg-primary/5"
              : "border-secondary/30 text-secondary bg-secondary/5"
          )}
        >
          {type === "following" ? "+1 pt earned" : "-1 pt spent"}
        </Badge>
      </CardContent>
    </Card>
  );
}
