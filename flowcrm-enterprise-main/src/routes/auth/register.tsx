import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Min 8 characters"),
});

export default function RegisterPage() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    document.title = "Create account — FlowCRM";
  }, []);

  const onSubmit = async (d: z.infer<typeof schema>) => {
    const res = await signup(d);
    if (!res.ok) return toast.error(res.error ?? "Registration failed");
    toast.success("Account created!");
    navigate("/dashboard");
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
        <div>
          <h2 className="text-2xl font-bold">Create your account</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Start your 30-day free trial. No credit card required.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input {...register("name")} placeholder="Jane Doe" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" {...register("email")} placeholder="you@company.com" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow((previous) => !previous)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full gradient-primary text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
