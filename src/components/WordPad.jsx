import React from 'react';
import { motion } from 'framer-motion';
import { Delete, Check } from 'lucide-react';

const WordPad = ({ onAddWord, onDelete, onSubmit, settings }) => {
    // Ordered logically
    const numbers = [
        'een', 'twee', 'drie', 'vier',
        'vijf', 'zes', 'zeven', 'acht',
        'negen', 'tien', 'elf', 'twaalf'
    ];

    const allKeywords = ['voor', 'over', 'kwart', 'half', 'uur'];

    // Filter keywords based on settings
    const keywords = allKeywords.filter(word => {
        if (word === 'uur') return true; // Always needed
        if (word === 'half') return settings.half || settings.five || settings.minutes;
        if (word === 'kwart') return settings.quarter;
        if (word === 'voor' || word === 'over') return settings.quarter || settings.five || settings.minutes;
        return true;
    });

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            {/* Numbers Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
                {numbers.map((word) => (
                    <motion.button
                        key={word}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAddWord(word)}
                        className="glass-button"
                        style={{
                            padding: '10px 15px',
                            fontSize: '0.9rem',
                            flex: '1 0 21%', // roughly 4 per row
                            background: 'rgba(255,255,255,0.08)'
                        }}
                    >
                        {word}
                    </motion.button>
                ))}
            </div>

            {/* Separator/Divider */}
            <div style={{
                height: '1px',
                background: 'rgba(255,255,255,0.1)',
                margin: '10px 20px 20px 20px'
            }} />

            {/* Keywords Grid - Distinct Style */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {keywords.map((word) => (
                    <motion.button
                        key={word}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAddWord(word)}
                        className="glass-button"
                        style={{
                            padding: '10px 15px',
                            fontSize: '0.9rem',
                            flex: '1 0 21%',
                            // Clearly distinct color (soft purple/blue tint) for time words
                            background: 'rgba(120, 100, 255, 0.25)',
                            border: '1px solid rgba(150, 150, 255, 0.3)'
                        }}
                    >
                        {word}
                    </motion.button>
                ))}
            </div>

            {/* Actions Row */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onDelete}
                    className="glass-button"
                    style={{ flex: 1, padding: '15px', background: 'rgba(255,50,50,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                    <Delete size={20} />
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onSubmit}
                    className="glass-button"
                    style={{
                        flex: 3,
                        padding: '15px',
                        background: 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))',
                        color: '#000',
                        fontWeight: 'bold',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                    }}
                >
                    <span>Controleren</span> <Check size={20} />
                </motion.button>
            </div>
        </div >
    );
};

export default WordPad;
