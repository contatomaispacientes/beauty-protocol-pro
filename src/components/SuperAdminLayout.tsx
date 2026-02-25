import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/SuperAdminSidebar";

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const SuperAdminLayout = ({ children, title }: SuperAdminLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SuperAdminSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-background">
            <SidebarTrigger />
            {title && <h1 className="font-serif text-lg font-semibold text-foreground">{title}</h1>}
          </header>
          <div className="flex-1 p-6 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SuperAdminLayout;
