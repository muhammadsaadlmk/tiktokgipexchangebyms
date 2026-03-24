import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Edit2, Trash2, Search, Shield, Zap, Users, UserPlus, TrendingUp, Settings, Link2, Plus, X, ToggleLeft, ToggleRight, MousePointerClick, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListUsers,
  useAdminUpdateUser,
  useAdminDeleteUser,
  useAdminCreateUser,
  useAdminGetSettings,
  useAdminUpdateSettings,
  useAdminListFollows,
  useAdminCreateFollow,
  useAdminDeleteFollow,
  getAdminListUsersQueryKey,
  getAdminGetSettingsQueryKey,
  getAdminListFollowsQueryKey,
  getListUsersQueryKey,
  type AdminUserItem,
  type AdLink,
} from "@workspace/api-client-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Tab = "users" | "follows" | "settings";

const editSchema = z.object({
  email: z.string().email(),
  tiktokUsername: z.string().min(2),
  name: z.string().optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  points: z.coerce.number().int().min(0).max(999999999),
  isAdmin: z.boolean(),
  password: z.string().optional().or(z.literal("")),
});

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tiktokUsername: z.string().min(2),
  name: z.string().optional().or(z.literal("")),
  points: z.coerce.number().int(),
  isAdmin: z.boolean(),
});

export function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const { data: users, isLoading } = useAdminListUsers();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const queryClient = useQueryClient();

  const invalidateUserLists = () => {
    queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
  };

  const createMut = useAdminCreateUser({
    mutation: {
      onSuccess: () => {
        toast.success("User created successfully");
        setIsCreatingUser(false);
        invalidateUserLists();
      },
      onError: (err: any) => toast.error(err.message || "Failed to create user"),
    }
  });

  const updateMut = useAdminUpdateUser({
    mutation: {
      onSuccess: () => {
        toast.success("User updated successfully");
        setEditingUser(null);
        invalidateUserLists();
      },
      onError: (err: any) => toast.error(err.message || "Failed to update user"),
    }
  });

  const deleteMut = useAdminDeleteUser({
    mutation: {
      onSuccess: () => {
        toast.success("User deleted permanently");
        invalidateUserLists();
      },
      onError: (err: any) => toast.error(err.message || "Failed to delete user"),
    }
  });

  const handleDelete = (id: number, username: string) => {
    if (confirm("Permanently delete @" + username + "? This cannot be undone.")) {
      deleteMut.mutate({ userId: id });
    }
  };

  const filteredUsers = users
    ?.filter(u =>
      u.tiktokUsername.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      ((u as any).name && (u as any).name.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => b.id - a.id) || [];

  const totalUsers = users?.length ?? 0;
  const totalFollows = users?.reduce((s, u) => s + (u.followersCount ?? 0), 0) ?? 0;
  const totalPoints = users?.reduce((s, u) => s + (u.points ?? 0), 0) ?? 0;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "users", label: "Users", icon: Users },
    { id: "follows", label: "Follows", icon: Link2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight flex items-center gap-3">
            <Shield className="text-primary w-7 h-7" /> Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Full control over users, follows and platform settings</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6">
        <StatCard title="Users" value={totalUsers} icon={Users} color="text-blue-400" />
        <StatCard title="Follows" value={totalFollows} icon={TrendingUp} color="text-green-400" />
        <StatCard title="Total Points" value={totalPoints} icon={Zap} color="text-primary" />
      </div>

      <div className="flex gap-1 mb-5 bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-fit overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none justify-center sm:justify-start " + (
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "users" && (
        <div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input placeholder="Search users..." className="pl-9 h-10 rounded-full bg-white/5 border-white/10 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button onClick={() => setIsCreatingUser(true)} className="rounded-full bg-white text-black hover:bg-white/90 font-bold text-sm h-10">
              <UserPlus className="w-4 h-4 mr-2" /> Add User
            </Button>
          </div>

          <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h2 className="font-bold text-sm sm:text-base">Users ({filteredUsers.length})</h2>
              <span className="text-xs text-muted-foreground">{totalUsers} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[540px]">
                <thead className="text-[10px] sm:text-xs uppercase bg-black/20 text-muted-foreground border-b border-white/10">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 font-bold">User</th>
                    <th className="px-4 sm:px-6 py-3 font-bold">Points</th>
                    <th className="px-4 sm:px-6 py-3 font-bold hidden sm:table-cell">Network</th>
                    <th className="px-4 sm:px-6 py-3 font-bold hidden md:table-cell">Joined</th>
                    <th className="px-4 sm:px-6 py-3 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                      Loading users…
                    </td></tr>
                  )}
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group border-l-2 border-l-transparent hover:border-l-primary">
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-bold text-base border border-white/10 overflow-hidden shrink-0">
                            {(user as any).avatarUrl ? (
                              <img src={(user as any).avatarUrl} alt={user.tiktokUsername} className="w-full h-full object-cover" />
                            ) : (
                              user.tiktokUsername.replace("@", "").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                              <span className="truncate text-sm">{user.tiktokUsername.startsWith("@") ? user.tiktokUsername : "@" + user.tiktokUsername}</span>
                              {user.isAdmin && <Badge variant="secondary" className="px-1 py-0 text-[9px] bg-secondary/20 text-secondary border-0">Admin</Badge>}
                            </div>
                            {(user as any).name && <div className="text-xs text-white/70 truncate max-w-[160px] font-medium">{(user as any).name}</div>}
                            <div className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <PointsBadge points={user.points} />
                      </td>
                      <td className="px-4 sm:px-6 py-3 hidden sm:table-cell">
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div>Followers: <span className="text-white font-bold">{user.followersCount}</span></div>
                          <div>Following: <span className="text-white font-bold">{user.followingCount}</span></div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-muted-foreground whitespace-nowrap text-xs hidden md:table-cell">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/5 text-white hover:bg-white/20 rounded-lg" onClick={() => setEditingUser(user)}>
                            <Edit2 size={13} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-lg" onClick={() => handleDelete(user.id, user.tiktokUsername)}>
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && filteredUsers.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "follows" && <FollowsPanel users={users ?? []} />}
      {activeTab === "settings" && <SettingsPanel />}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={(data) => {
            const payload = { ...data } as any;
            if (!payload.password) delete payload.password;
            if (payload.avatarUrl === "" || payload.avatarUrl == null) payload.avatarUrl = null;
            if (!payload.name || payload.name.trim() === "") payload.name = null;
            else payload.name = payload.name.trim();
            updateMut.mutate({ userId: editingUser.id, data: payload });
          }}
          isPending={updateMut.isPending}
        />
      )}

      {isCreatingUser && (
        <CreateUserModal
          onClose={() => setIsCreatingUser(false)}
          onSubmit={(data) => {
            const payload = { ...data } as any;
            if (!payload.name || payload.name.trim() === "") payload.name = null;
            else payload.name = payload.name.trim();
            createMut.mutate({ data: payload });
          }}
          isPending={createMut.isPending}
        />
      )}
    </div>
  );
}

