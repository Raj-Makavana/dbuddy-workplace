"use client";

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { CircleUserRound, HelpCircle, Shield, Database, LogOut } from 'lucide-react';

const handleLogout = async () => {
    try {
        // Call logout endpoint to clear NextAuth session cookies
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include" // Ensure cookies are sent and received
        });

        // Also explicitly sign out from NextAuth to trigger its cleanup
        try {
            await signOut({
                redirect: false,
                callbackUrl: "/"
            });
        } catch (e) {
            console.error('NextAuth signOut error:', e);
        }

        // Force redirect to home page after a small delay to ensure cookies are cleared
        setTimeout(() => {
            window.location.href = "/";
        }, 100);
    } catch (error) {
        console.error("Logout error:", error);
        // Force redirect even on error to clear client state
        window.location.href = "/";
    }
};

const Header = () => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if user is admin
        const checkAdmin = async () => {
            try {
                const res = await fetch('/api/admin/check');
                if (res.ok) {
                    const data = await res.json();
                    setIsAdmin(data.isAdmin);
                }
            } catch (error) {
                // Silently fail - user is not admin
            }
        };
        checkAdmin();
    }, []);

    return (
        <header className="relative w-full z-30 bg-card/65 backdrop-blur-md border-b border-border/40 px-6 py-4.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                
                {/* Logo & Brand */}
                <div 
                    className="flex items-center space-x-3 cursor-pointer group"
                    onClick={() => (window.location.href = "/dashboard")}
                >
                    <div className="p-2 bg-gradient-to-tr from-primary to-secondary rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105">
                        <Database className="w-5.5 h-5.5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-gradient">
                            DBuddy
                        </h1>
                        <p className="text-xxs font-bold text-secondary uppercase tracking-wider -mt-0.5">
                            Workspace
                        </p>
                    </div>
                </div>

                {/* Navigation actions */}
                <div className="flex items-center gap-2.5">
                    {isAdmin && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => (window.location.href = "/admin")}
                            className="h-9 px-3 border-border/60 hover:bg-muted/50 rounded-xl cursor-pointer transition-all duration-200"
                            title="Admin Panel"
                        >
                            <Shield className="w-4 h-4 text-primary mr-1.5" />
                            <span className="text-xs font-semibold hidden md:inline">Admin</span>
                        </Button>
                    )}
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = "/help")}
                        className="h-9 px-3 border-border/60 hover:bg-muted/50 rounded-xl cursor-pointer transition-all duration-200"
                        title="Help & Support"
                    >
                        <HelpCircle className="w-4 h-4 text-muted-foreground mr-1.5" />
                        <span className="text-xs font-semibold hidden md:inline">Support</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = "/profile")}
                        className="h-9 w-9 p-0 border-border/60 hover:bg-muted/50 rounded-xl cursor-pointer transition-all duration-200"
                        title="Profile"
                    >
                        <CircleUserRound className="w-5 h-5 text-muted-foreground" />
                    </Button>

                    <div className="h-5 w-px bg-border/40 mx-1"></div>

                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleLogout}
                        className="h-9 px-3 border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded-xl cursor-pointer transition-all duration-200"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4 mr-1.5" />
                        <span className="text-xs font-semibold">Sign Out</span>
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header;