
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

interface OutputPanelProps {
    title: string;
    content: string;
    status?: 'secure' | 'warning' | 'processing';
}

export function OutputPanel({ title, content, status = 'secure' }: OutputPanelProps) {
    const getIcon = () => {
        switch (status) {
            case 'secure': return <ShieldCheck size={16} className="text-status-success" />;
            case 'warning': return <AlertTriangle size={16} className="text-status-warning" />;
            case 'processing': return <Lock size={16} className="text-primary/60" />;
        }
    };

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-full mb-6"
        >
            <div className="
                relative overflow-hidden
                p-5 rounded-xl
                bg-white/40 backdrop-blur-md 
                border border-white/30
                shadow-sm
            ">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                    {getIcon()}
                    <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider">
                        {title}
                    </span>
                </div>

                <div className="font-mono text-xs text-text-muted whitespace-pre-wrap leading-relaxed">
                    {content}
                </div>
            </div>
            {/* Connector Line to show relation to center card */}
            <div className="absolute top-8 -left-4 w-4 h-px bg-primary/20" />
        </motion.div>
    );
}
