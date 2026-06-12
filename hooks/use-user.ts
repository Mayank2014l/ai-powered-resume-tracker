import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useUser() {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Failed to fetch user settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  return {
    user: session?.user ? {
      ...session.user,
      id: (session.user as any).id,
      plan: profile?.plan || (session.user as any).plan || "free",
    } : null,
    plan: profile?.plan || (session?.user as any)?.plan || "free",
    profile,
    loading: status === "loading" || loading,
    isAuthenticated: status === "authenticated",
    refreshProfile: fetchProfile,
    updateSession: update,
  };
}
