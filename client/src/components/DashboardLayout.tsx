import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  Map,
  CalendarDays,
  Building2,
  Ticket,
  BarChart3,
  Server,
  LogOut,
  Globe,
  X,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Map, label: "Mapa Interativo", path: "/map" },
  { icon: CalendarDays, label: "Eventos", path: "/events" },
  { icon: Building2, label: "Tenants", path: "/tenants" },
  { icon: Ticket, label: "Ingressos", path: "/tickets" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Server, label: "Infraestrutura", path: "/infrastructure" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
      return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
    } catch {
      return DEFAULT_WIDTH;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
    } catch {}
  }, [sidebarWidth]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0 bg-[#1a1d2e] dark:bg-[#1a1d2e]"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center bg-[#1a1d2e] border-b border-white/10">
            <div className="flex items-center gap-3 px-3 transition-all w-full">
              {/* Logo */}
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Globe className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed ? (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <div className="min-w-0">
                    <span className="font-bold text-white tracking-tight truncate block text-base">
                      EventMap
                    </span>
                    <span className="text-xs text-blue-400 font-medium uppercase tracking-widest">
                      Enterprise
                    </span>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="h-7 w-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors focus:outline-none shrink-0"
                    aria-label="Fechar menu"
                  >
                    <X className="h-4 w-4 text-white/60" />
                  </button>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-[#1a1d2e] pt-2">
            <SidebarMenu className="px-3 py-1 gap-0.5">
              {menuItems.map(item => {
                const isActive = location === item.path || (item.path === "/dashboard" && location === "/");
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`
                        h-10 transition-all font-normal rounded-lg
                        ${isActive
                          ? "bg-blue-600/30 text-white border-l-2 border-blue-500 pl-[calc(0.75rem-2px)] hover:bg-blue-600/40"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                        }
                      `}
                    >
                      <item.icon
                        className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-400" : "text-white/50"}`}
                      />
                      <span className="text-sm">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 bg-[#1a1d2e] border-t border-white/10">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <Avatar className="h-8 w-8 border border-white/20 shrink-0">
                <AvatarFallback className="text-xs font-medium bg-blue-600 text-white">
                  U
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-none text-white">
                    Usuário
                  </p>
                  <p className="text-xs text-white/50 truncate mt-1">
                    Enterprise Plan
                  </p>
                </div>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-2">
                <span className="tracking-tight text-foreground">
                  {activeMenuItem?.label ?? "Menu"}
                </span>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </>
  );
}
