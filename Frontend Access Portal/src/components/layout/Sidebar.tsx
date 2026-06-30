import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building,
  Lock,
  Shield,
  Eye,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  FileText,
  Settings,
  BookCheck,
  AppWindow,
  Workflow,
  ScrollText,
  UserCheck,
  Bug,
  Monitor,
  CheckSquare,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";

const menuItems = {
  "CORE MANAGEMENT": [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Responsibilities", icon: BookCheck, path: "/responsibilities" },
    { name: "Applications", icon: AppWindow, path: "/applications" },
    { name: "Identities", icon: Users, path: "/identities" },
    { name: "Access Catalog", icon: ShieldCheck, path: "/access-catalog" },
    { name: "Organizations", icon: Building, path: "/organization" },
    { name: "Lifecycle", icon: RefreshCw, path: "/lifecycle" },
  ],
  "SECURITY & ACCESS": [
    { name: "Access Portal", icon: Workflow, path: "/access-portal" },
    { name: "Access Review", icon: UserCheck, path: "/access-review" },
    { name: "Workflows", icon: Workflow, path: "/workflows" },
    { name: "SoD Policies", icon: Shield, path: "/sod-policies" },
  ],
  "MONITORING & ANALYTICS": [
    { name: "Task Center", icon: CheckSquare, path: "/task-center" },
    { name: "Monitoring", icon: Monitor, path: "/monitoring" },
    { name: "Access Analysis", icon: Eye, path: "/access-analysis" },
    { name: "Security Alerts", icon: AlertTriangle, path: "#" },
    { name: "Reports", icon: FileText, path: "/reports" },
    { name: "Debugging", icon: Bug, path: "/debugging" },
    { name: "Audit Logs", icon: ScrollText, path: "/audit-logs" },
  ],
  SYSTEM: [{ name: "Settings", icon: Settings, path: "/" }],
};

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4">
          {Object.entries(menuItems).map(([section, items]) => (
            <div key={section} className="mb-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                {section}
              </h3>
              <ul>
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium transition-colors ${
                        (pathname.startsWith(item.path) && item.path !== "/") ||
                        pathname === item.path
                          ? "bg-primary text-white"
                          : "text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200">
        <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full inline-block mb-2">
          Testing
        </div>
        <p className="text-sm text-slate-600 mb-2">Development</p>
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-slate-700 text-white">
              N
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-slate-800">Role: Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
