import SuperAdminLayout from "@/components/SuperAdminLayout";
import PlatformAnalytics from "@/components/super-admin/PlatformAnalytics";

const SuperAdminStats = () => {
  return (
    <SuperAdminLayout title="Estatísticas">
      <div className="max-w-6xl mx-auto">
        <PlatformAnalytics />
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminStats;
