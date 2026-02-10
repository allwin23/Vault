
import { motion } from 'framer-motion';

interface TimelineNodeProps {
    timestamp: string;
    title: string;
    isActive?: boolean;
    isLast?: boolean;
    color?: 'primary' | 'black';
}

export function TimelineNode({ timestamp, title, isActive, isLast, color = 'primary' }: TimelineNodeProps) {
    return (
        <div className="flex flex-row gap-4 w-full h-full min-w-[200px]">
            {/* Left Column: Line & Dot */}
            <div className="flex flex-col items-center w-6 shrink-0 relative">
                {/* Node Circle */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-3 h-3 rounded-full border-2 z-10 ${
                        color === 'black'
                            ? (isActive ? 'bg-black border-black' : 'bg-transparent border-black/50')
                            : (isActive ? 'bg-accent border-accent' : 'bg-primary border-primary')
                    }`}
                />

                {/* Vertical Line */}
                {!isLast && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 0.5 }}
                        className="w-px bg-primary/20 flex-grow min-h-[50px] my-1 absolute top-3 bottom-[-100px]" 
                    />
                )}
            </div>

            {/* Right Column: Content */}
            <div className="flex flex-col pt-0.5 min-w-0 flex-1">
                <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col"
                >
                    {/* User requested Time in Black */}
                    <span className="font-mono text-[10px] uppercase font-bold text-black tracking-wider whitespace-nowrap">
                        {timestamp}
                    </span>
                    <span className={`text-xs font-heading font-medium mt-0.5 truncate ${isActive ? 'text-accent' : 'text-text-muted'}`}>
                        {title}
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
