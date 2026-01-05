export const numbersAsWords = {
    1: 'een', 2: 'twee', 3: 'drie', 4: 'vier', 5: 'vijf',
    6: 'zes', 7: 'zeven', 8: 'acht', 9: 'negen', 10: 'tien',
    11: 'elf', 12: 'twaalf'
};

export const getDutchTimeText = (hours, minutes) => {
    // Normalize hours to 1-12
    const h12 = hours === 0 || hours === 12 ? 12 : hours % 12;
    const nextH = (h12 % 12) + 1;
    const hText = numbersAsWords[h12];
    const nextHText = numbersAsWords[nextH];

    if (minutes === 0) {
        return `${hText} uur`;
    }

    if (minutes === 15) {
        return `kwart over ${hText}`;
    }

    if (minutes === 30) {
        return `half ${nextHText}`;
    }

    if (minutes === 45) {
        return `kwart voor ${nextHText}`;
    }

    // 1-14 minutes: 'X over H'
    if (minutes > 0 && minutes < 15) {
        return `${numbersAsWords[minutes] || minutes} over ${hText}`;
    }

    // 16-29 minutes: '...'
    // 20: tien voor half (H+1)
    // 25: vijf voor half (H+1)
    if (minutes > 15 && minutes < 30) {
        const minDiff = 30 - minutes;
        return `${numbersAsWords[minDiff]} voor half ${nextHText}`;
    }

    // 31-44 minutes: '...'
    // 35: vijf over half (H+1)
    // 40: tien over half (H+1)
    if (minutes > 30 && minutes < 45) {
        const minDiff = minutes - 30;
        return `${numbersAsWords[minDiff]} over half ${nextHText}`;
    }

    // 46-59 minutes: '... voor (H+1)'
    if (minutes > 45) {
        const minDiff = 60 - minutes;
        return `${numbersAsWords[minDiff]} voor ${nextHText}`;
    }

    return "ongeldige tijd";
};
