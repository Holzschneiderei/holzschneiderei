import AdminMode from "./components/AdminMode";
import ConfigSkeleton from "./components/ui/ConfigSkeleton";
import WorkflowMode from "./components/WorkflowMode";
import useAdminState from "./hooks/useAdminState";
import useWizardState from "./hooks/useWizardState";
import type { AppConfig } from "./types/config";

/* -- Cached CMS config (read once at module load to avoid flicker) -- */
const CACHED_CONFIG: Partial<AppConfig> | null = (() => {
  try {
    const raw = localStorage.getItem("hz:cms-config");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.version) return parsed;
    return null;
  } catch { return null; }
})();

export default function GarderobeWizard() {
  const ws = useWizardState(CACHED_CONFIG);
  const admin = useAdminState(ws);

  if (!ws.configLoaded) return <ConfigSkeleton />;
  if (ws.isAdmin) return <AdminMode ws={ws} admin={admin} />;
  return <WorkflowMode ws={ws} />;
}
