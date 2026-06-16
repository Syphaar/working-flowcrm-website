import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Sparkles, MailCheck } from "lucide-react";

export default function ForgotPage() {
  const { forgot } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Reset password — FlowCRM";
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const result = await forgot(email);
    setLoading(false);
    if (!result.ok) return toast.error(result.error ?? "Couldn't send reset email");
    setSent(true);
    toast.success("Reset link sent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">FlowCRM</span>
        </div>
        {sent ? (
          <div className="rounded-2xl border bg-card p-8 text-center shadow-card">
            <div className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-success/15 text-success">
              <MailCheck className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Check your inbox</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link
              to="/auth/login"
              className="mt-6 inline-block text-sm text-primary font-medium hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold">Forgot password?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your email and we'll send you a reset link.
              </p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary text-white"
                disabled={loading}
              >
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
            <p className="text-sm text-center text-muted-foreground">
              Remembered it?{" "}
              <Link to="/auth/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
