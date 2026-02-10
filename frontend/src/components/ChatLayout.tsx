import { ReactNode } from "react";

interface ChatLayoutProps {
    children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
    return (
        <div className="chat-root relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/40">
            {/* Background (Glass Effect) - More transparent */}
            <div className="chat-bg absolute inset-0 bg-white/5 backdrop-blur-[4px] z-0" />

            {/* Gradient focus zone */}
            <div className="chat-gradient absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent z-0" />

            {/* Chat content */}
            <div className="chat-container relative z-10 w-full h-full flex flex-col">
                {children}
            </div>
        </div>
    );
}
