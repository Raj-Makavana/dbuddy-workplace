"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import SchemaPage from "@/components/(projects)/schema";
import Optimization from "@/components/(projects)/optimization";
import Query from "@/components/(projects)/query";
import SummaryCard from "@/components/(projects)/summary_card";
import History from "@/components/(projects)/history";
import TableExplorer from "@/components/(projects)/TableExplorer";
import { ArrowLeft, Database, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const params = useParams();
  const projectid = params.slug;

  const [projectdetail, setprojectdetail] = useState({});
  const [page, setpage] = useState("table");
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [queryToPass, setQueryToPass] = useState(null);

  const handleSetPage = (newPage) => {
    setpage(newPage);
  };

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${projectid}`, { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        if (data.project) {
          setprojectdetail(data.project);
        }
      } catch (err) {
        console.error("Error fetching project detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectid) {
      fetchProjectDetail();
    }
  }, [projectid]);

  return (
    <div className="min-h-screen flex flex-col dashboard-bg">
      <Header />

      <div className="db glass-panel border-b border-border/30 w-full flex items-center py-4 px-6 gap-4 shadow-sm">
        <div className="db_left flex items-center">
          <ArrowLeft
            className="w-9 h-9 p-2 hover:bg-muted/50 rounded-xl transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => (globalThis.location.href = "/dashboard")}
          />
        </div>

        <div className="db_right w-full flex gap-3 items-center">
          <div className="db_icon flex items-center">
            <div className="relative p-2.5 rounded-2xl w-12 h-12 flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #133E87 0%, #608BC1 100%)'}}>
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="details flex flex-col justify-center">
            {loading ? (
              <div className="space-y-2">
                <div className="skeleton h-5 w-40 rounded" />
                <div className="skeleton h-3.5 w-64 rounded" />
              </div>
            ) : (
              <>
                <span className="text-base md:text-lg font-extrabold text-gradient leading-snug">
                  {projectdetail.project_name}
                </span>
                <span className="text-muted-foreground text-xs md:text-sm line-clamp-1 leading-normal">
                  {projectdetail.description || "No description provided."}
                </span>
                <span className="text-xxs font-bold text-secondary uppercase tracking-wider mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    {projectdetail.table_count || 0} Tables · Connected
                  </span>
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button 
              onClick={() => setShowSummary(true)} 
              className="h-9 px-4 btn-glow text-white rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
              style={{background: 'linear-gradient(135deg, #133E87 0%, #608BC1 100%)'}}
              disabled={loading}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              AI Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="content flex flex-row w-full flex-1 min-h-0">
        <Sidebar active={page} onSelectPage={(p) => setpage(p)} />

        <div className="rightcontent flex flex-col w-full border-l border-border/20 overflow-x-hidden overflow-y-scroll min-h-0 h-screen" style={{background: 'radial-gradient(ellipse 100% 60% at 70% 0%, rgba(96,139,193,0.07) 0%, transparent 70%)'}}>
          {page === "table" ? (
            <TableExplorer projectId={projectid} />
          ) : page === "query" ? (
            <Query initialQuery={queryToPass} onQueryMounted={() => setQueryToPass(null)} />
          ) : page === "history" ? (
            <History handleSetPage={handleSetPage} setQueryToPass={setQueryToPass} />
          ) : page === "optimization" ? (
            <Optimization />
          ) : page === "schema" ? (
            <SchemaPage />
          ) : null}
        </div>
      </div>

      {showSummary && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <SummaryCard projectId={projectid} onClose={() => setShowSummary(false)} />
        </div>
      )}
    </div>
  );
}
