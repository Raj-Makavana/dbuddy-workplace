import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/(auth)/LoginForm";
import SignupForm from "@/components/(auth)/SignupForm";
import { Database, Sparkles, Zap, Brain } from "lucide-react";

export default function Page() {
    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-background">
            
            {/* Ambient Animated Mesh Background Blobs */}
            <div className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-float-1 pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-[100px] animate-float-2 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-accent/20 rounded-full blur-[80px] animate-float-3 pointer-events-none"></div>

            <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 animate-fade-in-up">
                
                {/* Left side - Dynamic Feature Showcase */}
                <div className="space-y-8 text-left">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-tr from-primary to-secondary rounded-2xl shadow-lg animate-pulse-glow">
                            <Database className="w-9 h-9 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-gradient">
                                DBuddy
                            </h1>
                            <p className="text-sm font-semibold tracking-wider uppercase text-secondary">
                                AI Database Companion
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-foreground">
                            Create databases with <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent-foreground">natural language</span>
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Stop wrestling with complex SQL queries and tables. Just state your requirements in plain English, and watch DBuddy build, optimize, and deploy it instantly.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="p-5 rounded-2xl glass-card transition-all duration-300">
                            <div className="p-2 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">AI-Powered Creation</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Automatically generate complete database structures from descriptions.</p>
                        </div>

                        <div className="p-5 rounded-2xl glass-card transition-all duration-300">
                            <div className="p-2 w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center mb-3">
                                <Zap className="w-5 h-5 text-secondary-foreground" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">One-Click Deployment</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Instantly launch your relational database on Neon Postgres.</p>
                        </div>

                        <div className="p-5 rounded-2xl glass-card transition-all duration-300 md:col-span-2">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 w-10 h-10 bg-accent/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Brain className="w-5 h-5 text-accent-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground mb-1">Smart Querying & Insights</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Write analytical queries in conversational English. Get visual results, optimization suggestions, and automatic index tuning recommendations instantly.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Glassmorphic Auth Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="relative group">
                        {/* Glow Behind Card */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        
                        <Card className="relative glass-panel shadow-2xl rounded-3xl border-0">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">Welcome to DBuddy</CardTitle>
                                <CardDescription className="text-muted-foreground mt-1">
                                    Sign in or create a new account to start building
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <Tabs defaultValue="login" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/30 rounded-xl mb-6">
                                        <TabsTrigger 
                                            value="login" 
                                            className="cursor-pointer py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                        >
                                            Sign In
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="signup" 
                                            className="cursor-pointer py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                        >
                                            Sign Up
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="login" className="focus-visible:outline-none">
                                        <LoginForm />
                                    </TabsContent>
                                    <TabsContent value="signup" className="focus-visible:outline-none">
                                        <SignupForm />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}