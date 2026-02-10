import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
    width?: string;
    className?: string;
}

export default function Navbar({ width, className }: NavbarProps) {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState<string | null>(null);
    return (
        <header className={`w-full flex justify-center sticky top-0 z-50 pt-4 ${className || ''}`}>
            <nav
                className={`max-w-[1400px] h-[72px] flex items-center justify-between px-6 rounded-[18px] ${width || 'w-[96%]'}`}
                style={{
                    background:
                        "linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)), rgba(0,0,0,0.35)",
                    backdropFilter: "blur(18px) saturate(140%)",
                    WebkitBackdropFilter: "blur(18px) saturate(140%)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow:
                        "inset 0 0 0.5px rgba(255,255,255,0.3), 0 8px 40px rgba(0,0,0,0.35)",
                    fontFamily: "Space Mono",
                }}
            >
                {/* LEFT */}
                <div className="flex items-center gap-2 text-white">
                    <span className="text-xl opacity-90">✳</span>
                    <span className="text-[20px] tracking-wide">VaultSim</span>
                </div>

                {/* CENTER NAV */}
                <ul
                    className="flex gap-9 text-[14px] tracking-[0.15em]"
                    style={{ fontFamily: "Space Mono" }}
                >
                    <li
                        className="text-white/70 hover:text-white cursor-pointer transition"
                        onMouseEnter={() => setActiveItem('CASE')}
                        onMouseLeave={() => setActiveItem(null)}
                    >
                        CASE
                    </li>
                    <li
                        className="text-white/70 hover:text-white cursor-pointer transition"
                        onMouseEnter={() => setActiveItem('SANITISATION')}
                        onMouseLeave={() => setActiveItem(null)}
                    >
                        SANITISATION
                    </li>
                    <li
                        className="text-white/70 hover:text-white cursor-pointer transition"
                        onMouseEnter={() => setActiveItem('TRIAL')}
                        onMouseLeave={() => setActiveItem(null)}
                    >
                        TRIAL
                    </li>
                    <li
                        className="text-white/70 hover:text-white cursor-pointer transition"
                        onMouseEnter={() => setActiveItem('VAULT')}
                        onMouseLeave={() => setActiveItem(null)}
                    >
                        VAULT
                    </li>
                    <li
                        className="text-orange-500 cursor-pointer"
                        onMouseEnter={() => setActiveItem('AGENT')}
                        onMouseLeave={() => setActiveItem(null)}
                    >
                        AGENT
                    </li>
                </ul>

                {/* RIGHT */}
                <div className="flex items-center gap-3">
                    {/* Language */}


                    {/* Contact - Now Try Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="px-5 h-[40px] rounded-xl text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                        style={{
                            background: "rgba(255,255,255,0.9)",
                            color: "#111",
                            fontFamily: "Space Mono",
                            letterSpacing: "0.05em",
                        }}
                    >
                        TRY <span>→</span>
                    </button>
                </div>

                {/* Hover Explainer Card */}
                <AnimatePresence>
                    {activeItem && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[300px] bg-[#f5f0e9] border border-black/10 rounded-xl p-6 shadow-2xl z-[100] pointer-events-none"
                        >
                            <h3 className="text-lg font-bold text-[#0a0a0a] mb-2 font-mono uppercase tracking-wider">
                                {activeItem}
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed font-sans">
                                {navDescriptions[activeItem]}
                            </p>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
}

const navDescriptions: Record<string, string> = {
    'CASE': "Manage and organize complex legal cases with secure document handling.",
    'SANITISATION': "AI-powered redaction of sensitive PII before any processing occurs.",
    'TRIAL': "Run simulated courtroom scenarios with multi-agent adversarial debate.",
    'VAULT': "Encrypted, session-only storage that guarantees zero data persistence.",
    'AGENT': "Configure the AI legal assistants tailored to specific jurisdictions."
};
