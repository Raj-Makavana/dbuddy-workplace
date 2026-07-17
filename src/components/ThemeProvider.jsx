"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "light",
    setTheme: () => {},
});

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState("light");
    const [mounted, setMounted] = useState(false);

    // On mount, read saved theme or detect system preference
    useEffect(() => {
        const stored = localStorage.getItem("dbuddy-theme");
        if (stored && ["light", "dark", "system"].includes(stored)) {
            setThemeState(stored);
        } else {
            setThemeState("system");
        }
        setMounted(true);
    }, []);

    // Apply the theme class to <html> whenever theme changes
    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (theme === "dark" || (theme === "system" && prefersDark)) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme, mounted]);

    // Listen for system theme changes when theme === 'system'
    useEffect(() => {
        if (theme !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => {
            document.documentElement.classList.toggle("dark", e.matches);
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [theme]);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem("dbuddy-theme", newTheme);
    };

    // Prevent flash of wrong theme on first render
    if (!mounted) return null;

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
