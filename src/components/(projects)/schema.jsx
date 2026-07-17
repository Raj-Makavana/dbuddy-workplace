"use client";
import { useState, useEffect, useRef } from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useParams } from "next/navigation";
import plantumlEncoder from 'plantuml-encoder';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function SchemaPage() {

    const [umlcode, setUmlcode] = useState("");
    const [encoded, setEncoded] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [diagramLoading, setDiagramLoading] = useState(false);
    const [diagramError, setDiagramError] = useState(null);
    const [imgReady, setImgReady] = useState(false);
    const params = useParams();
    const projectid = params.slug;

    // Encode UML → URL whenever UML code changes
    useEffect(() => {
        if (umlcode) {
            const encodedUML = plantumlEncoder.encode(umlcode);
            setEncoded(encodedUML);
        }
    }, [umlcode]);

    useEffect(() => {
        if (encoded) {
            const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;
            setImageUrl(url);
            setImgReady(false);
            // Cache the URL in sessionStorage for instant re-open
            if (projectid) {
                sessionStorage.setItem(`schema_url_${projectid}`, url);
            }
        }
    }, [encoded, projectid]);

    const getdiagram = async (force = false) => {
        // Return cached diagram immediately (unless force refresh)
        if (!force && projectid) {
            const cached = sessionStorage.getItem(`schema_url_${projectid}`);
            if (cached) {
                setImageUrl(cached);
                setImgReady(false);
                return;
            }
        }

        setDiagramLoading(true);
        setDiagramError(null);
        try {
            const res = await fetch(`/api/projects/${projectid}/diagram`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();
            if (!res.ok) {
                const msg = data?.error || `Failed to fetch diagram (HTTP ${res.status})`;
                setDiagramError(msg);
                return;
            }

            setUmlcode(data.plantuml);
        } catch (err) {
            const msg = err?.message || String(err);
            setDiagramError(msg);
            console.error('Error fetching diagram', err);
        } finally {
            setDiagramLoading(false);
        }
    };

    useEffect(() => {
        getdiagram();
    }, []);

    return (
        <div className="w-full h-full p-4 animate-slide-in-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-border/20">
                <div className="flex items-center justify-between mb-6 animate-slide-in-down">
                    <h2 className="text-2xl font-bold text-foreground">Database Schema Diagram</h2>
                    <button
                        onClick={() => getdiagram(true)}
                        className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all duration-200 cursor-pointer"
                    >
                        ↺ Refresh
                    </button>
                </div>

                <div className="border border-border/20 rounded-xl overflow-hidden w-full">
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.5}
                        maxScale={2}
                        centerOnInit={true}
                        wrapperStyle={{ width: "100%", height: "100%" }}
                    >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <>
                                <div className="controls flex gap-2 p-2 bg-white/60 backdrop-blur-sm border-b border-border/20 animate-slide-in-down">
                                    <button
                                        onClick={() => zoomIn()}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 cursor-pointer transition-all duration-200 text-sm font-medium"
                                    >
                                        Zoom In (+)
                                    </button>
                                    <button
                                        onClick={() => zoomOut()}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 cursor-pointer transition-all duration-200 text-sm font-medium"
                                    >
                                        Zoom Out (-)
                                    </button>
                                    <button
                                        onClick={() => resetTransform()}
                                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 cursor-pointer transition-all duration-200 text-sm font-medium"
                                    >
                                        Reset
                                    </button>
                                </div>

                                <TransformComponent
                                    wrapperStyle={{ width: "100%", maxWidth: "100%", height: "100%" }}
                                >
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                        {diagramLoading ? (
                                            <div className="w-full px-8 py-12 flex flex-col items-center gap-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="rounded-full p-2" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)' }}>
                                                        <DotLottieReact
                                                            src="https://lottie.host/bc9b7976-f4d5-43d6-bf35-d97023948cbd/0LrKX98liy.lottie"
                                                            loop
                                                            autoplay
                                                            style={{ width: 56, height: 56 }}
                                                        />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-lg font-semibold">Rendering schema diagram</div>
                                                        <div className="text-sm text-gray-500">This may take a few seconds — generating an interactive diagram for your database.</div>
                                                    </div>
                                                </div>

                                                {/* Shimmer skeleton grid */}
                                                <div className="w-full grid grid-cols-2 gap-4 mt-4 max-w-4xl">
                                                    {[1, 2, 3, 4].map(n => (
                                                        <div key={n} className="p-4 rounded-xl border border-border/20">
                                                            <div className="skeleton h-4 rounded w-3/4 mb-3" />
                                                            <div className="skeleton h-3 rounded w-1/2 mb-2" />
                                                            <div className="skeleton h-3 rounded w-2/3" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : diagramError ? (
                                            <div className="w-full px-8 py-12 flex flex-col items-center gap-4 animate-scale-in">
                                                <div className="text-red-600 font-medium">Failed to load schema diagram: {diagramError}</div>
                                                <div className="text-sm text-gray-500">Try again — if the problem persists, check your database connection.</div>
                                                <div className="mt-4">
                                                    <button onClick={() => getdiagram(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 cursor-pointer transition-all duration-200">Retry</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={imageUrl !== "" ? imageUrl : "/placeholder.png"}
                                                alt="Schema Diagram"
                                                className={`transition-all duration-500 ${imgReady ? 'animate-fade-scale-in opacity-100' : 'opacity-0'}`}
                                                style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
                                                onLoad={() => setImgReady(true)}
                                            />
                                        )}
                                    </div>
                                </TransformComponent>
                            </>
                        )}
                    </TransformWrapper>
                </div>

                <div className="mt-4 text-sm text-gray-500 animate-slide-in-up">
                    <p className="font-medium mb-1">Tips:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                        <li>Use mouse wheel or pinch gesture to zoom</li>
                        <li>Click and drag to pan around the diagram</li>
                        <li>Use the controls above to zoom in/out or reset the view</li>
                        <li>Click <strong>Refresh</strong> to regenerate the diagram after schema changes</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}