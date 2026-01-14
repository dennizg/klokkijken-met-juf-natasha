import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};

export const AudioProvider = ({ children }) => {
    const [audioEnabled, setAudioEnabled] = useState(() => {
        const saved = localStorage.getItem('klokkijken_audio_enabled');
        return saved === 'true'; // Default to false
    });

    useEffect(() => {
        localStorage.setItem('klokkijken_audio_enabled', audioEnabled);
    }, [audioEnabled]);

    const speak = useCallback((text, options = {}) => {
        if (!audioEnabled || !text) return;

        // Backward compatibility: if options is boolean, treat as interrupt
        const interrupt = typeof options === 'boolean' ? options : (options.interrupt ?? true);
        const style = options.style || 'neutral'; // 'neutral' | 'enthusiastic'

        // Cancel current speech only if interrupt is allowed/requested
        if (interrupt && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'nl-NL'; // Dutch

        // Determine gender preference: default to 'male' unless 'female' is explicitly requested
        const preferredGender = options.gender || 'male';

        // Helper to find voice based on gender hints
        const findVoice = (gender) => {
            const allVoices = window.speechSynthesis.getVoices().filter(v => v.lang.includes('nl'));

            if (gender === 'female') {
                return allVoices.find(v =>
                    v.name.includes('Google') ||
                    v.name.includes('Female') ||
                    v.name.includes('Fena') ||
                    v.name.includes('Hanna')
                );
            } else {
                // Determine 'male' by looking for specific male names OR checking it's NOT one of the known female ones
                // Windows often has "Microsoft Frank" or "Maarten". 
                // If we can't find a specific male one, we take the first available that isn't clearly female.
                let male = allVoices.find(v =>
                    v.name.includes('Male') ||
                    v.name.includes('Frank') ||
                    v.name.includes('Maarten') ||
                    v.name.includes('Bart')
                );

                if (!male) {
                    // Fallback: try to find one that is NOT the known female ones
                    male = allVoices.find(v =>
                        !v.name.includes('Google') &&
                        !v.name.includes('Female')
                    );
                }
                return male;
            }
        };

        let selectedVoice = findVoice(preferredGender);

        // Final fallback: just any Dutch voice
        if (!selectedVoice) {
            selectedVoice = window.speechSynthesis.getVoices().find(v => v.lang.includes('nl'));
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        if (style === 'enthusiastic') {
            utterance.pitch = 1.2; // Higher pitch
            utterance.rate = 1.1; // Slightly faster/energetic
        } else {
            // Male voice usually sounds better slightly lower/slower? 
            // Let's keep it neutral but clear.
            utterance.pitch = 1.0;
            utterance.rate = 0.95;
        }

        window.speechSynthesis.speak(utterance);
    }, [audioEnabled]);

    const cancel = useCallback(() => {
        window.speechSynthesis.cancel();
    }, []);

    const toggleAudio = useCallback(() => {
        setAudioEnabled(prev => {
            const newState = !prev;
            if (newState) {
                // Manually trigger the "juichen" phrase with explicit female voice
                // We need to bypass the 'audioEnabled' check inside speak because state update is pending
                // So we instantiate utterance directly or use a timeout.
                // Better: just use timeout to safely speak after state settles, OR force it.
                // However, our speak function checks `if (!audioEnabled) return`.
                // Since this runs before the re-render, audioEnabled is still false.
                // We can temporarily force speak or just use raw speech synthesis here for this specific trigger.

                setTimeout(() => {
                    const u = new SpeechSynthesisUtterance("Dus jij wil mij horen juichen?");
                    u.lang = 'nl-NL';

                    // Find female voice manually here similar to findVoice internal logic, or just let 'speak' handle it if we modify it?
                    // Let's use the new speak function but rely on the fact that the Effect hook will update localStorage
                    // We can just call speak() inside the timeout, but we need to reference the function from context... 
                    // Wait, we are inside the context. 'speak' is available.

                    // But 'speak' closes over the *current* audioEnabled (which is false).
                    // We must use a ref or just duplicate the simple speech logic here for robustness.

                    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.includes('nl'));
                    const female = voices.find(v =>
                        v.name.includes('Google') ||
                        v.name.includes('Female') ||
                        v.name.includes('Fena') ||
                        v.name.includes('Hanna')
                    ) || voices.find(v => v.lang.includes('nl')); // fallback

                    if (female) u.voice = female;
                    u.pitch = 1.2;
                    u.rate = 1.1;

                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(u);
                }, 100);

            } else {
                window.speechSynthesis.cancel();
            }
            return newState;
        });
    }, []);

    const value = {
        audioEnabled,
        toggleAudio,
        speak,
        cancel
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};
