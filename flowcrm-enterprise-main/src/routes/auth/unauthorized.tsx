import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  useEffect(() => {
    document.title = "Unauthorized — FlowCRM";
  }, []);
  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="max-w-md text-center">
        <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your current role doesn't have permission to view this page. Contact a super admin if you
          need access.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
