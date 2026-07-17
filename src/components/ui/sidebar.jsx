import { useState } from "react";
import { Menu, Table, MessageSquare, Zap, History, LayoutDashboard } from "lucide-react";

export default function Sidebar(props) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed)
    };

    return (
        <div
            className={`h-screen flex flex-col transition-all duration-350 ease-in-out ${isCollapsed ? "w-16" : "w-44 md:w-56"}`}
            style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(243,243,224,0.55) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(19,62,135,0.08)',
            }}
        >
            {/* Toggle button */}
            <div className="flex items-center justify-between p-3.5 border-b border-border/20">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-primary/10 rounded-xl hover:cursor-pointer transition-all duration-200 group"
                    title={isCollapsed ? "Expand" : "Collapse"}
                >
                    <Menu className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                </button>
            </div>

            {/* Nav items */}
            <div className="flex flex-col gap-1 py-3 px-2 stagger-children">
                <SidebarItem
                    icon={<Table size={18} />}
                    isactive={props.active == "table"}
                    label="Table Explorer"
                    collapsed={isCollapsed}
                    onClick={() => props.onSelectPage("table")}
                />
                <SidebarItem
                    isactive={props.active == "query"}
                    icon={<MessageSquare size={18} />}
                    label="Query Console"
                    collapsed={isCollapsed}
                    onClick={() => props.onSelectPage("query")}
                />
                <SidebarItem
                    isactive={props.active == "optimization"}
                    icon={<Zap size={18} />}
                    label="Optimization"
                    collapsed={isCollapsed}
                    onClick={() => props.onSelectPage("optimization")}
                />
                <SidebarItem
                    isactive={props.active == "history"}
                    icon={<History size={18} />}
                    label="Query History"
                    collapsed={isCollapsed}
                    onClick={() => props.onSelectPage("history")}
                />
                <SidebarItem
                    isactive={props.active == "schema"}
                    icon={<LayoutDashboard size={18} />}
                    label="Schema View"
                    collapsed={isCollapsed}
                    onClick={() => props.onSelectPage("schema")}
                />
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, collapsed, isactive, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`animate-scale-in group flex items-center gap-3 cursor-pointer py-2.5 rounded-xl transition-all duration-200 ease-out select-none
                ${isactive
                    ? "text-primary font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }
                ${collapsed ? "justify-center px-0 mx-1" : "px-3 mx-1"}`}
            style={isactive ? {
                background: 'linear-gradient(135deg, rgba(19,62,135,0.1) 0%, rgba(96,139,193,0.08) 100%)',
                borderLeft: '3px solid #133E87',
                paddingLeft: collapsed ? undefined : '10px',
                boxShadow: '0 2px 8px rgba(19,62,135,0.08)',
            } : {
                borderLeft: '3px solid transparent',
            }}
        >
            <span className={`transition-all duration-200 flex-shrink-0 ${isactive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`}>
                {icon}
            </span>
            {!collapsed && (
                <span className="text-sm tracking-wide truncate">{label}</span>
            )}
        </div>
    );
}