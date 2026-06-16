import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Cog, Sun, Moon, Monitor, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initials } from "@/lib/format";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import * as authService from "@/services/auth.service";

export default function SettingsPage() {
  const { user } = useAuth();
  const { upsert, resetDemo, log } = useData();
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState<any>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    department: user?.department ?? "",
  });
  const [resetOpen, setResetOpen] = useState(false);
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [twoFASetupOpen, setTwoFASetupOpen] = useState(false);
  const [twoFADisableOpen, setTwoFADisableOpen] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [setupOTP, setSetupOTP] = useState("");

  useEffect(() => {
    document.title = "Settings — FlowCRM";
  }, []);

  const saveProfile = () => {
    if (!user) return;
    upsert("users", { ...user, ...form });
    log({
      userId: user.id,
      userName: user.name,
      role: user.role,
      kind: "update",
      entity: "User",
      entityId: user.id,
      description: "Profile updated.",
    });
    toast.success("Profile saved");
  };
  const handleTheme = (theme: "light" | "dark" | "system") => {
    setTheme(theme);
    log({
      userId: user!.id,
      userName: user!.name,
      role: user!.role,
      kind: "theme_change",
      description: `Theme set to ${theme}.`,
    });
  };
  const reset = () => {
    resetDemo();
    toast.success("Demo data restored");
    setResetOpen(false);
  };

  const handleEnableClick = async () => {
    try {
      const result = await authService.setup2FA();
      setTwoFASecret(result.secret);
      setOtp("");
      setTwoFAOpen(false);
      setTwoFASetupOpen(true);
    } catch {
      toast.error("Failed to generate 2FA secret");
    }
  };

  const handleEnableConfirm = async () => {
    if (otp.length !== 6) return;
    try {
      await authService.enable2FA(twoFASecret, otp);
      toast.success("Two-factor authentication enabled");
      setTwoFASetupOpen(false);
      setOtp("");
      setTwoFASecret("");
    } catch {
      toast.error("Invalid code. Try again.");
    }
  };

  const handleDisable = async () => {
    try {
      await authService.disable2FA();
      if (user) upsert("users", { ...user, twoFactor: false });
      toast.success("Two-factor authentication disabled");
      setTwoFADisableOpen(false);
    } catch {
      toast.error("Failed to disable 2FA");
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Profile, appearance, security, and demo data."
        icon={Cog}
      />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Demo Data</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-white text-2xl font-bold">
                  {initials(form.name)}
                </div>
                <div>
                  <div className="font-semibold">{form.name}</div>
                  <div className="text-sm text-muted-foreground">{form.email}</div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ["name", "Name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["department", "Department"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <Input
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    />
                  </div>
                ))}
                <div>
                  <Label>Role</Label>
                  <Input value={user?.role?.replace("_", " ") ?? ""} disabled className="capitalize" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={saveProfile} className="gradient-primary text-white">
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance" className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  ["light", Sun, "Light"],
                  ["dark", Moon, "Dark"],
                  ["system", Monitor, "System"],
                ].map(([value, Icon, label]: any) => (
                  <button
                    key={value}
                    onClick={() => handleTheme(value)}
                    className={`rounded-xl border p-4 text-center hover:bg-muted transition ${theme === value ? "border-primary ring-2 ring-primary/30" : ""}`}
                  >
                    <Icon className="h-6 w-6 mx-auto" />
                    <div className="mt-2 text-sm font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Authenticator app</div>
                    <div className="text-sm text-muted-foreground">
                      Add an extra layer of security at sign-in.
                    </div>
                  </div>
                </div>
                <Switch
                  checked={!!user?.twoFactor}
                  onCheckedChange={(value) => {
                    if (value) {
                      handleEnableClick();
                    } else {
                      setTwoFADisableOpen(true);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="data" className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Demo Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Restore the original mock dataset. Your edits and uploads will be removed.
              </p>
              <Button variant="destructive" onClick={() => setResetOpen(true)}>
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Demo Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        destructive
        title="Reset demo data?"
        description="This will replace all current data with the original mock dataset."
        onConfirm={reset}
      />

      <Dialog open={twoFASetupOpen} onOpenChange={setTwoFASetupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code or enter the secret key into your authenticator app, then enter the 6-digit code below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-sm font-medium mb-2">Secret key</p>
              <p className="text-xs text-muted-foreground mb-2">
                Enter this secret into your authenticator app (e.g. Google Authenticator, Authy).
              </p>
              <div className="bg-background rounded border p-3">
                <code className="text-xs font-mono break-all select-all">{twoFASecret}</code>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              After adding the key to your authenticator app, enter the 6-digit code below to verify.
            </p>
            <div className="flex justify-center py-2">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTwoFASetupOpen(false); setOtp(""); setTwoFASecret(""); }}>
              Cancel
            </Button>
            <Button onClick={handleEnableConfirm} disabled={otp.length !== 6} className="gradient-primary text-white">
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={twoFADisableOpen}
        onOpenChange={setTwoFADisableOpen}
        title="Disable Two-Factor Authentication?"
        description="This will make your account less secure. Anyone with your password can sign in without a second factor."
        onConfirm={handleDisable}
      />
    </div>
  );
}
