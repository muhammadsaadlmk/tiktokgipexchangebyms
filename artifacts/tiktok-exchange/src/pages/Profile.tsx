import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetMe, useGetMyFollows, useUpdateMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Shield, Zap, Calendar, Mail, AtSign, ExternalLink,
  TrendingDown, TrendingUp, MinusCircle, Pencil, KeyRound, ImageIcon, LogOut, Eye, EyeOff
} from "lucide-react";
import { format } from "date-fns";

function fmtPoints(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

const usernameSchema = z.object({
  tiktokUsername: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .regex(/^@?[a-zA-Z0-9_.]+$/, "Only letters, numbers, underscores and dots allowed"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const avatarSchema = z.object({
  avatarUrl: z.string().url("Please enter a valid image URL").or(z.literal("")).optional(),
});

function PasswordField({ label, placeholder, registration, error }: {
  label: string; placeholder: string; registration: any; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="bg-black/50 border-white/10 pr-10"
          {...registration}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function Profile() {
  const { data: user } = useGetMe();
  const { data: followsData } = useGetMyFollows();
  const [editModal, setEditModal] = useState<"username" | "password" | "avatar" | null>(null);
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

  const followersCount = followsData?.followers.length ?? 0;
  const followingCount = followsData?.following.length ?? 0;
  const raw = user.tiktokUsername.replace("@", "");
  const display = user.tiktokUsername.startsWith("@") ? user.tiktokUsername : "@" + user.tiktokUsername;
  const tiktokUrl = "https://www.tiktok.com/@" + raw;
  const avatarUrl = (user as any).avatarUrl as string | null | undefined;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">

      <Card className="overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-card/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl">
        <div className="h-28 sm:h-40 bg-gradient-to-r from-primary via-purple-500 to-secondary relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),transparent)]" />
        </div>

        <CardContent className="px-4 sm:px-8 pb-8 relative pt-0">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-end -mt-14 sm:-mt-20 mb-6 relative z-10">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0">
              <div className="w-full h-full rounded-2xl sm:rounded-3xl bg-card border-4 border-card flex items-center justify-center text-4xl sm:text-6xl font-display font-black shadow-2xl bg-gradient-to-br from-background to-white/5 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={raw} className="w-full h-full object-cover" />
                ) : (
                  <span>{raw.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => setEditModal("avatar")}
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-secondary text-black flex items-center justify-center shadow-lg hover:bg-secondary/90 transition-colors"
                title="Edit avatar"
              >
                <ImageIcon size={14} />
              </button>
            </div>

            <div className="flex-1 pb-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-3xl font-display font-black tracking-tight truncate">{display}</h1>
                {user.isAdmin && (
                  <Badge variant="secondary" className="bg-primary text-white border-0 shadow-lg shadow-primary/30 text-xs shrink-0">
                    <Shield size={11} className="mr-1" /> Admin
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-3 truncate">{user.email}</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold border border-white/20 hover:border-primary/50 hover:bg-primary/10 transition-colors"
                >
                  <ExternalLink size={12} /> View TikTok
                </a>
                <Button variant="outline" size="sm" onClick={() => setEditModal("username")} className="border-white/20 hover:border-secondary/50 hover:bg-secondary/10 gap-1.5 rounded-full text-xs h-8">
                  <Pencil size={12} /> Edit Username
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditModal("password")} className="border-white/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 gap-1.5 rounded-full text-xs h-8">
                  <KeyRound size={12} /> Change Password
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 p-3 sm:p-4 rounded-2xl bg-black/20 border border-white/5">
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-black">{followersCount}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold mt-0.5">Followers</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="text-xl sm:text-3xl font-black">{followingCount}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold mt-0.5">Following</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Zap className="text-primary" size={16} />
                <div className="text-xl sm:text-3xl font-black">{fmtPoints(user.points)}</div>
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold mt-0.5">Points</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <InfoBox icon={AtSign} label="TikTok Username" value={display} />
            <InfoBox icon={Mail} label="Email Address" value={user.email} />
            <InfoBox icon={Calendar} label="Member Since" value={format(new Date(user.createdAt), "MMM d, yyyy")} />
            <InfoBox icon={Shield} label="Account Type" value={user.isAdmin ? "Administrator" : "Standard User"} />
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 mb-6">
            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="text-primary" size={18} /> How Points Work
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp size={13} />
                </div>
                <div>
                  <p className="font-bold text-green-400 text-sm mb-0.5">Earn +1 point per follow</p>
                  <p className="text-xs text-muted-foreground">Click "Follow" on any card → watch the ad → follow them on TikTok → instantly earn 1 point.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingDown size={13} />
                </div>
                <div>
                  <p className="font-bold text-red-400 text-sm mb-0.5">Lose -1 point per follower you gain</p>
                  <p className="text-xs text-muted-foreground">When someone follows you on TikTok through this platform, 1 point is deducted from your balance.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <MinusCircle size={13} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm mb-0.5">0 points = paused</p>
                  <p className="text-xs text-muted-foreground">If balance hits 0, your profile is paused until you earn points by following others.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-amber-400 font-bold text-sm mb-1">Disclaimer</p>
              <p className="text-amber-200/80 text-xs leading-relaxed">
                This platform is <strong>not affiliated with, endorsed by, or officially connected to TikTok</strong> or its parent company ByteDance. Use this service at your own discretion. We are an independent third-party platform.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={logoutMut.isPending}
            className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 rounded-xl py-5 font-bold gap-2 transition-all"
          >
            <LogOut size={16} />
            {logoutMut.isPending ? "Logging out…" : "Logout"}
          </Button>
        </CardContent>
      </Card>

      {editModal === "username" && (
        <EditUsernameModal onClose={() => setEditModal(null)} currentUsername={raw} />
      )}
      {editModal === "password" && (
        <EditPasswordModal onClose={() => setEditModal(null)} />
      )}
      {editModal === "avatar" && (
        <EditAvatarModal onClose={() => setEditModal(null)} currentAvatarUrl={avatarUrl ?? ""} />
      )}
    </div>
  );
}

function EditUsernameModal({ onClose, currentUsername }: { onClose: () => void; currentUsername: string }) {
  const queryClient = useQueryClient();
  const updateMut = useUpdateMe({
    mutation: {
      onSuccess: () => {
        toast.success("Username updated!");
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        onClose();
      },
      onError: (err: any) => toast.error(err.message || "Failed to update username"),
    }
  });

  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { tiktokUsername: currentUsername },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} className="w-[92vw] max-w-[420px] bg-card/95 backdrop-blur-xl border-white/10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <Pencil size={18} className="text-secondary" /> Edit TikTok Username
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((d) => updateMut.mutate({ data: { tiktokUsername: d.tiktokUsername } }))} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">New Username</label>
            <Input placeholder="e.g. myusername" className="bg-black/50 border-white/10" {...form.register("tiktokUsername")} />
            {form.formState.errors.tiktokUsername && (
              <p className="text-xs text-destructive">{form.formState.errors.tiktokUsername.message}</p>
            )}
            <p className="text-xs text-muted-foreground">No need to include @</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full text-sm">Cancel</Button>
            <Button type="submit" disabled={updateMut.isPending} className="rounded-full bg-secondary hover:bg-secondary/90 text-black font-bold px-5 text-sm">
              {updateMut.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditPasswordModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const updateMut = useUpdateMe({
    mutation: {
      onSuccess: () => {
        toast.success("Password changed successfully!");
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        onClose();
      },
      onError: (err: any) => toast.error(err.message || "Failed to change password"),
    }
  });

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} className="w-[92vw] max-w-[420px] bg-card/95 backdrop-blur-xl border-white/10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <KeyRound size={18} className="text-yellow-400" /> Change Password
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((d) => updateMut.mutate({ data: { currentPassword: d.currentPassword, newPassword: d.newPassword } }))} className="space-y-3 mt-2">
          {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
            <PasswordField
              key={field}
              label={field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}
              placeholder={field === "currentPassword" ? "Your current password" : field === "newPassword" ? "Min 6 characters" : "Repeat new password"}
              registration={form.register(field)}
              error={form.formState.errors[field]?.message}
            />
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full text-sm">Cancel</Button>
            <Button type="submit" disabled={updateMut.isPending} className="rounded-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 text-sm">
              {updateMut.isPending ? "Saving…" : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditAvatarModal({ onClose, currentAvatarUrl }: { onClose: () => void; currentAvatarUrl: string }) {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(currentAvatarUrl);

  const updateMut = useUpdateMe({
    mutation: {
      onSuccess: () => {
        toast.success("Profile picture updated!");
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        onClose();
      },
      onError: (err: any) => toast.error(err.message || "Failed to update avatar"),
    }
  });

  const form = useForm<z.infer<typeof avatarSchema>>({
    resolver: zodResolver(avatarSchema),
    defaultValues: { avatarUrl: currentAvatarUrl },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} className="w-[92vw] max-w-[420px] bg-card/95 backdrop-blur-xl border-white/10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <ImageIcon size={18} className="text-primary" /> Profile Picture
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((d) => updateMut.mutate({ data: { avatarUrl: d.avatarUrl || null } as any }))} className="space-y-4 mt-2">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl border-2 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" onError={() => setPreview("")} />
              ) : (
                <ImageIcon size={28} className="text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Image URL</label>
            <Input
              placeholder="https://example.com/photo.jpg"
              className="bg-black/50 border-white/10"
              {...form.register("avatarUrl")}
              onChange={(e) => { form.setValue("avatarUrl", e.target.value); setPreview(e.target.value); }}
            />
            {form.formState.errors.avatarUrl && (
              <p className="text-xs text-destructive">{form.formState.errors.avatarUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Paste a direct link to any JPG, PNG or WebP image.</p>
          </div>
          <div className="flex justify-between gap-2 pt-1">
            <Button
              type="button" variant="ghost"
              onClick={() => updateMut.mutate({ data: { avatarUrl: null } as any })}
              disabled={updateMut.isPending || !currentAvatarUrl}
              className="rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm"
            >
              Remove Photo
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-full text-sm">Cancel</Button>
              <Button type="submit" disabled={updateMut.isPending} className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold px-5 text-sm">
                {updateMut.isPending ? "Saving…" : "Save Photo"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InfoBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors">
      <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 text-muted-foreground shadow-inner shrink-0">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="font-bold text-sm sm:text-base truncate">{value}</p>
      </div>
    </div>
  );
}
