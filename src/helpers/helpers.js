import { CHAR_WIDTH, WORDS } from "../constants/constants";

export const mapLinkedWords = (word, index) => {
    const linkedWord = WORDS
        .filter(item => item !== word)
        .find((item) => item.includes(word.charAt(0)));

    return {
        word: word,
        wordToLink: linkedWord,
        charToLink: linkedWord && linkedWord.indexOf(word.charAt(0)),
        isVertical: index % 2 === 0
    };
};

export const mapOrientationOfWords = (wordItem, index, listOfMappedWordItems) => {
    wordItem.isVertical = getIsWordVertical(wordItem, listOfMappedWordItems);
    return wordItem;
};

export const getIsWordVertical = (wordItem, listOfMappedWordItems) => {
    const wordToLinkItem = listOfMappedWordItems.find((i) => i.word === wordItem.wordToLink);
    
    if (wordToLinkItem && wordToLinkItem.isVertical) {
        return false;
    };

    return true;
};

export const calculatePositionForWord = (word, wordToLink, isVertical, sortedListOfItems) => {
    if (wordToLink) {
        const wordIndex = sortedListOfItems.findIndex((i) => i.word === word);
        const wordToLinkIndex = sortedListOfItems.findIndex((i) => i.word === wordToLink);

        const pointers = wordIndex > wordToLinkIndex ? { first: wordToLinkIndex, last: wordIndex } : { first: wordIndex, last: wordToLinkIndex };
        const itemsInBetween = sortedListOfItems.slice(pointers.first, pointers.last);

        const overallLength = getOverallDifferenceInPixels(itemsInBetween, isVertical);

        return overallLength;
    };
};

const getOverallDifferenceInPixels = (itemsInBetween, isVertical) => {
    const overallLength = itemsInBetween.reduce((acc, current) => {
        console.log(current);
        const charToLink = current.charToLink ? current.charToLink : 0;
        console.log(charToLink)
        const wordLength = current.word.length * CHAR_WIDTH + (charToLink * CHAR_WIDTH);

        if (isVertical) {
            return current.isVertical ? acc + wordLength : acc + CHAR_WIDTH;
        };

        return current.isVertical ? acc + CHAR_WIDTH : acc + wordLength;
    }, 0);

    console.log(overallLength);
    return overallLength;
};