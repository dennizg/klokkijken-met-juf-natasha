import React from 'react';

const DigitalDisplay = ({ timeStr }) => {
    return (
        <div
            className="glass-panel"
            style={{
                padding: '10px 30px',
                display: 'inline-block',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <span style={{
                fontFamily: 'monospace',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: 'var(--tertiary-accent)',
                textShadow: '0 0 10px rgba(0, 210, 255, 0.5)'
            }}>
                {timeStr}
            </span>
        </div>
    );
};

export default DigitalDisplay;
