import {
  BarChart3,
  TrendingUp,
  Target,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Calculator,
  Tags,
  Rocket,
  Home,
  PieChart,
  Activity,
  Share2,
  Megaphone,
  BarChart2,
  FileText,
  LogOut,
  Store,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleError } from "@/lib/error-handling";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { routes } from "@/utils/routes.jsx";

const routesConfig = routes();

const dashboardItems = routesConfig.dashboardItems;
const financialItems = routesConfig.financialItems;
const operationsItems = routesConfig.operationsItems;
const marketingItems = routesConfig.marketingItems;
const integrationsItems = routesConfig.integrationsItems;

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getNavCls = (path, isActive) => {
    return path === location.pathname
      ? "bg-financial-primary text-white font-bold hover:bg-blue-800 hover:text-white"
      : isActive
        ? "text-black hover:bg-muted/50 hover:text-black"
        : "bg-white text-gray-400 hover:bg-gray hover:text-gray-400";
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      navigate("/auth");
    } catch (error) {
      handleError(error as Error, {
        operation: "logout",
        component: "AppSidebar",
      });
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar collapsible="icon">
      <div className="p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-black">
                Business Analytics
              </h2>
              <p className="text-xs text-black">Enterprise Dashboard</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-black">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      end
                      className={getNavCls(item.path, item.isActive)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span className="">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-black">
            Financial
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financialItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={getNavCls(item.path, item.isActive)}
                    >
                      <item.icon className="mr-2 h-4 w-4 " />
                      {!collapsed && <span className="">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-black">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={getNavCls(item.path, item.isActive)}
                    >
                      <item.icon className="mr-2 h-4 w-4 " />
                      {!collapsed && <span className="">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-black">
            Marketing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {marketingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={getNavCls(item.path, item.isActive)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span className="">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-black">
            Integrations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {integrationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={getNavCls(item.path, item.isActive)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span className="">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
