import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const AnalogClock = ({ hours, minutes, interactive = false, onChange }) => {
    const clockRef = useRef(null);
    const [activeHand, setActiveHand] = useState(null); // 'hour' | 'minute' | null

    // Calculate degrees for display
    const hourDegrees = (hours % 12) * 30 + (minutes * 0.5);
    const minuteDegrees = minutes * 6;

    const getPointerInfo = (e) => {
        const rect = clockRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        const normalizedAngle = (angle + 360) % 360;

        return { normalizedAngle, distance };
    };

    const handlePointerDown = (e) => {
        if (!interactive || !onChange) return;
        const { distance } = getPointerInfo(e);

        // Closer to center = hour hand, further out = minute hand
        if (distance < 75) {
            setActiveHand('hour');
        } else if (distance < 140) {
            setActiveHand('minute');
        }
    };

    const handlePointerMove = (e) => {
        if (!interactive || !onChange || !activeHand) return;

        const { normalizedAngle } = getPointerInfo(e);

        if (activeHand === 'minute') {
            const m = Math.round(normalizedAngle / 6) % 60;
            onChange({ hours, minutes: m });
        } else {
            let h = Math.round(normalizedAngle / 30) % 12;
            onChange({ hours: h === 0 ? 12 : h, minutes });
        }
    };

    const handlePointerUp = () => {
        setActiveHand(null);
    };

    return (
        <div
            className="clock-container"
            ref={clockRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            style={{
                position: 'relative',
                width: '280px',
                height: '280px',
                margin: '0 auto',
                touchAction: 'none',
                cursor: interactive ? 'crosshair' : 'default'
            }}
        >
            {/* Clock Face Background */}
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.2)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    pointerEvents: 'none'
                }}
            />

            {/* Hour Markers - Perfectly Centered */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: i % 3 === 0 ? '6px' : '3px',
                        height: i % 3 === 0 ? '20px' : '10px',
                        background: i % 3 === 0 ? 'var(--primary-accent)' : 'rgba(255,255,255,0.4)',
                        borderRadius: '10px',
                        // Move to edge and rotate
                        transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-120px)`,
                        pointerEvents: 'none'
                    }}
                />
            ))}

            {/* Numbers - Perfectly Centered */}
            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
                <div
                    key={num}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${num * 30}deg) translateY(-90px) rotate(${-num * 30}deg)`,
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: '700',
                        fontSize: '1.2rem',
                        pointerEvents: 'none',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}
                >
                    {num}
                </div>
            ))}

            {/* Hands Container */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>

                {/* Hour Hand Visual */}
                <motion.div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '8px',
                        height: '75px',
                        background: 'linear-gradient(to top, var(--primary-accent), #fbc2eb)',
                        borderRadius: '8px',
                        originY: 1,
                        x: '-50%',
                        y: '-100%',
                        zIndex: 6,
                        boxShadow: '0 0 15px rgba(0,0,0,0.4)'
                    }}
                    animate={{ rotate: hourDegrees }}
                    transition={activeHand === 'hour' ? { type: "tween", duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }}
                />

                {/* Minute Hand Visual */}
                <motion.div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '4px',
                        height: '110px',
                        background: 'var(--tertiary-accent)',
                        borderRadius: '4px',
                        originY: 1,
                        x: '-50%',
                        y: '-100%',
                        zIndex: 8,
                        boxShadow: '0 0 15px rgba(0,0,0,0.4)'
                    }}
                    animate={{ rotate: minuteDegrees }}
                    transition={activeHand === 'minute' ? { type: "tween", duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }}
                />

                {/* Center Pin */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '14px',
                    height: '14px',
                    background: '#fff',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }} />
            </div>
        </div>
    );
};

export default AnalogClock;
