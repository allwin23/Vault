import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import Navbar from './NavBar';

interface AppLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
    return (
        <div className="flex flex-row h-full w-full bg-transparent overflow-hidden">

            {/* --- GLOBAL WRAPPER: Centers everything with max-width --- */}
            {/* Reverting to reduced padding for positioning, but keeping alignment logic */}
            <div className="flex-1 flex gap-6 p-6 max-w-[1700px] mx-auto h-full overflow-hidden">

                {/* Left Sidebar Column - Same Height as Layout */}
                {showSidebar && (
                    <aside className="w-[250px] h-full flex-shrink-0 flex flex-col">
                        {/* 
                           Top Spacer: Matches EXACTLY the Navbar height (h-14/56px) + margin (mb-4/16px) 
                           Total = 72px visually. 
                        */}
                        <div className="h-14 mb-4 flex-shrink-0" />

                        <div className="flex-1 w-full shadow-2xl rounded-[1.5rem] overflow-hidden relative">
                            <Sidebar className="h-full w-full" />
                        </div>
                    </aside>
                )}

                {/* Right Main Column - Vertical Stack */}
                <div className="flex-1 flex flex-col h-full min-w-0">

                    {/* TOP NAVBAR ROW - Matches Width of Content Below */}
                    <div className="h-14 flex-shrink-0 flex justify-end items-center mb-4">
                        <div className="w-full">
                            <Navbar width="w-full" />
                        </div>
                    </div>

                    {/* MAIN CONTENT CARD - Centered & Sized */}
                    <main className="flex-1 flex relative overflow-hidden rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/40">
                        {/* Glass Visuals */}
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl z-0" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-[#ece6dc]/30 z-0" />

                        {/* Content Wrapper */}
                        <div className="relative z-10 w-full h-full flex flex-col">
                            {children}
                        </div>
                    </main>
                </div>

            </div>

        </div>
    );
}
