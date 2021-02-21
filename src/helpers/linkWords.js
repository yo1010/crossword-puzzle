import { WORDS } from "../constants/constants";

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
    const wordToLinkItem = listOfMappedWordItems.find((i) => i.word === wordItem.wordToLink);
    if (wordToLinkItem && wordToLinkItem.isVertical) {
        wordItem.isVertical = false;
        return wordItem
    };

    return wordItem;
};