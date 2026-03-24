import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLogin, useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  tiktokUsername: z.string().min(2, "Username is required").regex(/^@?[a-zA-Z0-9_.]+$/, "Invalid TikTok username format"),
});

function PasswordInput({ placeholder, registration, error }: {
  placeholder: string;
  registration: any;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pr-10"
          {...registration}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const queryClient = useQueryClient();

  const loginMut = useLogin({
    mutation: {
      onSuccess: () => {
        toast.success("Welcome back!");
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err: any) => toast.error(err.message || "Failed to login"),
    }
  });

  const registerMut = useRegister({
    mutation: {
      onSuccess: () => {
        toast.success("Account created! You received 10 bonus points.");
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err: any) => toast.error(err.message || "Registration failed"),
    }
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", name: "", tiktokUsername: "" },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => loginMut.mutate({ data });
  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => registerMut.mutate({ data: data as any });

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center p-4 py-8 relative overflow-y-auto">
      <div className="fixed inset-0 z-0">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Hero background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden mb-6 shadow-2xl shadow-primary/20">
            <img src={`${import.meta.env.BASE_URL}tiktok-logo.png`} alt="TikTok" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display text-4xl font-black mb-2 tracking-tight">
            Follow<span className="text-primary">Exchange</span>
          </h1>
          <p className="text-muted-foreground text-lg">Grow your audience together.</p>
        </div>

        <div className="glass-panel border border-white/10 overflow-hidden rounded-2xl">
          <div className="flex w-full border-b border-white/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-sm font-bold transition-all ${isLogin ? "text-white bg-white/5 border-b-2 border-primary" : "text-muted-foreground hover:text-white"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-sm font-bold transition-all ${!isLogin ? "text-white bg-white/5 border-b-2 border-secondary" : "text-muted-foreground hover:text-white"}`}
            >
              Create Account
            </button>
          </div>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                {isLogin ? (
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Input placeholder="Email address" {...loginForm.register("email")} />
                      {loginForm.formState.errors.email && <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>}
                    </div>
                    <PasswordInput
                      placeholder="Password"
                      registration={loginForm.register("password")}
                      error={loginForm.formState.errors.password?.message}
                    />
                    <Button type="submit" variant="tiktok" className="w-full mt-4" disabled={loginMut.isPending}>
                      {loginMut.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Input placeholder="Your full name (e.g. Ahmed Khan)" {...registerForm.register("name")} />
                      {registerForm.formState.errors.name && <p className="text-xs text-destructive">{registerForm.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Input placeholder="TikTok Username (e.g. @viralcreator)" {...registerForm.register("tiktokUsername")} />
                      {registerForm.formState.errors.tiktokUsername && <p className="text-xs text-destructive">{registerForm.formState.errors.tiktokUsername.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Input placeholder="Email address" {...registerForm.register("email")} />
                      {registerForm.formState.errors.email && <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>}
                    </div>
                    <PasswordInput
                      placeholder="Password (min 6 chars)"
                      registration={registerForm.register("password")}
                      error={registerForm.formState.errors.password?.message}
                    />
                    <Button type="submit" variant="tiktok" className="w-full mt-4" disabled={registerMut.isPending}>
                      {registerMut.isPending ? "Creating account..." : "Join & Get 10 Points"}
                    </Button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
