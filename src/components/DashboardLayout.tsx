import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <AppSidebar />}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
            {!isMobile && <SidebarTrigger />}
            {title && (
              <motion.h1
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="font-serif text-lg font-semibold text-foreground truncate"
              >
                {title}
              </motion.h1>
            )}
          </header>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6"
          >
            {children}
          </motion.div>
        </main>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
