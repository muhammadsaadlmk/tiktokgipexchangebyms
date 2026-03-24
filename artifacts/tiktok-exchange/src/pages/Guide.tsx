import { motion } from "framer-motion";
import { Zap, UserCheck, Shield, MessageCircle, Users, Star, AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const WHATSAPP_NUMBER = "447473102782";

const sections = [
  {
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    title: "How the Points System Works",
    items: [
      "Every new account starts with 10 free points.",
      "Follow another creator on TikTok → you earn +1 point.",
      "When someone follows your TikTok → you spend -1 point.",
      "Points can never go below 0.",
      "If you hit 0 points, others cannot follow you until your balance is topped up.",
    ],
  },
  {
    icon: UserCheck,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    title: "How to Grow Your Followers",
    items: [
      "Visit the Discover page and click Follow on other creators.",
      "An ad opens — this funds the platform. Wait 10 seconds.",
      "After the countdown, click the TikTok link to visit their profile.",
      "You earn +1 point and they receive a real follower visit.",
      "The more you follow, the more you earn — and the more others follow you back.",
    ],
  },
  {
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "What Only the Admin Can Do",
    items: [
      "Add or remove follow relationships between users.",
      "Adjust any user's point balance (top up or deduct).",
      "Add, edit, or disable ad links on the platform.",
      "Create or delete user accounts.",
      "Grant or revoke admin access.",
      "View all follow activity across the platform.",
    ],
  },
  {
    icon: MessageCircle,
    color: "text-[#25D366]",
    bg: "bg-[#25D366]/10",
    border: "border-[#25D366]/20",
    title: "What You Can Request from the Admin",
    items: [
      "Top up your points if you've run out.",
      "Remove a follow from your list (unfollow is admin-only).",
      "Fix an incorrect point deduction.",
      "Report a user who is not following back on TikTok.",
      "Request a manual follow to be added to your profile.",
      "Get help with your account (password, username, avatar).",
    ],
  },
  {
    icon: Users,
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
    title: "Platform Rules",
    items: [
      "You cannot follow yourself.",
      "You can only follow each creator once.",
      "You must actually follow on TikTok — this is an honesty system.",
      "Unfollowing on TikTok without permission is against the spirit of the platform.",
      "Admin can remove bad actors from the platform.",
      "All unfollow requests must go through the admin via WhatsApp.",
    ],
  },
  {
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    title: "Tips to Maximise Your Growth",
    items: [
      "Follow as many creators as possible to build up points.",
      "Keep your point balance high so others can follow you.",
      "Make sure your TikTok profile is public and active.",
      "If you run low on points, contact the admin for a top-up.",
      "Check the Activity page to see who has followed you.",
    ],
  },
];

export function Guide() {
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight mb-3">
          Platform Guide
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
          Everything you need to know about FollowExchange — how it works, what you can do, and when to contact the admin.
        </p>
      </motion.div>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className={`border ${section.border} ${section.bg} backdrop-blur-sm`}>
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${section.bg} border ${section.border} shrink-0`}>
                    <section.icon size={18} className={section.color} />
                  </div>
                  <h2 className="font-display font-bold text-base sm:text-lg">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <ArrowRight size={14} className={`${section.color} shrink-0 mt-0.5`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/25"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 flex items-center justify-center shrink-0">
            <MessageCircle size={20} className="text-[#25D366]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base mb-1">Need help? Contact the Admin</h3>
            <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
              For any requests — point top-ups, unfollow requests, account issues, or anything else — message the admin directly on WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1db954] text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex gap-3 items-start"
      >
        <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80 leading-relaxed">
          <strong className="text-amber-400">Disclaimer:</strong> This platform is not affiliated with, endorsed by, or officially connected to TikTok or its parent company ByteDance. We are an independent third-party platform.
        </p>
      </motion.div>
    </div>
  );
}
