
import React, { useEffect, useState } from 'react';

interface NumberSlotProps {
    targetNumber: number | null; // The final number to show. If null, show '?' or 0
    isAnimating: boolean;
    onAnimationComplete?: () => void;
    index: number; // To add slight delay stagger if needed
}

const NumberSlot: React.FC<NumberSlotProps> = ({ targetNumber, isAnimating, onAnimationComplete, index }) => {
    const [currentNumber, setCurrentNumber] = useState<number | string>('?');

    useEffect(() => {
        if (isAnimating) {
            const interval = setInterval(() => {
                // Show random numbers during animation (1-99 for effect)
                setCurrentNumber(Math.floor(Math.random() * 99) + 1);
            }, 50 + index * 10); // Stagger speed slightly

            // Stop animation after some time
            const timeout = setTimeout(() => {
                clearInterval(interval);
                if (targetNumber !== null) {
                    setCurrentNumber(targetNumber);
                    onAnimationComplete?.();
                }
            }, 1000 + index * 500); // 1s base + delay per slot

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        } else {
            // If not animating, ensure target is shown if available
            if (targetNumber !== null) {
                setCurrentNumber(targetNumber);
            } else {
                setCurrentNumber('?');
            }
        }
    }, [isAnimating, targetNumber, index, onAnimationComplete]);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '160px',
                margin: '10px',
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                fontSize: '4rem',
                fontWeight: 'bold',
                color: 'var(--primary-color)',
                border: '2px solid #eee'
            }}
        >
            {currentNumber}
        </div>
    );
};

export default NumberSlot;
