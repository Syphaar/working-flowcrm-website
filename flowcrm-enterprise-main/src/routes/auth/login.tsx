import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Sparkles, ShieldCheck, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password is required"),
});

export default function LoginPage() {
  const { login, verify2FALogin } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [twoFASubmitting, setTwoFASubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    document.title = "Sign in — FlowCRM";
  }, []);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setSubmitting(true);
    const res = await login(data.email, data.password, remember);
    setSubmitting(false);
    if (res.requiresTwoFactor && res.twoFactorToken) {
      setTwoFAToken(res.twoFactorToken);
      return;
    }
    if (!res.ok) {
      toast.error(res.error ?? "Login failed");
      return;
    }
    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  const handle2FAVerify = async () => {
    if (!twoFAToken || otp.length !== 6) return;
    setTwoFASubmitting(true);
    const res = await verify2FALogin(twoFAToken, otp);
    setTwoFASubmitting(false);
    if (!res.ok) {
      toast.error(res.error ?? "Invalid code");
      return;
    }
    toast.success("Welcome back!");
    setTwoFAToken(null);
    setOtp("");
    navigate("/dashboard");
  };

  const fill = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 text-white gradient-primary overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-lg">FlowCRM</div>
            <div className="text-xs uppercase tracking-widest opacity-80">Enterprise</div>
          </div>
        </div>
        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              The CRM your team will actually use.
            </h1>
            <p className="mt-4 text-white/80 max-w-md">
              Manage leads, deals, and customer relationships in one premium workspace built for
              modern revenue teams.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { icon: TrendingUp, label: "Pipeline visibility" },
              { icon: ShieldCheck, label: "Role-based access" },
              { icon: Zap, label: "Real-time insights" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-white/10 backdrop-blur p-3">
                <f.icon className="h-5 w-5" />
                <div className="mt-2 text-xs font-medium">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-white/70">© 2026 FlowCRM Inc.</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="font-bold text-lg">FlowCRM</div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your FlowCRM workspace.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShow((previous) => !previous)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(!!checked)}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me for 30 days
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary text-white shadow-elevated"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <div className="rounded-xl border bg-muted/40 p-4 text-xs space-y-2">
            <div className="font-semibold text-foreground">Demo accounts</div>
            <button
              type="button"
              onClick={() => fill("superadmin@flowcrm.com", "SuperAdmin123")}
              className="block w-full text-left rounded-lg border bg-card p-2 hover:bg-muted"
            >
              <div className="font-medium">Super Admin</div>
              <div className="text-muted-foreground">superadmin@flowcrm.com · SuperAdmin123</div>
            </button>
            <button
              type="button"
              onClick={() => fill("sales@flowcrm.com", "TeamMember123")}
              className="block w-full text-left rounded-lg border bg-card p-2 hover:bg-muted"
            >
              <div className="font-medium">Sales Executive</div>
              <div className="text-muted-foreground">sales@flowcrm.com · TeamMember123</div>
            </button>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            New to FlowCRM?{" "}
            <Link to="/auth/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={!!twoFAToken} onOpenChange={(open) => { if (!open) setTwoFAToken(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTwoFAToken(null); setOtp(""); }}>
              Cancel
            </Button>
            <Button onClick={handle2FAVerify} disabled={otp.length !== 6 || twoFASubmitting} className="gradient-primary text-white">
              {twoFASubmitting ? "Verifying…" : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
