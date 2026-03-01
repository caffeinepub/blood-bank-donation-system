import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetPendingEmergencyRequests,
} from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  Droplet,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: ReactNode;
  currentPage?: string;
}

export default function AdminLayout({
  children,
  currentPage,
}: AdminLayoutProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: pendingRequests } = useGetPendingEmergencyRequests();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingCount = pendingRequests?.length || 0;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", id: "home" },
    { icon: Users, label: "Manage Donors", href: "#", id: "donors" },
    { icon: Droplet, label: "Blood Inventory", href: "#", id: "inventory" },
    {
      icon: AlertCircle,
      label: "Emergency Requests",
      href: "#",
      id: "requests",
      badge: pendingCount,
    },
    { icon: Calendar, label: "Appointments", href: "#", id: "appointments" },
    { icon: FileText, label: "Reports", href: "#", id: "reports" },
  ];

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={mobile ? "space-y-1" : "space-y-1"}>
      {navItems.map((item) => {
        const isActive = currentPage === item.id;
        const Icon = item.icon;

        if (item.href === "/admin") {
          return (
            <Link
              key={item.id}
              to={item.href}
              onClick={() => mobile && setMobileMenuOpen(false)}
            >
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        }
        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "ghost"}
            className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`}
            onClick={() => {
              if (mobile) setMobileMenuOpen(false);
              toast.info("Coming soon!");
            }}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
            {item.badge && item.badge > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex items-center gap-2 mb-6">
                  <Heart className="h-6 w-6 text-primary fill-primary" />
                  <span className="font-display font-bold text-lg">
                    BloodBank Admin
                  </span>
                </div>
                <NavContent mobile />
              </SheetContent>
            </Sheet>

            <Link to="/admin" className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary fill-primary" />
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  BloodBank
                </h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">
                {userProfile?.name}
              </p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <Card className="p-4">
                <NavContent />
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
