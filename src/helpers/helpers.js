export const mapAvailableCharactersOfWord = (displayedWord) => {
    //if word is unavailable
    if (!displayedWord) {
        return [];
    }

    //MAP displayedWords AND HANDLE ALREADY INTERSECTED CHARACTERS
    const { unavailableCharIndexes, word } = displayedWord;
    if (unavailableCharIndexes.length > 0) {
        const availableChars = [...word].map((char, index) => {
            if (unavailableCharIndexes.includes(index)) {
                return null;
            }

            return char;
        });

        return availableChars;
    }

    return [...word];
};

export const updateUnavailableCharIndexes = (intersectionProps, displayedWords) => {
    return displayedWords.map((word, index) => {
        if (index === intersectionProps.displayedWordIndex) {
            return {
                ...displayedWords[index],
                unavailableCharIndexes: [...new Set([
                    ...displayedWords[index].unavailableCharIndexes,
                    intersectionProps.displayedCharIndex
                ])]
            }
        }

        return word;
    })
};