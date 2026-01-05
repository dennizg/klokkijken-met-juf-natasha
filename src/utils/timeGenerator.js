/**
 * Generates a random time object { hours, minutes }
 * @param {string[]} validModes - Array of active modes: ['hours', 'half', 'quarter', 'five', 'minutes']
 * @param {boolean} use24Hour - If true, generates hours up to 23
 */
export const generateRandomTime = (validModes = ['minutes'], use24Hour = false) => {
    // If no modes provided or empty, default to minutes (hardest) in original code, 
    // but let's default to 'hours' (easiest) if nothing selected to avoid crash.
    if (!validModes || validModes.length === 0) validModes = ['hours'];

    const mode = validModes[Math.floor(Math.random() * validModes.length)];

    let h = 0;
    if (use24Hour) {
        h = Math.floor(Math.random() * 24); // 0-23
    } else {
        h = Math.floor(Math.random() * 12); // 0-11
        if (h === 0) h = 12; // 12-hour clock
    }

    let m = 0;

    switch (mode) {
        case 'hours':
            m = 0;
            break;
        case 'half':
            // Actually 'half' usually implies XX:30. Mixed with hours it provides variety.
            // But strictly asking for "Halve uren" usually means 1:30, 2:30. 
            // If we select 'half' mode, let's force 30 to ensure we practice it.
            m = 30;
            break;
        case 'quarter':
            // 15 or 45
            m = Math.random() < 0.5 ? 15 : 45;
            break;
        case 'five':
            // Multiples of 5
            m = Math.floor(Math.random() * 12) * 5;
            break;
        case 'minutes':
        default:
            m = Math.floor(Math.random() * 60);
            break;
    }

    return { hours: h, minutes: m };
};

export const formatTime = (h, m) => {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}`;
};
