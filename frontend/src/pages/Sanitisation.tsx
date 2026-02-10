
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Shield, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import ChatLayout from "../components/ChatLayout";
import { Sidebar } from "../components/Sidebar";
import Navbar from "../components/NavBar";
import GradientText from "../components/GradientText";
import { getApiClient, generateProcessingId } from "../utils/api";
import { useSession } from "../contexts/SessionContext";

// --- Components ---

const TypewriterText = ({ text, onComplete, speed = 10 }: { text: string; onComplete?: () => void; speed?: number }) => {
    const [displayedText, setDisplayedText] = useState("");
    const indexRef = useRef(0);

    useEffect(() => {
        if (!text) return;
        indexRef.current = 0;
        setDisplayedText("");
        const intervalId = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayedText((prev) => prev + text.charAt(indexRef.current));
                indexRef.current++;
            } else {
                clearInterval(intervalId);
                onComplete?.();
            }
        }, speed);
        return () => clearInterval(intervalId);
    }, [text, speed, onComplete]);

    const parts = displayedText.split(/(\[[^\]]+\])/g);

    return (
        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-black">
            {parts.map((part, index) => {
                if (part.match(/^\[[^\]]+\]$/)) {
                    return (
                        <span key={index} className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-700 animate-pulse">
                            {part}
                        </span>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </div>
    );
};

const EncryptionAnimation = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-primary w-24 mx-4">
            {/* Simple SVG Animation representing encryption */}
            <div className="relative w-16 h-16 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border-4 border-dashed border-primary/20 rounded-full"
                />
                <Shield size={24} className="text-primary z-10" />
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[10px] uppercase tracking-widest font-bold"
            >
                Encrypting
            </motion.div>
        </div>
    );
};

export default function Sanitisation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { session } = useSession();
    const [isExpanded, setIsExpanded] = useState(false);
    const [status, setStatus] = useState<'initial' | 'processing' | 'revealing' | 'complete'>('initial');
    const [sanitizedData, setSanitizedData] = useState<{ text?: string; pdfUrl?: string; pdfMetadata?: any } | null>(null);
    const [originalContent, setOriginalContent] = useState<{ text?: string; file?: File } | null>(null);
    const hasAutoStarted = useRef(false);

    // Initial Animation & Data Load
    useEffect(() => {
        // Trigger layout expansion
        const t = setTimeout(() => setIsExpanded(true), 100);

        if (!hasAutoStarted.current && location.state) {
            hasAutoStarted.current = true;
            setOriginalContent({
                text: location.state.text,
                file: location.state.file
            });
            handleProcessing(location.state.text, location.state.file);
        }

        return () => clearTimeout(t);
    }, [location.state]);

    const handleProcessing = async (text: string, file?: File) => {
        if (!session.id) return;
        setStatus('processing');
        const apiClient = getApiClient();
        const processingId = generateProcessingId();

        try {
            if (file) {
                const response = await apiClient.sanitizePdf(session.id, processingId, file);
                const blob = new Blob([response.pdf_bytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                // Simulate a slight delay for dramatic effect if API is too fast
                await new Promise(r => setTimeout(r, 2000));

                setSanitizedData({
                    pdfUrl: url,
                    pdfMetadata: {
                        pages: response.pages,
                        tokens: Object.keys(response.tokens).length
                    },
                    text: response.text // Capture text
                });
            } else if (text) {
                const response = await apiClient.sanitizeText(session.id, processingId, text);
                // Simulate delay
                await new Promise(r => setTimeout(r, 1500));

                setSanitizedData({
                    text: response.sanitized_text
                });
            }
            setStatus('revealing');
        } catch (e) {
            console.error(e);
            setStatus('complete'); // Handle error state ideally
        }
    };

    const handleTypewriterComplete = () => {
        setStatus('complete');
    };

    const isPdfMode = !!originalContent?.file;

    return (
        <div className="w-full h-screen p-8 flex items-start justify-center relative overflow-hidden text-[#0a0a0a]">

            {/* Sidebar Container - Animates Width to 0 */}
            <motion.div
                initial={{ width: 280, x: 0, opacity: 1, marginRight: 48 }} // 48 is gap-12 equivalent
                animate={isExpanded ? { width: 0, x: -50, opacity: 0, marginRight: 0 } : { width: 280, x: 0, opacity: 1, marginRight: 48 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex flex-col h-full rounded-[1.5rem] overflow-hidden relative shadow-2xl flex-shrink-0"
            >
                <div className="w-[280px] h-full">
                    <Sidebar className="h-full w-full" />
                </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
                layout
                className="flex-1 h-full flex flex-col relative min-w-0"
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >

                {/* Navbar */}
                <div className="w-full flex justify-end h-min mb-8">
                    <motion.div
                        layout
                        className="w-full"
                        style={{ width: '100%' }} // Force full width during layout transition
                    >
                        <Navbar width="w-full" className="!static !pt-0" />
                    </motion.div>
                </div>

                {/* Secure Processing Environment */}
                <ChatLayout>
                    <div className="relative w-full h-full flex flex-col p-8 overflow-hidden">

                        {/* Header Status */}
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${status === 'processing' ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                                <span className="font-mono text-xs uppercase tracking-widest text-[#555]">
                                    {status === 'processing' ? 'Awaiting Sanitization' : 'Secure Vault Active'}
                                </span>
                            </div>
                            <div className="font-mono text-xs text-[#555]">
                                SESSION ID: {session.id?.slice(0, 8)}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex items-stretch justify-center gap-8 min-h-0">

                            {/* LEFT PANEL: Original Content */}
                            {!isPdfMode && (status === 'processing' || status === 'revealing' || status === 'complete') && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex-1 flex flex-col bg-black border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText size={14} className="text-[#ff5f1f]" />
                                        <GradientText
                                            colors={["#ff5f1f", "#ff8001", "#ffd500"]}
                                            animationSpeed={3}
                                            showBorder={false}
                                            className="text-[10px] uppercase tracking-widest font-bold"
                                        >
                                            Original Input
                                        </GradientText>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-2 font-mono text-sm leading-relaxed text-white/90">
                                        {originalContent?.text}
                                    </div>
                                </motion.div>
                            )}

                            {/* CENTER: Encryption Transition */}
                            <div className="flex flex-col justify-center items-center">
                                {status === 'processing' && (
                                    <EncryptionAnimation />
                                )}
                                {(status === 'revealing' || status === 'complete') && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                                    >
                                        <CheckCircle className="text-white" size={20} />
                                    </motion.div>
                                )}
                            </div>

                            {/* RIGHT PANEL: Sanitized Output */}
                            <div className={`flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl p-6 shadow-xl overflow-hidden relative group ${isPdfMode ? 'max-w-2xl' : ''}`}>


                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-2 text-green-600">
                                        <Shield size={14} />
                                        <span className="text-[10px] uppercase tracking-widest font-bold">Sanitized Output</span>
                                    </div>
                                    {isPdfMode && sanitizedData?.pdfMetadata && (
                                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold">
                                            SAFE PDF
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 relative z-10 text-black">
                                    {status === 'processing' && (
                                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                                            <Loader2 className="animate-spin mb-2 text-black" size={24} />
                                            <span className="text-xs font-mono text-black">PROCESSING...</span>
                                        </div>
                                    )}

                                    {(status === 'revealing' || status === 'complete') && (
                                        <>
                                            {isPdfMode && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex flex-col items-center justify-center p-6 border-b border-gray-100 bg-gray-50/50 rounded-xl mb-4"
                                                    onAnimationComplete={() => handleTypewriterComplete()}
                                                >
                                                    <FileText size={32} className="text-gray-400 mb-2" />
                                                    <div className="text-center">
                                                        <h3 className="font-bold text-gray-800 text-sm">{originalContent?.file?.name}</h3>
                                                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
                                                            Segments Redacted
                                                        </p>
                                                    </div>

                                                </motion.div>
                                            )}

                                            {/* Show Text (for both Text and PDF modes) */}
                                            <TypewriterText
                                                text={sanitizedData?.text || (isPdfMode ? "Processing PDF content..." : "")}
                                                onComplete={handleTypewriterComplete}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Footer Action */}
                        <AnimatePresence>
                            {status === 'complete' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-6 right-8"
                                >
                                    <button
                                        onClick={() => navigate('/trial-room')}
                                        className="group relative px-6 py-3 bg-[#0a0a0a] text-white rounded-xl font-mono text-xs tracking-widest font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            ENTER TRIAL ROOM <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </ChatLayout>
            </motion.div>
        </div>
    );
}