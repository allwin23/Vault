
import { ReactNode, useRef, useEffect } from 'react';

interface DebateLayoutProps {
    children: ReactNode;
}

export function DebateLayout({ children }: DebateLayoutProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when children change (new step added)
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [children]);

    return (
        <div className="relative w-full h-full overflow-hidden flex justify-center bg-transparent">
            {/* Main Scroll Container */}
            <div
                ref={scrollRef}
                className="w-full max-w-[1600px] h-full overflow-y-auto px-8 py-10 scrollbar-hide scroll-smooth"
            >
                {/* Unified Grid */}
                <div className="grid grid-cols-[140px_1fr_350px] gap-x-12 gap-y-12 pb-32">
                    {children}
                </div>
            </div>

            {/* Fade overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f5f0e9] to-transparent pointer-events-none" />
        </div>
    );
}
