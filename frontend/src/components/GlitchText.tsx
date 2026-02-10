
import React, { useEffect, useState } from 'react';
import './GlitchText.css';

interface GlitchTextProps {
    children?: React.ReactNode;
    speed?: number;
    enableShadows?: boolean;
    enableOnHover?: boolean;
    className?: string;
    words?: string[]; // Array of words to cycle through
    glitchColors?: string[]; // Colors for glitches
}

const GlitchText: React.FC<GlitchTextProps> = ({
    children,
    speed = 1,
    enableShadows = true,
    enableOnHover = false,
    className = '',
    words = [],
    glitchColors = ["#ff5f1f", "#ff8001", "#ffd500"]
}) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [key, setKey] = useState(0); // Force re-render for animation reset

    const currentText = words.length > 0 ? words[currentWordIndex] : children;

    useEffect(() => {
        if (words.length > 0) {
            // Change word every X seconds, synchronized loosely with glitch duration?
            // Or just periodic. 
            // The user said "10 words after every flitch". Assuming "glitch".
            // Let's swap every 3 seconds to match the CSS animation duration.

            const interval = setInterval(() => {
                setCurrentWordIndex((prev) => (prev + 1) % words.length);
                setKey(prev => prev + 1); // Trigger re-mount/animation restart if needed
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [words]);

    const inlineStyles = {
        '--after-duration': `${speed * 3}s`,
        '--before-duration': `${speed * 2}s`,
        '--after-shadow': enableShadows ? `-5px 0 ${glitchColors[0]}` : 'none',
        '--before-shadow': enableShadows ? `5px 0 ${glitchColors[2]}` : 'none'
    } as React.CSSProperties;

    const hoverClass = enableOnHover ? 'enable-on-hover' : '';

    return (
        <div
            key={key}
            className={`glitch ${hoverClass} ${className}`}
            style={inlineStyles}
            data-text={currentText}
        >
            {currentText}
        </div>
    );
};

export default GlitchText;
