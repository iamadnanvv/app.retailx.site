CREATE TABLE public.workspace_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  assignee_id text,
  due_date date,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.workspace_tasks TO service_role;

ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workspace_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  task_id uuid REFERENCES public.workspace_tasks(id) ON DELETE CASCADE,
  body text NOT NULL,
  author_id text NOT NULL,
  author_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.workspace_comments TO service_role;

ALTER TABLE public.workspace_comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX workspace_tasks_workspace_idx ON public.workspace_tasks(workspace_id, updated_at DESC);
CREATE INDEX workspace_comments_workspace_idx ON public.workspace_comments(workspace_id, created_at DESC);
CREATE INDEX workspace_comments_task_idx ON public.workspace_comments(task_id, created_at ASC);

CREATE TRIGGER workspace_tasks_touch BEFORE UPDATE ON public.workspace_tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

COMMENT ON TABLE public.workspace_tasks IS 'Tasks managed from the workspace-first Omni Hub';
COMMENT ON TABLE public.workspace_comments IS 'Workspace collaboration comments for tasks and projects';