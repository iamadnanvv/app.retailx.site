import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useUser } from "@clerk/tanstack-react-start";
import { bootstrap } from "@/lib/api.functions";

export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  owner_user_id: string;
  logo_url: string | null;
  accent: string | null;
  role: string;
};

/**
 * Resolves (and lazily provisions) the signed-in user's workspace on the
 * server. Every platform screen reads its workspace id from here.
 */
export function useWorkspace() {
  const { user, isLoaded } = useUser();
  const boot = useServerFn(bootstrap);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["workspace", user?.id ?? null],
    enabled: isLoaded && Boolean(user?.id),
    staleTime: 60_000,
    queryFn: () =>
      boot({
        data: {
          email: user?.primaryEmailAddress?.emailAddress ?? null,
          name: user?.fullName ?? user?.firstName ?? null,
          imageUrl: user?.imageUrl ?? null,
        },
      }),
  });

  const workspaces = (query.data?.workspaces ?? []) as WorkspaceSummary[];
  const workspace = workspaces[0] ?? null;

  return {
    isLoading: !isLoaded || query.isPending,
    error: query.error as Error | null,
    workspaces,
    workspace,
    workspaceId: workspace?.id ?? null,
    role: workspace?.role ?? null,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ["workspace"] }),
  };
}
