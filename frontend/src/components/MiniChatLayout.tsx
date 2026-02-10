
import { ReactNode } from "react";

interface MiniChatLayoutProps {
    children: ReactNode;
}

export default function MiniChatLayout({ children }: MiniChatLayoutProps) {
    return (
        <div className="mini-chat-root relative w-full h-full rounded-[1.5rem] overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-white/20">
            {/* Background (Glass Effect) - More transparent than main chat */}
            <div className="mini-chat-bg absolute inset-0 bg-white/5 backdrop-blur-[2px] z-0" />

            {/* Subtle Gradient */}
            <div className="mini-chat-gradient absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent z-0" />

            {/* Content */}
            <div className="mini-chat-container relative z-10 w-full h-full flex items-center justify-center p-4">
                {children}
            </div>
        </div>
    );
}
