import { ChatInput } from '../components/ChatInput';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// import { useSession } from '../contexts/SessionContext'; // Unused
import ChatLayout from '../components/ChatLayout';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/NavBar';
import MiniChatLayout from '../components/MiniChatLayout';

import ShinyText from '../components/ShinyText';
import GradientText from '../components/GradientText';

export default function Chat() {
    const navigate = useNavigate();
    // const { session, initializeSession } = useSession(); // unused for now
    const [isProcessing, setIsProcessing] = useState(false);

    // Shiny Text Rotation Logic
    const shinyWords = ["Vault", "Casefile", "Intelligence", "Evidence", "Timeline", "Secure", "Analysis", "Record", "Session", "Audit"];
    const [shinyIndex, setShinyIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setShinyIndex((prev) => (prev + 1) % shinyWords.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Initialize Session on Mount if not active
    // Auto-init removed per user request
    // Session must be created manually via Sidebar button

    // Handle Generation (API Calls)
    const handleGenerate = async (text: string, file?: File) => {
        if (!text.trim() && !file) return;
        setIsProcessing(true);

        try {
            // Using session context to handle file/text processing if available
            // If strictly using API client manually as per previous code:

            // Navigate with state for auto-start
            navigate('/sanitisation', { state: { text, file } });

        } catch (error) {
            console.error("Processing failed:", error);
            // addSecurityEvent logic if needed
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full h-full p-8 flex items-start justify-center relative overflow-hidden text-[#0a0a0a]">
            {/* Main Grid Container - Reduced Width & Spacing */}
            <div className="w-full max-w-[1440px] h-full grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-12 gap-y-12">

                {/* Top Left - Glitch Text Area */}
                <div className="w-[280px] hidden md:block h-full">
                    <MiniChatLayout>
                        <div className="flex items-center justify-center h-full w-full">
                            <ShinyText
                                text={shinyWords[shinyIndex]}
                                color="#2a2a2a"
                                shineColor="#ffffff"
                                speed={1}
                                className="text-2xl font-heading font-black tracking-[0.2em] uppercase opacity-90 transition-all duration-500"
                            />
                        </div>
                    </MiniChatLayout>
                </div>

                {/* Top Right - Navbar (Aligned with ChatLayout) */}
                <div className="flex items-center justify-end h-min relative z-[100]">
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

                {/* Bottom Right - Chat Layout (Main Content) */}
                <div className="relative h-full w-full min-h-0 pt-4">
                    <ChatLayout>
                        <div className="relative w-full h-full flex flex-col justify-between pb-32">
                            {/* Top Header Section - Centered */}
                            <div className="pt-16 flex flex-col items-center justify-center gap-4 text-center px-4">
                                <ShinyText
                                    text="Encrypted Chat With"
                                    disabled={false}
                                    speed={3}
                                    color="#0a0707ff"
                                    shineColor="#00000000"
                                    className="text-4xl md:text-5xl lg:text-6xl font-sunbflower-tracking-tight uppercase opacity-60"
                                />
                                <GradientText
                                    colors={["#ff5f1f", "#ff8001", "#ffd500"]}
                                    animationSpeed={2.5}
                                    showBorder={false}
                                    className="text-xl md:text-2xl font-mono tracking-[0.2em]"
                                >
                                    MULTI AGENT LEGAL SYSTEM
                                </GradientText>
                            </div>

                            {/* Transition Overlay */}
                            {isProcessing && (
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-[60] transition-opacity duration-700 animate-in fade-in rounded-[2.5rem]" />
                            )}

                            {/* Content (Chat Input) */}
                            <div className={`transition-all duration-700 relative z-50 px-8 ${isProcessing ? "scale-[0.98] opacity-60 pointer-events-none" : "w-full"}`}>
                                <div className="w-full flex justify-center">
                                    <ChatInput onSend={handleGenerate} isProcessing={isProcessing} />
                                </div>
                            </div>

                        </div>
                    </ChatLayout>
                </div>

            </div>

        </div>
    );
}
