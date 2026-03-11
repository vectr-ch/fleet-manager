import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { DroneSelectionProvider } from "@/hooks/use-drone-selection";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DroneSelectionProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden min-h-0">
            {children}
          </main>
        </div>
      </div>
    </DroneSelectionProvider>
  );
}
