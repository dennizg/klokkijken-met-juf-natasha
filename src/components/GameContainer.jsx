import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnalogClock from './AnalogClock';
import DigitalDisplay from './DigitalDisplay';
import Numpad from './Numpad';
import WordPad from './WordPad';
import { generateRandomTime, formatTime } from '../utils/timeGenerator';
import { getDutchTimeText } from '../utils/dutchTimeUtils';
import confetti from 'canvas-confetti';

// Import raw CSV content
import complimentsCSV from '../data/TableCompliments_Images.csv?raw';
import encouragementsCSV from '../data/TableEncouragements_Images.csv?raw';
import { parseFeedbackCSV } from '../utils/csvLoader';

// Eagerly load all png images from assets
const complimentImages = import.meta.glob('../assets/compliments/*.png', { eager: true });
const encouragementImages = import.meta.glob('../assets/encouragements/*.png', { eager: true });

const GameContainer = ({ onExit, settings }) => {
    const [targetTime, setTargetTime] = useState({ hours: 10, minutes: 10 });
    const [userInput, setUserInput] = useState('');
    const [userWords, setUserWords] = useState([]); // For word mode
    const [userHands, setUserHands] = useState({ hours: 12, minutes: 0 }); // For reverse mode
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [hasError, setHasError] = useState(false); // Track if last attempt was wrong
    const [correctCount, setCorrectCount] = useState(0);
    const [overlayType, setOverlayType] = useState('none'); // 'none' | 'success' | 'calm'
    const [overlayContent, setOverlayContent] = useState(null); // { text, imageSrc }

    // Parse CSVs once on mount
    const complimentsData = useMemo(() => parseFeedbackCSV(complimentsCSV), []);
    const encouragementsData = useMemo(() => parseFeedbackCSV(encouragementsCSV), []);

    // Determine config from settings
    const inputMode = settings.inputMode || 'digital'; // 'digital' | 'text'
    const direction = settings.direction || 'analogue-to-input'; // 'analogue-to-input' | 'input-to-analogue'

    useEffect(() => {
        // Only generate new question on mount or settings change if not in encouragement mode
        if (overlayType === 'none') {
            newQuestion();
        }
    }, [inputMode, direction, overlayType]); // Reset if mode changes

    const newQuestion = () => {
        // Filter keys where settings[key] is true, excluding non-difficulty keys
        const difficultyKeys = ['hours', 'half', 'quarter', 'five', 'minutes'];
        const activeModes = difficultyKeys.filter(k => settings[k]);

        const newTime = generateRandomTime(activeModes, settings.use24Hour);
        setTargetTime(newTime);
        setUserInput('');
        setUserWords([]);
        setUserHands({ hours: 12, minutes: 0 });
        setFeedback('');
        setShowConfetti(false);
        setAttempts(0);
        setHasError(false);
    };

    const handleInput = (val) => {
        // Reset state if we had an error
        let current = userInput;
        if (hasError) {
            current = '';
            setHasError(false);
            setFeedback('');
        }

        // Handle colon explicit input
        if (val === ':') {
            if (current.includes(':')) return;
            setUserInput(current + val);
            return;
        }

        // Build the raw string of digits
        const rawCurrent = current.replace(/:/g, '');
        const rawNew = rawCurrent + val;

        // Max raw length is 4 digits (HHMM)
        if (rawNew.length > 4) return;

        // Validation / Formatting Logic
        const maxH = settings.use24Hour ? 23 : 12;
        let formatted = rawNew;

        if (rawNew.length === 2) {
            const valInt = parseInt(rawNew);
            if (valInt > maxH) {
                // e.g. 13 in 12h mode -> 1:3
                formatted = rawNew[0] + ':' + rawNew[1];
            }
        } else if (rawNew.length === 3) {
            const d1d2 = parseInt(rawNew.substring(0, 2));
            const d3 = parseInt(rawNew[2]);
            const d2d3 = rawNew.substring(1, 3);

            // Logic priority:
            // 1. If HH > maxHour -> H:MM (e.g. 135 -> 1:35)
            if (d1d2 > maxH) {
                formatted = rawNew[0] + ':' + rawNew.substring(1);
            }
            // 2. Special case: "X00" -> X:00 (e.g. 100 -> 1:00)
            else if (d2d3 === '00') {
                formatted = rawNew[0] + ':' + rawNew.substring(1);
            }
            // 3. If 3rd digit > 5, it CANNOT be the start of minutes if we split at 2 (e.g. 106)
            //    So 10:6 is invalid, must be 1:06
            else if (d3 > 5) {
                formatted = rawNew[0] + ':' + rawNew.substring(1);
            }
            // 4. Default preference: HH:M (e.g. 101 -> 10:1)
            else {
                formatted = rawNew.substring(0, 2) + ':' + rawNew.substring(2);
            }
        } else if (rawNew.length === 4) {
            // Always HH:MM
            formatted = rawNew.substring(0, 2) + ':' + rawNew.substring(2);
        }

        setUserInput(formatted);
    };

    const handleWordInput = (word) => {
        if (hasError) {
            setUserWords([word]);
            setHasError(false);
            setFeedback(''); // Clear feedback immediately on new input
        } else {
            setUserWords([...userWords, word]);
        }
    };

    const handleHandChange = (hands) => {
        setUserHands(hands);
    };

    const handleDelete = () => {
        setHasError(false); // If they manually delete, also clear error state
        setFeedback('');

        if (inputMode === 'digital') {
            setUserInput(userInput.slice(0, -1));
        } else {
            setUserWords(userWords.slice(0, -1));
        }
    };

    const handleOverlayClick = () => {
        if (overlayType === 'success') {
            newQuestion();
        }
        // If 'calm', we just dismiss overlay and let them try again (do NOT generate new question)
        setOverlayType('none');
    };

    const handleSubmit = () => {
        let isCorrect = false;

        if (direction === 'analogue-to-input') {
            if (inputMode === 'digital') {
                const correctH = targetTime.hours;
                const correctM = targetTime.minutes;
                const parts = userInput.split(':');
                if (parts.length === 2) {
                    const inputH = parseInt(parts[0]);
                    const inputM = parseInt(parts[1]);

                    // Fix: Check modulo 12 to allow both 6:15 and 18:15 since analog clock has no AM/PM
                    const normInputH = inputH % 12;
                    const normCorrectH = correctH % 12;

                    if (normInputH === normCorrectH && inputM === correctM) isCorrect = true;
                }
            } else {
                const correctText = getDutchTimeText(targetTime.hours, targetTime.minutes);
                const userSentence = userWords.join(' ');
                // Loose check (case insensitive, trimmed)
                if (userSentence.toLowerCase().trim() === correctText.toLowerCase().trim()) isCorrect = true;
            }
        } else {
            // Direction: input-to-analogue (Set the hands)
            const targetH = (targetTime.hours % 12) || 12;
            const targetM = targetTime.minutes;

            // Check hands (allow some small errors in hour hand rotation if we were doing continuous, 
            // but since we snap to integers in AnalogClock, we check exact match)
            if (userHands.hours === targetH && userHands.minutes === targetM) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            setFeedback('correct');

            let points = 1;
            if (attempts === 0) points = 10;
            else if (attempts === 1) points = 5;

            setScore(s => s + points);

            const newCorrectCount = correctCount + 1;
            setCorrectCount(newCorrectCount);

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });


            if (newCorrectCount > 0 && newCorrectCount % 5 === 0) {
                // Determine content before showing overlay
                const pick = complimentsData[Math.floor(Math.random() * complimentsData.length)];
                if (pick) {
                    const imageKey = `../assets/compliments/${pick.imageId}.png`;
                    const imageMod = complimentImages[imageKey];
                    setOverlayContent({
                        text: pick.text,
                        imageSrc: imageMod?.default || null // Handle missing image gracefully
                    });
                }

                setTimeout(() => {
                    setOverlayType('success');
                }, 1000);
            } else {
                setTimeout(newQuestion, 2000);
            }

        } else {
            setFeedback('incorrect');
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setHasError(true);

            if (newAttempts === 3) {
                // Determine content
                const pick = encouragementsData[Math.floor(Math.random() * encouragementsData.length)];
                if (pick) {
                    const imageKey = `../assets/encouragements/${pick.imageId}.png`;
                    const imageMod = encouragementImages[imageKey];
                    setOverlayContent({
                        text: pick.text,
                        imageSrc: imageMod?.default || null
                    });
                }

                setTimeout(() => {
                    setOverlayType('calm');
                }, 1000);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
        >
            <AnimatePresence>
                {overlayType !== 'none' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleOverlayClick}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            zIndex: 100,
                            // Dynamic background based on type
                            background: overlayType === 'success'
                                ? 'radial-gradient(circle at center, rgba(76, 29, 149, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%)'
                                : 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', // Calm blue for 'calm'
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: overlayType === 'success' ? '0 0 50px rgba(139, 92, 246, 0.3)' : '0 0 50px rgba(56, 189, 248, 0.2)'
                        }}
                    >
                        <motion.div
                            animate={overlayType === 'success' ? {
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            } : {
                                y: [0, -10, 0], // Gentle float
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                marginBottom: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            {/* Image from CSV */}
                            {overlayContent?.imageSrc ? (
                                <img
                                    src={overlayContent.imageSrc}
                                    alt="Feedback"
                                    style={{
                                        height: '200px',
                                        width: 'auto',
                                        objectFit: 'contain',
                                        marginBottom: '20px',
                                        filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))'
                                    }}
                                />
                            ) : (
                                <div style={{ fontSize: '6rem', marginBottom: '20px' }}>
                                    {overlayType === 'success' ? '🌟' : '🐢'}
                                </div>
                            )}
                        </motion.div>

                        <h2 style={{
                            fontSize: overlayType === 'success' ? '2.5rem' : '2rem',
                            textAlign: 'center',
                            marginBottom: '30px',
                            color: overlayType === 'success' ? '#fbbf24' : '#38bdf8', // Amber or Light Blue
                            textShadow: '0 0 20px rgba(0,0,0,0.5)',
                            fontWeight: 'bold',
                            padding: '0 20px',
                            maxWidth: '80%'
                        }}>
                            {/* Text from CSV or fallback */}
                            {overlayContent?.text || (overlayType === 'success' ? `Goed bezig, ${settings.playerName}!` : 'Rustig aan, denk goed na!')}
                        </h2>

                        <motion.p
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ color: 'white', fontSize: '1.2rem', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '30px' }}
                        >
                            Tik om verder te gaan
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, position: 'relative' }}>
                <button
                    onClick={() => onExit(score)}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        color: 'white',
                        opacity: 0.8,
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    ← Stop
                </button>
                <div className="glass-panel" style={{ padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                    {settings.playerName}: <span style={{ color: 'var(--primary-accent)', fontWeight: 'bold' }}>{score}</span>
                </div>
            </div>

            <h2 style={{ textAlign: 'center', fontWeight: '400', marginBottom: '10px' }}>
                {direction === 'analogue-to-input'
                    ? (inputMode === 'digital' ? 'Hoe laat is het?' : 'Schrijf in woorden:')
                    : 'Zet de wijzers goed:'}
            </h2>

            {/* Target Display if in Reverse Mode */}
            {direction === 'input-to-analogue' && (
                <div style={{ margin: '10px 0' }}>
                    {inputMode === 'digital' ? (
                        <DigitalDisplay timeStr={formatTime(targetTime.hours, targetTime.minutes)} />
                    ) : (
                        <div className="glass-panel" style={{ padding: '15px 20px', textAlign: 'center', fontSize: '1.2rem', color: 'var(--tertiary-accent)' }}>
                            {getDutchTimeText(targetTime.hours, targetTime.minutes)}
                        </div>
                    )}
                </div>
            )}

            <AnalogClock
                hours={direction === 'analogue-to-input' ? targetTime.hours : userHands.hours}
                minutes={direction === 'analogue-to-input' ? targetTime.minutes : userHands.minutes}
                interactive={direction === 'input-to-analogue'}
                onChange={handleHandChange}
            />

            {/* User Input Display if in Normal Mode */}
            {direction === 'analogue-to-input' && (
                <div style={{ margin: '20px 0', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {inputMode === 'digital' ? (
                        <DigitalDisplay timeStr={userInput || "--:--"} />
                    ) : (
                        <div className="glass-panel" style={{ padding: '15px 20px', minWidth: '200px', textAlign: 'center', fontSize: '1.2rem', color: 'var(--tertiary-accent)' }}>
                            {userWords.length > 0 ? userWords.join(' ') : <span style={{ opacity: 0.5 }}>...</span>}
                        </div>
                    )}
                </div>
            )}

            {/* Feedback Message */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        style={{ color: feedback === 'correct' ? '#4bffb5' : '#ff4b4b', fontWeight: 'bold', height: '20px' }}
                    >
                        {feedback === 'correct' ? 'Goed gedaan!' : 'Probeer het nog eens!'}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Components */}
            {direction === 'analogue-to-input' ? (
                inputMode === 'digital' ? (
                    <Numpad onInput={handleInput} onDelete={handleDelete} onSubmit={handleSubmit} />
                ) : (
                    <WordPad onAddWord={handleWordInput} onDelete={handleDelete} onSubmit={handleSubmit} settings={settings} />
                )
            ) : (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    className="glass-button"
                    style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '18px',
                        background: 'linear-gradient(to right, var(--primary-accent), var(--secondary-accent))',
                        color: '#000',
                        fontWeight: '800',
                        fontSize: '1.2rem',
                        marginTop: '20px'
                    }}
                >
                    Controleer Wijzers
                </motion.button>
            )}

        </motion.div>
    );
};

export default GameContainer;
