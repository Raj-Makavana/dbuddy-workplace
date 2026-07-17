"use client";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon, Monitor, Check } from "lucide-react";

const options = [
    {
        value: "light",
        label: "Light",
        icon: Sun,
        description: "Classic light interface",
    },
    {
        value: "dark",
        label: "Dark",
        icon: Moon,
        description: "Easy on the eyes",
    },
    {
        value: "system",
        label: "System",
        icon: Monitor,
        description: "Follow device theme",
    },
];

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const current = options.find((o) => o.value === theme) || options[2];
    const Icon = current.icon;

    return (
        <div ref={ref} className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer
                    ${open
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border/60 bg-card/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                title="Change Theme"
                aria-label="Theme toggle"
            >
                <Icon className="w-4 h-4 transition-all duration-300" />
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div
                    className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
                    style={{
                        background: "var(--card)",
                        border: "1px solid rgba(19,62,135,0.12)",
                        boxShadow: "0 20px 60px rgba(19,62,135,0.15), 0 4px 16px rgba(0,0,0,0.08)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="px-4 py-3 border-b"
                        style={{
                            background: "linear-gradient(135deg, rgba(19,62,135,0.06) 0%, rgba(96,139,193,0.04) 100%)",
                            borderBottom: "1px solid rgba(19,62,135,0.08)",
                        }}
                    >
                        <p className="text-xs font-bold uppercase tracking-widest text-primary/70">
                            Appearance
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Choose your preferred theme
                        </p>
                    </div>

                    {/* Options */}
                    <div className="p-2 stagger-children">
                        {options.map((opt) => {
                            const OIcon = opt.icon;
                            const isSelected = theme === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        setTheme(opt.value);
                                        setOpen(false);
                                    }}
                                    className={`animate-slide-in-right w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer group
                                        ${isSelected
                                            ? "text-primary font-semibold"
                                            : "text-foreground/80 hover:text-foreground"
                                        }`}
                                    style={isSelected ? {
                                        background: "linear-gradient(135deg, rgba(19,62,135,0.1) 0%, rgba(96,139,193,0.08) 100%)",
                                    } : {
                                        background: "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.background = "rgba(19,62,135,0.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    {/* Icon bubble */}
                                    <div
                                        className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center"
                                        style={isSelected ? {
                                            background: "linear-gradient(135deg, #133E87 0%, #608BC1 100%)",
                                        } : {
                                            background: "rgba(19,62,135,0.08)",
                                        }}
                                    >
                                        <OIcon
                                            className="w-4 h-4"
                                            style={{ color: isSelected ? "white" : "var(--primary)" }}
                                        />
                                    </div>

                                    {/* Label */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-none">{opt.label}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                                    </div>

                                    {/* Check mark */}
                                    {isSelected && (
                                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div
                        className="px-4 py-2.5 border-t"
                        style={{ borderTop: "1px solid rgba(19,62,135,0.07)" }}
                    >
                        <p className="text-xxs text-muted-foreground text-center">
                            Theme preference is saved automatically
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
