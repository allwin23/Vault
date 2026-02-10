
import { motion } from 'framer-motion';

interface ConversationCardProps {
    title?: string;
    subtitle?: string;
    content: string;
    type?: 'user' | 'system' | 'ai';
    variant?: 'glass' | 'light' | 'dark';
}

export function ConversationCard({ title = "Vault", subtitle, content, type = 'ai', variant = 'glass' }: ConversationCardProps) {
    const isUser = type === 'user';

    const getVariantClasses = () => {
        if (isUser) return 'bg-primary/5 border-primary/10 text-text ml-auto max-w-[90%]';
        switch (variant) {
            case 'dark': return 'bg-black border-white/20 text-white mr-auto max-w-full';
            case 'light': return 'bg-white border-black/10 text-black mr-auto max-w-full';
            default: return 'bg-white/80 border-white/20 text-text mr-auto max-w-full';
        }
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`
                relative overflow-hidden
                w-full mb-6 p-6 
                rounded-2xl border 
                backdrop-blur-xl shadow-xl
                transition-all duration-500
                ${getVariantClasses()}
            `}
        >
            {/* Glossy Overlay for 'Glass' feel - Hidden for dark/black cards */}
            {variant !== 'dark' && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            )}

            {/* Header */}
            {!isUser && (
                <div className={`relative flex justify-between items-center mb-3 pb-2 border-b ${variant === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className={`font-heading font-bold tracking-wide text-sm uppercase ${variant === 'dark' ? 'text-white' : 'text-primary'}`}>
                            {title}
                        </span>
                    </div>
                    {subtitle && (
                        <span className={`font-mono text-[10px] uppercase tracking-widest ${variant === 'dark' ? 'text-white/60' : 'text-text-muted'}`}>
                            {subtitle}
                        </span>
                    )}
                </div>
            )}

            {/* Content */}
            <div className={`relative font-primary text-lg leading-relaxed ${isUser ? 'italic text-right text-text/80' : (variant === 'dark' ? 'text-white' : 'text-text')}`}>
                {content}
            </div>
        </motion.div>
    );
}
