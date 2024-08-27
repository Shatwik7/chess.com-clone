import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const Celebration = () => {
    // Get the window dimensions for the confetti
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        // Update dimensions on window resize
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Congratulations!</h1>
            <p className="text-2xl font-bold mb-4">YOU WON!!</p>
            <Confetti width={dimensions.width} height={dimensions.height} />
        </div>
    );
};

export default Celebration;
