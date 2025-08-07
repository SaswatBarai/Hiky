import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export default function ChatLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full overflow-hidden">
        <div className="w-auto">
          <AppSidebar />
        </div>
        <div className="flex-1 flex overflow-hidden">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
