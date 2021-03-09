import Word from "../components/Word";
import { CHAR_WIDTH, START_AXES_Y, START_AXES_X } from "../constants/constants";
import { mapAvailableCharactersOfWord, updateUnavailableCharIndexes } from "./helpers";

const generateCrossword = (words) => {
    let displayedWords = [];

    const shouldNotDisplay = (displayProps, displayedWords) => {
        //NO AVAILABLE INTERSECTION
        if (displayProps.noIntersection) {
            return false;
        }

        const displayedHorizontalWords = displayedWords.filter((displayedWord) => !displayedWord.isVertical);
        const displayedVerticalWords = displayedWords.filter((displayedWord) => displayedWord.isVertical);
        //VERTICAL WORD OVERLAPPING
        if (displayProps.isVertical) {

            //OVERLAPPING WITH HORIZONTAL WORDS
            if (displayedHorizontalWords.some((word) => {
                const isBetweenXAxes = (word.startX <= displayProps.startX + CHAR_WIDTH) && (displayProps.startX < word.endX + CHAR_WIDTH);
                const isAroundYAxes =(word.startY >= displayProps.startY) && (word.startY <= displayProps.endY);

                return isBetweenXAxes && isAroundYAxes;
            })) {
                return true;
            }

            //OVERLAPPING WITH VERTICAL WORDS
            if (displayedVerticalWords.some((word) => {
                const isSameXOrNextToX = (word.startX === displayProps.startX) || (word.startX - displayProps.startX === CHAR_WIDTH) || (word.startX - displayProps.startX === -CHAR_WIDTH);
                const isStartInBetween = (word.startY <= displayProps.endY) && (word.startY >= displayProps.startY);
                const isEndInBetween = (word.endY <= displayProps.endY) && (word.endY >= displayProps.startY);
                const isDisplayWordStartInBetween = (displayProps.startY <= word.endY) && (displayProps.startY >= word.startY);
                const isDisplayWordEndInBetween = (displayProps.endY <= word.endY) && (displayProps.endY >= word.startY);

                return isSameXOrNextToX && ((isStartInBetween || isEndInBetween) || (isDisplayWordEndInBetween || isDisplayWordStartInBetween));
            }))
            {
                return true;
            }

            return false;
        }

        //HORIZONTAL WORD OVERLAPPING
        if (!displayProps.isVertical) {
            //OVERLAPPING WITH VERTICAL WORDS
            if (displayedVerticalWords.some((word) => {
                const isBetweenYAxes = (word.startY <= displayProps.startY + CHAR_WIDTH) && (displayProps.startY < word.endY + CHAR_WIDTH);
                const isAroundXAxes = (displayProps.startX <= word.startX) && (word.startX <= displayProps.endX);

                return isBetweenYAxes && isAroundXAxes;
            })) {
                return true;
            }

            //OVERLAPPING WITH HORIZONTAL WORDS
            if (displayedHorizontalWords.some((word) => {
                const isSameYOrNextToY = (word.startY === displayProps.startY) || (word.startY - displayProps.startY === CHAR_WIDTH) || (word.startY - displayProps.startY === -CHAR_WIDTH);
                const isStartInBetween = (word.startX <= displayProps.endX) && (word.startX >= displayProps.startX);
                const isEndInBetween = (word.endX <= displayProps.endX) && (word.endX >= displayProps.startX);
                const isDisplayWordStartInBetween = (displayProps.startX <= word.endX) && (displayProps.startX >= word.startX);
                const isDisplayWordEndInBetween = (displayProps.endX <= word.endX) && (displayProps.endX >= word.startX);

                return isSameYOrNextToY && ((isStartInBetween || isEndInBetween) || (isDisplayWordEndInBetween || isDisplayWordStartInBetween));
            }))
            {
                return true;
            }

            return false;
        }

        return false;
    };

    //DETERMINE THE NEXT X, Y AXES TO DISPLAY WORD
    const getDisplayProps = ({ displayedCharIndex, newCharIndex, notDisplayedWord }, displayedWord) => {
        //HANDLE NOT INTERSECTED WORD
        if (!displayedWord) {
            return {
                isVertical: false,
                startY: 0,
                startX: 0,
                noIntersection: true
            }
        }

        const newCharIndexPixels = newCharIndex * CHAR_WIDTH;
        const oldCharIndexPixels = displayedCharIndex * CHAR_WIDTH;
        const entireWordPixels = notDisplayedWord.length * CHAR_WIDTH;

        if (displayedWord.isVertical) {
            const X = displayedWord.startX - newCharIndexPixels;
            return {
                displayedWord: displayedWord,
                word: notDisplayedWord,
                isVertical: false,
                startY: displayedWord.startY + oldCharIndexPixels,
                startX: X,
                endX: X + entireWordPixels
            }
        }


        const Y = displayedWord.startY - newCharIndexPixels;
        return {
            displayedWord: displayedWord,
            word: notDisplayedWord,
            isVertical: true,
            startY: Y,
            startX: displayedWord.startX + oldCharIndexPixels,
            endY: Y + entireWordPixels
        }
    };

    //FIND THE INDEX OF THE WORD TO INTERSECT ---> FIND THE INDEXES OF CHARACTERS THAT INTERSECT
    const getIntersectionProps = (word, passedWords) => {
        let newCharIndex;
        let displayedCharIndex;

        const displayedWordIndex = passedWords
            .map(mapAvailableCharactersOfWord)
            .findIndex((charArray) => {
                //FIND DISPLAYED WORD TO INTERSECT WITH AND THE CHARACTERS THAT INTERSECT
                const isCharacterInWord = charArray.some((char, index) => {
                    if (word.includes(char)) {
                        displayedCharIndex = index;
                        newCharIndex = word.indexOf(char);
                    }

                    return word.includes(char);
                });

                return isCharacterInWord;
            });

        return {
            notDisplayedWord: word,
            displayedWordIndex: displayedWordIndex,
            newCharIndex: newCharIndex,
            displayedCharIndex: displayedCharIndex
        };
    };

    const registerDisplayedWords = (word, intersectionProps, displayProps) => {
        console.log('registered')
        displayedWords = [...updateUnavailableCharIndexes(intersectionProps, displayedWords), {
            word: word,
            unavailableCharIndexes: [intersectionProps.newCharIndex],
            ...displayProps
        }];
    }

    const getFinalProps = (word, availableWords) => {
        const intersectionProps = getIntersectionProps(word, availableWords);

        const displayProps = getDisplayProps(intersectionProps, availableWords[intersectionProps.displayedWordIndex]);

        const wordsToCheckForOverlap = availableWords
            .filter((displayedWord) => displayedWord.word !== availableWords[intersectionProps.displayedWordIndex]?.word);

        //IF OVERLAPPING GET NEXT PROPS
        if (shouldNotDisplay(displayProps, wordsToCheckForOverlap)) {
            return getFinalProps(word, updateUnavailableCharIndexes(intersectionProps, availableWords));
        }

        return {
            displayProps: displayProps,
            intersectionProps: intersectionProps
        };
    }

    //MAP WORDS AND ADD DISPLAYED WORDS INTO SEPARATE ARRAY
    const mapWordsOntoCrosswords = (word, index) => {
        if (displayedWords.length === 0) {
            //DISPLAY FIRST WORD
            displayedWords = [...displayedWords, {
                word: word,
                isVertical: true,
                startY: START_AXES_Y,
                startX: START_AXES_X,
                endY: START_AXES_Y + word.length * CHAR_WIDTH,
                unavailableCharIndexes: [],
                unavailableWords: []
            }];

            return (
                <Word
                    startY={START_AXES_Y}
                    startX={START_AXES_X}
                    word={word}
                    isVertical={true}
                    index={index}
                />
            );
        }

        //DETERMINE INTERSECTION + DISPLAY PROPS FOR NEXT ITEMS
        const props = getFinalProps(word, displayedWords);

        //SIDE EFFECT - REGISTER DISPLAYED WORDS
        if (!props.displayProps.noIntersection) {
            registerDisplayedWords(word, props.intersectionProps, props.displayProps);
        }

        return (
            <Word
                startY={props.displayProps.startY}
                startX={props.displayProps.startX}
                word={word}
                isVertical={props.displayProps.isVertical}
                index={index}
            />
        );
    };

    return words.map(mapWordsOntoCrosswords);
};


export default generateCrossword;