function SettingsPanel() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading: settingsLoading } = useAdminGetSettings();
  const [links, setLinks] = useState<AdLink[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");

  useEffect(() => {
    if (settings && !initialized) {
      const loaded = (settings as any)?.adLinks as AdLink[] | undefined;
      setLinks(loaded ?? []);
      setInitialized(true);
    }
  }, [settings, initialized]);

  const updateMut = useAdminUpdateSettings({
    mutation: {
      onSuccess: (data) => {
        const updated = (data as any)?.adLinks as AdLink[] | undefined;
        setLinks(updated ?? []);
        setSaving(false);
        queryClient.invalidateQueries({ queryKey: getAdminGetSettingsQueryKey() });
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to save");
        setSaving(false);
      },
    }
  });

  const save = (newLinks: AdLink[]) => {
    setSaving(true);
    updateMut.mutate({ data: { adLinks: newLinks } as any });
  };

  const addLink = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) { toast.error("Enter a URL first"); return; }
    if (!trimmed.startsWith("http")) { toast.error("URL must start with http"); return; }
    const newLink: AdLink = {
      id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
      url: trimmed,
      label: newLabel.trim() || `Ad Link ${links.length + 1}`,
      isActive: true,
      clicks: 0,
    };
    const updated = [...links, newLink];
    setLinks(updated);
    setNewUrl("");
    setNewLabel("");
    toast.success("Ad link added — saving…");
    save(updated);
  };

  const removeLink = (id: string) => {
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    save(updated);
  };

  const toggleLink = (id: string) => {
    const updated = links.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l);
    setLinks(updated);
    save(updated);
  };

  const startEdit = (link: AdLink) => {
    setEditingId(link.id);
    setEditLabel(link.label || "");
    setEditUrl(link.url);
  };

  const saveEdit = (id: string) => {
    const trimmedUrl = editUrl.trim();
    if (!trimmedUrl || !trimmedUrl.startsWith("http")) {
      toast.error("URL must start with http");
      return;
    }
    const updated = links.map(l =>
      l.id === id ? { ...l, label: editLabel.trim() || l.label, url: trimmedUrl } : l
    );
    setEditingId(null);
    setLinks(updated);
    save(updated);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
    setEditUrl("");
  };

  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0);
  const activeCount = links.filter(l => l.isActive).length;

  return (
    <div className="max-w-2xl space-y-5">

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card/50 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-black">{links.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Total Links</div>
        </div>
        <div className="bg-card/50 border border-green-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-green-400">{activeCount}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Active</div>
        </div>
        <div className="bg-card/50 border border-secondary/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-secondary">{totalClicks}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Total Clicks</div>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <h2 className="text-base font-bold mb-1 flex items-center gap-2">
          <Plus size={16} className="text-green-400" /> Add New Ad Link
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          When a user clicks "Follow", one active link is chosen at random. Clicks are counted per link so you can see distribution.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Label (e.g. Ad Campaign 1)"
              className="bg-black/50 border-white/10 text-sm flex-1"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="https://your-ad-link.com/..."
              className="bg-black/50 border-white/10 text-sm flex-1"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLink()}
            />
            <Button
              onClick={addLink}
              disabled={saving || !newUrl.trim()}
              className="rounded-lg bg-green-500 hover:bg-green-400 text-black font-bold px-4 text-sm shrink-0 h-10"
            >
              <Plus size={15} className="mr-1" /> Add
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Link2 size={15} className="text-primary" /> Ad Links ({links.length})
          </h2>
          {saving && <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>}
        </div>

        {settingsLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : links.length === 0 ? (
          <div className="p-10 text-center">
            <Link2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">No ad links yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {links.map((link, idx) => {
              const pct = totalClicks > 0 ? Math.round((link.clicks / totalClicks) * 100) : 0;
              return (
                <div key={link.id} className={"p-3 sm:p-4 hover:bg-white/5 transition-colors " + (!link.isActive && editingId !== link.id ? "opacity-50" : "")}>
                  {editingId === link.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Edit2 size={12} className="text-primary" />
                        <span className="text-xs text-primary font-bold uppercase tracking-wider">Editing Link</span>
                      </div>
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="Label (e.g. Ad Campaign 1)"
                        className="bg-black/50 border-white/20 text-sm h-8"
                      />
                      <Input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="https://..."
                        className="bg-black/50 border-white/20 text-sm h-8"
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(link.id); if (e.key === "Escape") cancelEdit(); }}
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => saveEdit(link.id)}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-bold transition-colors"
                        >
                          <Check size={13} /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 text-xs font-bold transition-colors"
                        >
                          <X size={13} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-sm">{link.label || `Link ${idx + 1}`}</span>
                          <Badge variant="outline" className={"text-[10px] px-1.5 py-0.5 border " + (link.isActive ? "border-green-500/30 text-green-400 bg-green-500/5" : "border-white/10 text-muted-foreground")}>
                            {link.isActive ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">{link.url}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MousePointerClick size={11} />
                            <span className="font-bold text-white">{link.clicks}</span> clicks
                            {totalClicks > 0 && <span className="text-muted-foreground">({pct}%)</span>}
                          </div>
                          {totalClicks > 0 && (
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[120px]">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: pct + "%" }} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(link)}
                          disabled={saving}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Edit label and URL"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => toggleLink(link.id)}
                          disabled={saving}
                          className={"p-1.5 rounded-lg transition-colors " + (link.isActive ? "text-green-400 hover:bg-green-500/10" : "text-muted-foreground hover:bg-white/10")}
                          title={link.isActive ? "Pause this link" : "Activate this link"}
                        >
                          {link.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                        <button
                          onClick={() => removeLink(link.id)}
                          disabled={saving}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete this link"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300">
        <strong>How randomization works:</strong> Each time a user clicks "Follow", one active link is picked at random. All active links get roughly equal exposure. Pausing a link removes it from the rotation without deleting it.
      </div>
    </div>
  );
}

function FollowsPanel({ users }: { users: AdminUserItem[] }) {
  const queryClient = useQueryClient();
  const { data: follows, isLoading } = useAdminListFollows();
  const [newFollowerId, setNewFollowerId] = useState("");
  const [newFollowingId, setNewFollowingId] = useState("");
  const [searchFollow, setSearchFollow] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getAdminListFollowsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
  };

  const createMut = useAdminCreateFollow({
    mutation: {
      onSuccess: () => { toast.success("Follow created"); setNewFollowerId(""); setNewFollowingId(""); invalidate(); },
      onError: (err: any) => toast.error(err.message || "Failed to create follow"),
    }
  });

  const deleteMut = useAdminDeleteFollow({
    mutation: {
      onSuccess: () => { toast.success("Follow removed"); invalidate(); },
      onError: (err: any) => toast.error(err.message || "Failed to remove follow"),
    }
  });

  const filteredFollows = ((follows as any[]) || []).filter((f: any) =>
    (f.followerUsername || "").toLowerCase().includes(searchFollow.toLowerCase()) ||
    (f.followingUsername || "").toLowerCase().includes(searchFollow.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <Plus size={16} className="text-green-400" /> Add Follow Relationship
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Follower</label>
            <select value={newFollowerId} onChange={(e) => setNewFollowerId(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="">Select follower…</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.tiktokUsername.startsWith("@") ? u.tiktokUsername : "@" + u.tiktokUsername}</option>)}
            </select>
          </div>
          <span className="text-muted-foreground text-xs font-bold pb-2 hidden sm:block">follows →</span>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Following</label>
            <select value={newFollowingId} onChange={(e) => setNewFollowingId(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="">Select who they follow…</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.tiktokUsername.startsWith("@") ? u.tiktokUsername : "@" + u.tiktokUsername}</option>)}
            </select>
          </div>
          <Button
            onClick={() => {
              const fId = parseInt(newFollowerId), ingId = parseInt(newFollowingId);
              if (!fId || !ingId) { toast.error("Select both users"); return; }
              createMut.mutate({ data: { followerId: fId, followingId: ingId } });
            }}
            disabled={createMut.isPending || !newFollowerId || !newFollowingId}
            className="rounded-lg bg-green-500 hover:bg-green-400 text-black font-bold px-5 h-10 text-sm shrink-0"
          >
            <Plus size={15} className="mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5 flex justify-between items-center gap-3">
          <h2 className="font-bold text-sm">All Follows ({filteredFollows.length})</h2>
          <div className="relative w-36 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
            <Input placeholder="Search…" className="pl-7 h-7 text-xs rounded-full bg-white/5 border-white/10" value={searchFollow} onChange={(e) => setSearchFollow(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[420px]">
            <thead className="text-[10px] sm:text-xs uppercase bg-black/20 text-muted-foreground border-b border-white/10">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-bold">#</th>
                <th className="px-4 sm:px-6 py-3 font-bold">Follower</th>
                <th className="px-4 sm:px-6 py-3 font-bold">Following</th>
                <th className="px-4 sm:px-6 py-3 font-bold hidden sm:table-cell">When</th>
                <th className="px-4 sm:px-6 py-3 text-right font-bold">Del</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">Loading…</td></tr>}
              {filteredFollows.map((f: any) => (
                <tr key={f.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-4 sm:px-6 py-3 text-muted-foreground text-xs">#{f.id}</td>
                  <td className="px-4 sm:px-6 py-3 font-bold text-primary text-sm">{f.followerUsername?.startsWith("@") ? f.followerUsername : "@" + f.followerUsername}</td>
                  <td className="px-4 sm:px-6 py-3 font-bold text-secondary text-sm">{f.followingUsername?.startsWith("@") ? f.followingUsername : "@" + f.followingUsername}</td>
                  <td className="px-4 sm:px-6 py-3 text-muted-foreground text-xs whitespace-nowrap hidden sm:table-cell">
                    {formatDistanceToNow(new Date(f.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-40 group-hover:opacity-100 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-lg"
                      onClick={() => deleteMut.mutate({ followId: f.id })} disabled={deleteMut.isPending}>
                      <X size={13} />
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredFollows.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No follow relationships yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function fmtPoints(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-card/50 backdrop-blur border border-white/10 rounded-2xl p-3 sm:p-6 flex items-center gap-3 sm:gap-4 shadow-lg hover:border-white/20 transition-colors">
      <div className={"w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0 " + color}>
        <Icon size={18} className="sm:w-6 sm:h-6" />
      </div>
      <div>
        <p className="text-muted-foreground text-xs font-medium">{title}</p>
        <p className="text-2xl sm:text-3xl font-display font-black">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function PointsBadge({ points }: { points: number }) {
  const color = points > 20 ? "text-green-500 bg-green-500/10 border-green-500/20"
    : points >= 5 ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
    : "text-red-500 bg-red-500/10 border-red-500/20";
  return (
    <div className={"inline-flex items-center gap-1 px-2 py-1 rounded-full border font-bold text-xs sm:text-sm " + color}>
      <Zap size={12} /> {fmtPoints(points)}
    </div>
  );
}

function EditUserModal({ user, onClose, onSubmit, isPending }: {
  user: AdminUserItem; onClose: () => void; onSubmit: (data: any) => void; isPending: boolean;
}) {
  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: { email: user.email, tiktokUsername: user.tiktokUsername, name: (user as any).name ?? "", avatarUrl: user.avatarUrl ?? "", points: user.points, isAdmin: user.isAdmin, password: "" },
  });
  const avatarPreview = form.watch("avatarUrl");

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} className="w-[92vw] max-w-[420px] bg-card/95 backdrop-blur-xl border-white/10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Edit @{user.tiktokUsername}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Profile Picture URL</label>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center text-lg font-bold">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  user.tiktokUsername.replace("@", "").charAt(0).toUpperCase()
                )}
              </div>
              <Input placeholder="https://i.imgur.com/..." className="bg-black/50 border-white/10 text-sm flex-1" {...form.register("avatarUrl")} />
            </div>
            <p className="text-xs text-muted-foreground">Paste any public image URL. Clears the avatar if left blank.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Full Name</label>
            <Input placeholder="e.g. Ahmed Khan" className="bg-black/50 border-white/10 text-sm" {...form.register("name")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">TikTok Username</label>
            <Input className="bg-black/50 border-white/10 text-sm" {...form.register("tiktokUsername")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Email</label>
            <Input className="bg-black/50 border-white/10 text-sm" {...form.register("email")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Points Balance</label>
            <Input type="number" min={0} max={999999999} className="bg-black/50 border-white/10 text-sm" {...form.register("points")} />
            <p className="text-xs text-muted-foreground">Max: 999,999,999 — updated immediately across the platform.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Reset Password (optional)</label>
            <Input type="password" placeholder="Leave blank to keep current" className="bg-black/50 border-white/10 text-sm" {...form.register("password")} />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
            <input type="checkbox" id="isAdminEdit" className="w-4 h-4 rounded text-primary cursor-pointer" {...form.register("isAdmin")} />
            <label htmlFor="isAdminEdit" className="text-sm font-medium cursor-pointer">Administrator Privileges</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full text-sm">Cancel</Button>
            <Button type="submit" disabled={isPending} className="rounded-full bg-primary hover:bg-primary/90 font-bold px-5 text-white text-sm">
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateUserModal({ onClose, onSubmit, isPending }: {
  onClose: () => void; onSubmit: (data: any) => void; isPending: boolean;
}) {
  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { email: "", password: "", tiktokUsername: "", name: "", points: 10, isAdmin: false },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} className="w-[92vw] max-w-[420px] bg-card/95 backdrop-blur-xl border-white/10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Add New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Full Name</label>
            <Input placeholder="e.g. Ahmed Khan" className="bg-black/50 border-white/10 text-sm" {...form.register("name")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">TikTok Username</label>
            <Input placeholder="username" className="bg-black/50 border-white/10 text-sm" {...form.register("tiktokUsername")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Email</label>
            <Input type="email" placeholder="user@example.com" className="bg-black/50 border-white/10 text-sm" {...form.register("email")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Password</label>
            <Input type="password" placeholder="Min 6 characters" className="bg-black/50 border-white/10 text-sm" {...form.register("password")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Starting Points</label>
            <Input type="number" className="bg-black/50 border-white/10 text-sm" {...form.register("points")} />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
            <input type="checkbox" id="isAdminNew" className="w-4 h-4 rounded text-primary cursor-pointer" {...form.register("isAdmin")} />
            <label htmlFor="isAdminNew" className="text-sm font-medium cursor-pointer">Administrator Privileges</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full text-sm">Cancel</Button>
            <Button type="submit" disabled={isPending} className="rounded-full bg-primary hover:bg-primary/90 font-bold px-5 text-white text-sm">
              {isPending ? "Creating…" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
