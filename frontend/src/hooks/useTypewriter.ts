
import { useEffect, useState } from "react";

export const useTypewriter = (
    text: string,
    start: boolean,
    speed: number = 18
) => {
    const [output, setOutput] = useState("");

    useEffect(() => {
        if (!start) return;
        let i = 0;

        const interval = setInterval(() => {
            setOutput(prev => prev + text.charAt(i));
            i++;

            if (i >= text.length) clearInterval(interval);
        }, speed);

        return () => clearInterval(interval);
    }, [text, start, speed]);

    return output;
};
