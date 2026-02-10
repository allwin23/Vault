
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { saveVerdict } from '../utils/history';
import { useSession } from '../contexts/SessionContext';
import { DebateLayout } from '../components/debate/DebateLayout';
import { TimelineNode } from '../components/debate/TimelineNode';
import { ConversationCard } from '../components/debate/ConversationCard';
import { OutputPanel } from '../components/debate/OutputPanel';
// import { getApiClient } from '../utils/api';
import { getDetokenizer } from '../utils/detokenizer';
import GradientText from '../components/GradientText';
import { CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/NavBar';
import ChatLayout from '../components/ChatLayout';
import MiniChatLayout from '../components/MiniChatLayout';
import GlitchText from '../components/GlitchText';

interface DebateStep {
    id: string;
    timestamp: string;
    title: string;
    content: string;
    type: 'user' | 'system' | 'ai';
    agent?: string;
    outputTitle?: string;
    outputContent?: string;
    outputStatus?: 'secure' | 'warning' | 'processing';
}

interface TrialRoomProps {
    onDebateStateChange?: (state: { type: 'started' | 'transcript' | 'completed' | 'masked', payload?: any }) => void;
    autoStart?: boolean;
    minimal?: boolean;
}

export function TrialRoom({ onDebateStateChange }: TrialRoomProps) {
    const { session } = useSession();
    const location = useLocation();
    const [steps, setSteps] = useState<DebateStep[]>([]);
    const [isDebating, setIsDebating] = useState(false);
    const [showVerdictButton, setShowVerdictButton] = useState(false);
    const [showVerdictModal, setShowVerdictModal] = useState(false);
    const [verdictText, setVerdictText] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    // Load from History if navigated with state
    useEffect(() => {
        if (location.state?.viewVerdict) {
            setVerdictText(location.state.viewVerdict.content);
            setShowVerdictModal(true);
            setIsSaved(true); // Already saved if viewing from history
        }
    }, [location.state]);

    const runTrial = async () => {
        if (isDebating) return;
        if (!session.id) {
            console.error("No active session ID found.");
            return;
        }

        setIsDebating(true);
        setShowVerdictButton(false);
        setShowVerdictModal(false);
        setVerdictText(null);
        setIsSaved(false);
        setSteps([]);
        onDebateStateChange?.({ type: 'started' });

        const detokenizer = getDetokenizer();

        try {
            if (!session.id) {
                throw new Error("No active session. Please start a session from the sidebar.");
            }

            console.log(`Calling runDebate for session: ${session.id}`);

            // Fetch raw response to handle potential stream formatting
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://geminihackathon26-production.up.railway.app/api'}/debate/run/${session.id}`, {
                method: 'POST',
                headers: { 'X-Session-ID': session.id }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            // Using text() instead of json() allows us to handle both standard JSON arrays
            // AND potentially concatenated JSON objects {}{} coming from a stream endpoint
            const rawText = await response.text();
            console.log("Raw API Response Length:", rawText.length);

            let transcript: any[] = [];

            try {
                // Try standard JSON parse first (e.g. [{}, {}])
                const json = JSON.parse(rawText);
                if (json.transcript) transcript = json.transcript;
                else if (Array.isArray(json)) transcript = json;
            } catch (e) {
                console.warn("Standard JSON parse failed, attempting stream/chunk parsing...");
                // Fallback: Parse concatenated JSON objects {}{} using regex or simple split
                const regex = /{[^}]+}/g;
                const matches = rawText.match(regex);
                if (matches) {
                    transcript = matches.map(m => {
                        try { return JSON.parse(m); } catch { return null; }
                    }).filter(Boolean);
                }
            }

            console.log("Parsed Transcript Items:", transcript.length);

            const now = new Date();

            for (let i = 0; i < transcript.length; i++) {
                const item = transcript[i];
                if (!item || !item.text) continue;

                const timestamp = new Date(now.getTime() + i * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

                let type: 'user' | 'system' | 'ai' = 'ai';
                let title = 'AI Agent';

                if (item.agent === 'DefenseLawyer') { title = 'Defense Lawyer'; type = 'ai'; }
                else if (item.agent === 'ProsecutionLawyer') { title = 'Prosecution Lawyer'; type = 'ai'; }
                else if (item.agent === 'SYSTEM') { title = 'Vault System'; type = 'system'; }
                else if (item.agent === 'User') { title = 'User Request'; type = 'user'; }

                // Check for verdict in text or from Judge agent
                if (item.text.startsWith('VERDICT:') || item.agent === 'Judge' || title === 'AI Agent') {
                    if (item.text.toLowerCase().includes('verdict')) {
                        setVerdictText(item.text);
                        continue;
                    }
                }

                // Process PII/Detokenization
                const detokenized = await detokenizer.process(item.text);

                const step: DebateStep = {
                    id: `step-${i}-${Date.now()}`,
                    timestamp,
                    title,
                    type,
                    agent: item.agent,
                    content: item.text,
                    outputTitle: 'Vault Detokenization',
                    outputContent: detokenized !== item.text ? detokenized : 'No PII tokens detected.',
                    outputStatus: item.agent === 'SYSTEM' ? 'secure' : (detokenized !== item.text ? 'warning' : 'processing')
                };

                // Simulate typing delay
                await new Promise(r => setTimeout(r, 800));
                setSteps(prev => [...prev, step]);
            }

            setIsDebating(false);
            setShowVerdictButton(true);
            onDebateStateChange?.({ type: 'completed' });

        } catch (error) {
            console.error("Debate failed:", error);

            const errorStr = String(error);
            const isContextError = errorStr.includes("'masked_content'") || errorStr.includes("masked_content");
            const errorTitle = isContextError ? "Missing Context" : "System Error";

            const errorContent = isContextError
                ? "No sanitized document found for this session. Please clear session/history and sanitize a document again."
                : "Simulation interrupted. Please try re-running the debate or refreshing.";

            setSteps(prev => [...prev, {
                id: 'err',
                timestamp: new Date().toLocaleTimeString(),
                title: errorTitle,
                type: 'system',
                content: errorContent,
                outputTitle: 'Connection Error',
                outputContent: errorStr.substring(0, 200),
                outputStatus: 'warning'
            }]);
            setIsDebating(false);
        }
    };

    return (
        <div className="w-full h-full p-8 flex items-start justify-center relative overflow-hidden text-[#0a0a0a]">
            {/* Main Grid Container - Matches Chat.tsx */}
            <div className="w-full max-w-[1440px] h-full grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-12 gap-y-12">

                {/* Top Left - Glitch Text Area */}
                <div className="w-[280px] hidden md:block h-full">
                    <MiniChatLayout>
                        <div className="flex items-center justify-center h-full w-full">
                            <GlitchText
                                speed={1}
                                enableShadows={true}
                                words={["Vault", "Casefile", "Intelligence", "Evidence", "Timeline", "Secure", "Analysis", "Record", "Session", "Audit"]}
                                glitchColors={["#ff5f1f", "#ff8001", "#ffd500"]}
                                className="text-2xl font-heading font-black tracking-[0.2em] uppercase text-black"
                            />
                        </div>
                    </MiniChatLayout>
                </div>

                {/* Top Right - Navbar (Aligned with ChatLayout) */}
                <div className="flex items-center justify-end h-min">
                    <div className="w-full">
                        <Navbar width="w-full" className="!static !pt-0" />
                    </div>
                </div>

                {/* Bottom Left - Sidebar (Aligned with ChatLayout) */}
                <div className="hidden md:flex flex-col h-full w-[280px]">
                    <div className="h-full w-full shadow-2xl rounded-[1.5rem] overflow-hidden relative">
                        <Sidebar className="h-full w-full" />
                    </div>
                </div>

                {/* Bottom Right - Main Content */}
                <div className="relative h-full w-full min-h-0 pt-4">
                    <ChatLayout>
                        <div className="w-full h-full overflow-y-auto pr-2 scrollbar-hide">
                            <DebateLayout>
                                {/* HEADERS ROW */}
                                <div className="col-span-1 text-xs font-mono font-bold text-text-muted uppercase tracking-wider pl-4 border-b border-black/10 pb-2 mb-2 font-heading">
                                    Timeline
                                </div>
                                <div className="col-span-1 text-xs font-mono font-bold text-text-muted uppercase tracking-wider pl-4 border-b border-black/10 pb-2 mb-2 font-heading">
                                    Sanitised Channel
                                </div>
                                <div className="col-span-1 text-xs font-mono font-bold text-text-muted uppercase tracking-wider pl-4 border-b border-black/10 pb-2 mb-2 font-heading">
                                    Vault / Detokenised
                                </div>

                                {/* CONTROL PANEL ROW */}
                                <div className="col-span-1 relative">
                                    <div className="absolute top-8 left-1/2 -ml-px w-px h-full bg-primary/20" />
                                    <div className="relative z-10 w-3 h-3 rounded-full border-2 bg-accent border-accent mx-auto mt-8" />
                                </div>

                                <div className="col-span-1">
                                    <div className="p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg transition-all hover:bg-white/70">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h2 className="text-lg font-heading font-bold text-primary flex items-center gap-2">
                                                    <GradientText
                                                        colors={["#ff5f1f", "#ff8001", "#ffd500"]}
                                                        animationSpeed={3}
                                                        showBorder={false}
                                                        className="font-bold flex items-center gap-2"
                                                    >
                                                        <span className="text-accent">●</span> Trial Session
                                                    </GradientText>
                                                </h2>
                                                <p className="text-sm font-primary text-text-muted mt-1">
                                                    Initiate adversarial simulation.
                                                </p>
                                            </div>
                                            <button
                                                onClick={runTrial}
                                                disabled={isDebating}
                                                className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 text-sm"
                                            >
                                                {isDebating ? 'Running...' : 'Start Debate'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    {/* Empty placeholder for output or system status */}
                                    <div className="p-4 rounded-xl border border-dashed border-primary/20 opacity-50 text-xs font-mono text-center pt-8">
                                        System Ready
                                    </div>
                                </div>


                                {/* STEPS ROWS */}
                                {steps.map((step, idx) => {
                                    const isLast = idx === steps.length - 1;
                                    const isActive = isLast && isDebating;

                                    const rowOpacity = isDebating && !isActive ? 'opacity-40 blur-[1px] scale-95' : 'opacity-100 scale-100';
                                    const activeHighlight = isActive ? 'scale-105 z-10' : '';

                                    return (
                                        <div
                                            key={step.id}
                                            ref={null}
                                            className={`contents fade-in-row transition-all duration-700 ease-out ${rowOpacity} ${activeHighlight}`}
                                        >
                                            {/* 1. Timeline Cell */}
                                            <div className={`relative flex flex-col items-start pl-8 pt-6 transition-all duration-700 ${isActive ? 'scale-110' : ''}`}>
                                                <TimelineNode
                                                    timestamp={step.timestamp}
                                                    title={step.title}
                                                    isActive={true}
                                                    isLast={isLast}
                                                    color="black"
                                                />
                                            </div>

                                            {/* 2. Conversation Cell (Sanitized) */}
                                            <div className="pt-2 transition-all duration-700">
                                                <ConversationCard
                                                    title={step.title}
                                                    content={step.content}
                                                    type={step.type}
                                                    subtitle="Sanitised Input"
                                                    variant={step.agent === 'DefenseLawyer' ? 'light' : step.agent === 'ProsecutionLawyer' ? 'dark' : 'glass'}
                                                />
                                            </div>

                                            {/* 3. Output Cell (Detokenized) */}
                                            <div className="pt-2 transition-all duration-700">
                                                {step.outputContent && (
                                                    <OutputPanel
                                                        title={step.outputTitle || 'System Log'}
                                                        content={step.outputContent}
                                                        status={step.outputStatus}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* VERDICT BUTTON ROW */}
                                {showVerdictButton && (
                                    <div className="contents fade-in-row">
                                        {/* 1. Verdict Timeline Node */}
                                        <div className="relative flex flex-col items-start pl-8 pt-6 transition-all duration-700">
                                            <TimelineNode
                                                timestamp={new Date().toLocaleTimeString()}
                                                title="FINAL VERDICT"
                                                isActive={true}
                                                isLast={true}
                                                color="black"
                                            />
                                        </div>

                                        {/* 2. Verdict Button (Spans 2 cols or centered) */}
                                        <div className="col-span-2 pt-6 pl-2">
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center"
                                            >
                                                <button
                                                    onClick={() => setShowVerdictModal(true)}
                                                    className="group relative px-8 py-3 bg-black text-white rounded-full font-mono text-sm tracking-[0.2em] font-bold shadow-xl hover:scale-105 transition-all overflow-hidden"
                                                >
                                                    <span className="relative z-10 flex items-center gap-3">
                                                        <Shield size={16} className="text-emerald-400" />
                                                        REVEAL VERDICT
                                                    </span>
                                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                </button>
                                            </motion.div>
                                        </div>
                                    </div>
                                )}
                            </DebateLayout>
                        </div>
                    </ChatLayout>
                </div>

                {/* VERDICT MODAL */}
                <AnimatePresence>
                    {showVerdictModal && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/40 rounded-3xl p-10 shadow-2xl text-center relative overflow-hidden m-4"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />

                                <button
                                    onClick={() => setShowVerdictModal(false)}
                                    className="absolute top-4 right-4 p-2 text-black/50 hover:text-black transition-colors"
                                >
                                    <ArrowRight className="rotate-45" size={20} />
                                </button>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                        <CheckCircle size={48} className="text-emerald-500" />
                                    </div>

                                    <h2 className="text-4xl font-bold mb-2 tracking-tight">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">
                                            ACCESS GRANTED
                                        </span>
                                    </h2>

                                    <p className="text-sm font-mono text-black/70 mb-8 uppercase tracking-widest">
                                        Final Judgement • Case Verified
                                    </p>

                                    {verdictText && (
                                        <div className="w-full bg-white/40 rounded-xl p-8 mb-8 text-left border border-white/20 shadow-inner max-h-60 overflow-y-auto">
                                            <p className="text-lg font-primary leading-relaxed whitespace-pre-wrap text-black font-medium">
                                                {verdictText}
                                            </p>
                                        </div>
                                    )}

                                    {!verdictText && (
                                        <div className="w-full bg-white/40 rounded-xl p-6 mb-8 text-left border border-white/20 shadow-inner">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-bold uppercase text-black/50">Risk Assessment</span>
                                                <span className="text-sm font-bold text-emerald-600">PASSED</span>
                                            </div>
                                            <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-[99%]" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 items-center justify-center w-full">
                                        <button
                                            onClick={() => {
                                                setShowVerdictModal(false);
                                                setShowVerdictButton(false);
                                                setIsDebating(false);
                                                setSteps([]);
                                                // Clear history state to avoid re-opening on reload/nav back
                                                window.history.replaceState({}, document.title);
                                            }}
                                            className="px-8 py-3 bg-black text-white rounded-xl text-sm font-bold tracking-widest hover:bg-black/80 transition-all hover:scale-105 active:scale-95 shadow-lg"
                                        >
                                            CLOSE
                                        </button>

                                        {verdictText && !isSaved && (
                                            <button
                                                onClick={() => {
                                                    if (verdictText) {
                                                        saveVerdict({
                                                            sessionId: session.id || 'archived',
                                                            title: 'Final Verdict',
                                                            content: verdictText,
                                                            timestamp: new Date().toISOString()
                                                        });
                                                        setIsSaved(true);
                                                    }
                                                }}
                                                className="px-8 py-3 bg-white text-black border border-black/10 rounded-xl text-sm font-bold tracking-widest hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                                            >
                                                SAVE TO HISTORY
                                            </button>
                                        )}
                                        {isSaved && (
                                            <div className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold tracking-widest flex items-center gap-2 cursor-default border border-gray-200">
                                                <CheckCircle size={16} /> SAVED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
