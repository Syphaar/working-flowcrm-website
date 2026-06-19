import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "@/services/api";

export default function IndexPage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getToken();
      navigate(token ? "/dashboard" : "/auth/login", { replace: true });
    }
  }, [navigate]);
  return null;
}
