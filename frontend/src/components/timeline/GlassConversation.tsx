import React, { useEffect, useState, useRef } from "react";
import { useDetokenizer } from "../../hooks/useDetokenizer";

interface Props {
    maskText?: string;
    stage: number;
}

interface Message {
    id: string;
    sender: 'user' | 'system' | 'secure';
    text: string;
    isMorphing?: boolean;
}

const ChatBubble: React.FC<{ msg: Message }> = ({ msg }) => {
    const { detokenize } = useDetokenizer();
    const [displayText, setDisplayText] = useState(msg.text);
    const [isSecured, setIsSecured] = useState(false);

    useEffect(() => {
        if (msg.isMorphing) {
            // Wait a moment then detokenize
            const timer = setTimeout(() => {
                detokenize(msg.text).then(clean => {
                    setDisplayText(clean || msg.text);
                    setIsSecured(true);
                });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [msg.isMorphing, msg.text, detokenize]);

    const isUser = msg.sender === 'user';

    return (
        <div className={`flex flex-col ${isUser ? 'items-end self-end' : 'items-start self-start'} max-w-[80%] animate-in slide-in-from-bottom-2 fade-in duration-500`}>
            <div className="text-xs text-white/40 mb-1 px-2 uppercase tracking-widest">
                {msg.sender === 'secure' && isSecured ? 'Secure Output' : msg.sender}
            </div>
            <div
                className={`
                    backdrop-blur-xl border px-6 py-4 rounded-2xl shadow-2xl transition-all duration-700
                    ${isUser
                        ? 'bg-white/10 border-white/20 text-white rounded-tr-sm'
                        : isSecured
                            ? 'bg-green-500/10 border-green-400/30 text-green-100 rounded-tl-sm shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                            : 'bg-black/40 border-white/10 text-gray-300 rounded-tl-sm'
                    }
                `}
            >
                {displayText}
            </div>
        </div>
    );
};

export const GlassConversation: React.FC<Props> = ({ stage, maskText }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const seenStages = useRef<Set<number>>(new Set());

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Stage-based message injection
    useEffect(() => {
        if (seenStages.current.has(stage)) return;
        seenStages.current.add(stage);

        if (stage === 1) {
            setMessages(prev => [...prev, {
                id: 'req-1',
                sender: 'user',
                text: "Process access request for user John Doe <john.doe@example.com>. Include SSN and Location."
            }]);
        }

        if (stage === 2) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: 'sys-1',
                    sender: 'system',
                    text: "Initiating PII sanitisation protocol..."
                }]);
            }, 800);
        }

        if (stage === 4 && maskText) {
            setMessages(prev => [...prev, {
                id: 'sec-1',
                sender: 'secure',
                text: maskText, // "Identity verified for [TOKEN_01]..."
                isMorphing: true
            }]);
        }

    }, [stage, maskText]);

    return (
        <div className="w-full max-w-[900px] flex flex-col gap-8 pb-32">
            {messages.map((msg) => (
                <ChatBubble key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
};
