import React from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';

const Numpad = ({ onInput, onDelete, onSubmit }) => {
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, ':', 0];

    return (
        <div className="numpad-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', maxWidth: '300px', margin: '0 auto' }}>
            {keys.map((key) => (
                <motion.button
                    key={key}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onInput(key)}
                    className="glass-button numpad-button"
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        padding: '15px 0',
                        background: 'rgba(255,255,255,0.05)'
                    }}
                >
                    {key}
                </motion.button>
            ))}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="glass-button numpad-button"
                style={{
                    fontSize: '1.5rem',
                    padding: '15px 0',
                    color: 'var(--secondary-accent)',
                    background: 'rgba(255,50,50,0.1)'
                }}
            >
                <Delete />
            </motion.button>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onSubmit}
                className="glass-button numpad-submit"
                style={{
                    gridColumn: '1 / -1',
                    background: 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))',
                    color: '#000',
                    fontWeight: 'bold',
                    padding: '15px',
                    marginTop: '10px'
                }}
            >
                Antwoord Controleren
            </motion.button>
        </div>
    );
};

export default Numpad;
