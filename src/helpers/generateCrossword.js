import Word from "../components/Word";
import { CHAR_WIDTH, START_AXES_Y, START_AXES_X } from "../constants/constants";

const generateCrossword = (words) => {
    let isVertical = true;
    let displayedWords = [];
    let startY = START_AXES_Y;
    let startX = START_AXES_X;

    const willWordOverlap = (displayProps, displayedWords, word) => {
        if (displayProps.noIntersection) {
            return false;
        }  

        const horizontalWords = displayedWords.filter((displayedWord) => !displayedWord.isVertical);
        const verticalWords = displayedWords.filter((displayedWord) => displayedWord.isVertical);

        if (displayProps.isVertical) {
            console.log('horizontal', horizontalWords, displayProps.startX, word);

            //overlapping with horizontal words
            if (horizontalWords.some((word) => (word.startX <= displayProps.startX <= word.endX) && word.startY > displayProps.startY)) {
                return true;
            }


            //overlapping with other vertical words
            if (verticalWords.some((word) => (word.startX === displayProps.startX) && (word.startY <= displayProps.endY <= word.endY))) {
                return true;
            }
        }

        if (!displayProps.isVertical) {

            //overlapping with vertical words
            if (verticalWords.some((word) => (word.startY <= displayProps.startY <= word.endY) && word.startX < displayProps.starX)) {
                return true;
            }

            //overlapping with other horizontal words
            if (horizontalWords.some((word) => (word.startY === displayProps.startY) && (word.startX <= displayProps.endX <= word.endX))) {
                return true;
            }
        }

        return false;
    };

    const updateUnavailableCharIndexes = (intersectionProps) => {
        if (displayedWords[intersectionProps.displayedWordIndex]) {
            displayedWords[intersectionProps.displayedWordIndex] = {
                ...displayedWords[intersectionProps.displayedWordIndex],
                unavailableCharIndexes: [
                    ...displayedWords[intersectionProps.displayedWordIndex].unavailableCharIndexes,
                    intersectionProps.displayedCharIndex
                ]
            }
        }
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

        const { isVertical } = displayedWord;
        console.log(isVertical)

        const newCharIndexPixels = newCharIndex * CHAR_WIDTH;
        const oldCharIndexPixels = displayedCharIndex * CHAR_WIDTH;
        const entireWordPixels = notDisplayedWord.length * CHAR_WIDTH;

        const X = displayedWord.startX - newCharIndexPixels;
        console.log('start X:', X, 'word:', notDisplayedWord, 'word length:', entireWordPixels, 'end X:', X + entireWordPixels)
        if (isVertical) {
            return {
                isVertical: false,
                startY: displayedWord.startY + oldCharIndexPixels,
                startX: X,
                endX: X + entireWordPixels
            }
        }

        const Y = displayedWord.startY - newCharIndexPixels;
        console.log('start Y:', Y, 'word:', notDisplayedWord, 'word length:', entireWordPixels, 'end Y:', Y + entireWordPixels)
        return {
            isVertical: true,
            startY: Y,
            startX: displayedWord.startX + oldCharIndexPixels,
            endY: Y + entireWordPixels
        }
    };

    //FIND THE INDEX OF THE WORD TO INTERSECT ---> FIND THE INDEXES OF CHARACTERS THAT INTERSECT
    const getIntersectionProps = (word) => {
        let newCharIndex;
        let displayedCharIndex;

        //DETERMINE INTERSECTION INDEXES OF WORD AND CHARACTERS
        const displayedWordIndex = displayedWords
            .map((displayedWord) => {
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

                return [...word]
            })
            .findIndex((charArray, index) => {
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

        const intersectionProps = {
            notDisplayedWord: word,
            displayedWordIndex: displayedWordIndex,
            newCharIndex: newCharIndex,
            displayedCharIndex: displayedCharIndex
        };

        //CHECK IF WORD WILL OVERLAP
        if (willWordOverlap(getDisplayProps(intersectionProps, displayedWords[intersectionProps.displayedWordIndex]), displayedWords, word)) {
            updateUnavailableCharIndexes(intersectionProps);
            getIntersectionProps(word);
        };

        return intersectionProps;
    };

    //MAP WORDS AND ADD DISPLAYED WORDS INTO SEPARATE ARRAY
    const mapWordsOntoCrosswords = (word, index) => {
        if (displayedWords.length === 0) {
            //DISPLAY FIRST WORD
            displayedWords = [...displayedWords, {
                word: word,
                isVertical: isVertical,
                startY: startY,
                startX: startX,
                endY: startY + word.length * CHAR_WIDTH,
                unavailableCharIndexes: [] 
            }];
        } else {
            //DETERMINE INTERSECTION + DISPLAY PROPS FOR NEXT ITEMS
            const intersectionProps = getIntersectionProps(word);
            const displayProps = getDisplayProps(intersectionProps, displayedWords[intersectionProps.displayedWordIndex]);

            displayedWords = [...displayedWords, {
                word: word,
                unavailableCharIndexes: [intersectionProps.newCharIndex],
                ...displayProps
            }];

            console.log('props', displayProps, displayedWords)
            updateUnavailableCharIndexes(intersectionProps);

            startY = `${displayProps.startY}px`;
            startX = `${displayProps.startX}px`;
            isVertical = displayProps.isVertical;
        };

        return (
            <Word
                startY={startY}
                startX={startX}
                word={word}
                isVertical={isVertical}
                index={index}
            />
        );
    };

    return words.map(mapWordsOntoCrosswords);
};


export default generateCrossword;