import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@clerk/tanstack-react-start";
import { toast } from "sonner";
import { createProject } from "@/lib/api.functions";
import { templateBySlug } from "@/lib/templates/library";
import { useWorkspace } from "@/lib/use-workspace";

/**
 * Duplicates a marketplace template into the signed-in user's workspace and
 * opens the visual editor. Signed-out visitors are routed to sign-up first.
 */
export function useTemplateProject() {
  const { isSignedIn, isLoaded } = useAuth();
  const { workspaceId, isLoading } = useWorkspace();
  const create = useServerFn(createProject);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (slug: string) => {
      const template = templateBySlug(slug);
      if (!template) throw new Error("Template not found");
      const res = await create({
        data: { workspaceId: workspaceId!, name: template.name, templateSlug: slug },
      });
      return { id: res.id, name: template.name };
    },
    onSuccess: ({ id, name }) => {
      toast.success(`${name} duplicated into your workspace`);
      void navigate({ to: "/editor/$projectId", params: { projectId: id } });
    },
    onError: (error: Error) => toast.error(error.message || "Could not create the project"),
  });

  const useTemplate = (slug: string) => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      void navigate({ to: "/sign-up/$", params: { _splat: "" } });
      return;
    }
    if (!workspaceId) {
      toast.info("Setting up your workspace — try again in a moment");
      return;
    }
    mutation.mutate(slug);
  };

  return {
    useTemplate,
    pending: mutation.isPending || (isSignedIn === true && isLoading),
  };
}
