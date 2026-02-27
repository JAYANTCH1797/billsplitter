import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Receipt, Users, PieChart, ArrowRightLeft } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">

            {/* Marquee Banner */}
            <div className="bg-foreground text-background py-2 overflow-hidden marquee-container shrink-0">
                <div className="animate-marquee whitespace-nowrap flex">
                    {[...Array(8)].map((_, i) => (
                        <span key={i} className="font-mono text-xs mx-6 flex items-center gap-2">
                            <Zap className="w-3 h-3 inline" /> SPLIT BILLS WITH FRIENDS
                            <span className="text-yellow-400">★</span> NO MORE AWKWARD MONEY TALKS
                            <span className="text-yellow-400">★</span> TRACK WHO OWES WHAT
                        </span>
                    ))}
                </div>
            </div>

            {/* Main — centred hero that fills the screen */}
            {/* pb-28 on mobile leaves room for the fixed bottom CTA bar */}
            <div className="flex-1 flex flex-col justify-between px-6 py-8 pb-28 sm:pb-8 max-w-lg mx-auto w-full">

                {/* Top: logo */}
                <div className="flex items-center gap-2 animate-enter">
                    <div className="w-9 h-9 bg-foreground flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-background" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold tracking-tight text-xl">SPLITSYNC</span>
                </div>

                {/* Middle: headline + pills */}
                <div className="py-8 animate-enter delay-1">
                    <h1 className="text-5xl sm:text-6xl font-bold leading-[0.95] mb-5">
                        SPLIT<br />
                        <span className="inline-block brutal-card-yellow px-3 py-1 transform -rotate-1 my-1">BILLS.</span><br />
                        STAY<br />
                        <span className="inline-block brutal-card-lime px-3 py-1 transform rotate-1 my-1">FRIENDS.</span>
                    </h1>

                    <p className="text-base text-muted-foreground max-w-xs mt-4">
                        Track shared expenses with anyone. No more mental math or awkward chases.
                    </p>

                    {/* 3 feature pills */}
                    <div className="flex flex-wrap gap-2 mt-6 animate-enter delay-2">
                        <span className="flex items-center gap-1.5 border-2 border-foreground px-3 py-1.5 text-xs font-bold">
                            <Users className="w-3.5 h-3.5" strokeWidth={2.5} /> Groups
                        </span>
                        <span className="flex items-center gap-1.5 border-2 border-foreground px-3 py-1.5 text-xs font-bold">
                            <PieChart className="w-3.5 h-3.5" strokeWidth={2.5} /> Split any way
                        </span>
                        <span className="flex items-center gap-1.5 border-2 border-foreground px-3 py-1.5 text-xs font-bold">
                            <ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={2.5} /> Settle up
                        </span>
                    </div>
                </div>

                {/* Inline CTA — visible only on sm+ screens */}
                <div className="hidden sm:block animate-enter delay-3">
                    <p className="text-xs font-mono text-muted-foreground mb-3 text-center">
                        FREE FOREVER · WORKS OFFLINE · NO CREDIT CARD
                    </p>
                    <button
                        onClick={() => navigate('/auth')}
                        className="brutal-btn w-full py-4 text-base"
                        data-testid="join-cta-btn-desktop"
                    >
                        Get Started — It's Free →
                    </button>
                    <button
                        onClick={() => navigate('/auth')}
                        className="w-full py-3 text-xs font-mono text-muted-foreground mt-2 hover:text-foreground transition-colors"
                    >
                        Already have an account? Sign in
                    </button>
                </div>

            </div>

            {/* ── Sticky bottom sheet — mobile only ── */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t-3 border-foreground px-5 pt-4 pb-6 shadow-[0_-4px_0px_hsl(var(--foreground))] animate-enter delay-3">
                <button
                    onClick={() => navigate('/auth')}
                    className="brutal-btn w-full py-4 text-base"
                    data-testid="join-cta-btn"
                >
                    Get Started — It's Free →
                </button>
                <button
                    onClick={() => navigate('/auth')}
                    className="w-full pt-3 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="signin-link"
                >
                    Already have an account? Sign in
                </button>
            </div>

        </div>
    );
};

export default LandingPage;
