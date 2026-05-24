import { useCallback } from "react";
import { trpc } from "@/providers/trpc";

export type UnifiedUser = {
  id: number;
  name: string;
  email?: string | null;
  avatar?: string | null;
  role: "student" | "teacher" | "admin";
  authType: "oauth" | "local";
  username?: string | null;
  unionId?: string | null;
};

export function useAuth() {
  const utils = trpc.useUtils();

  // Query OAuth auth
  const { data: oauthUser, isLoading: oauthLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Query local auth
  const { data: localUser, isLoading: localLoading } = trpc.localAuth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.invalidate();
      window.location.reload();
    },
  });

  // Determine which user is active
  const user: UnifiedUser | null = oauthUser
    ? {
        id: oauthUser.id,
        name: oauthUser.name ?? "User",
        email: oauthUser.email,
        avatar: oauthUser.avatar,
        role: oauthUser.role as "student" | "teacher" | "admin",
        authType: "oauth",
        unionId: oauthUser.unionId,
      }
    : localUser
      ? {
          id: localUser.id,
          name: localUser.name ?? "User",
          email: localUser.email,
          avatar: localUser.avatar,
          role: localUser.role as "student" | "teacher" | "admin",
          authType: "local",
          username: localUser.username,
        }
      : null;

  const isLoading = oauthLoading || localLoading;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  const logout = useCallback(() => {
    // Clear local auth cookie
    document.cookie = "local_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Call OAuth logout
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        window.location.reload();
      },
    });
  }, [logoutMutation]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isTeacher,
    isStudent,
    logout,
  };
}
