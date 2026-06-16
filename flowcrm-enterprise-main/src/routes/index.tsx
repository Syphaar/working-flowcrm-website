import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "@/lib/storage";

export default function IndexPage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = storage.get<string | null>("auth:session", null);
      navigate(session ? "/dashboard" : "/auth/login", { replace: true });
    }
  }, [navigate]);
  return null;
}
