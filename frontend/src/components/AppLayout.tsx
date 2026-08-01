import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useERPStore } from "@/lib/store";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Customers", icon: Users, href: "/customers" },
  { title: "Inventory", icon: Package, href: "/inventory" },
  { title: "Sales / Billing", icon: FileText, href: "/sales" },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/customers": "Customer Management",
  "/inventory": "Inventory Management",
  "/sales": "Sales & Billing",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { fetchInventory, fetchCustomers, fetchSales } = useERPStore();

  useEffect(() => {
    fetchInventory();
    fetchCustomers();
    fetchSales();
  }, [fetchInventory, fetchCustomers, fetchSales]);

  const pageTitle = pageTitles[location.pathname] || "Vellore Spun Pipes";

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 lg:relative",
          "bg-[hsl(215,28%,17%)] text-[hsl(214,32%,91%)]",
          sidebarOpen ? "w-64" : "w-[72px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-[hsl(215,25%,27%)] px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            VSP
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white truncate">Vellore Spun Pipes</h1>
              <p className="text-[10px] text-[hsl(214,32%,70%)]">ERP System</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-[hsl(214,32%,75%)] hover:bg-[hsl(215,25%,27%)] hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-[hsl(215,25%,27%)] px-3 py-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(214,32%,75%)] hover:bg-[hsl(215,25%,27%)] hover:text-white transition-colors">
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6 shadow-sm">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden rounded-lg p-2 hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Sidebar toggle (desktop) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex rounded-lg p-2 hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h2 className="text-lg font-semibold text-foreground">{pageTitle}</h2>

          <div className="ml-auto flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-64 pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>

            {/* Notifications */}
            <button className="relative rounded-lg p-2 hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>

            {/* New Sale button */}
            <Link to="/sales">
              <Button size="sm" className="gap-1.5 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Sale</span>
              </Button>
            </Link>

            {/* User */}
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {user?.name?.slice(0, 2).toUpperCase() || "AD"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{user?.role || "Manager"}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
