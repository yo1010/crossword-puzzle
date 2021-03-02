import Word from "../components/Word";
import { CHAR_WIDTH, START_AXES_Y, START_AXES_X } from "../constants/constants";

const generateCrossword = (words) => {
    let isVertical = true;
    let displayedWords = [];
    let startY = START_AXES_Y;
    let startX = START_AXES_X;

    const willWordOverlap = (displayProps, displayedWords) => {
        if (displayProps.noIntersection) {
            return false;
        }  

        const horizontalWords = displayedWords.filter((displayedWord) => !displayedWord.isVertical);
        const verticalWords = displayedWords.filter((displayedWord) => displayedWord.isVertical);

        /* console.log("vertical", isVertical, 'v-', verticalWords, 'h-', horizontalWords)
        console.log(displayProps) */
        if (displayProps.isVertical) {
            //overlapping with horizontal words
            if (horizontalWords.some((word) => (word.startX <= displayProps.startX <= word.endX) && (displayProps.startY <= word.startY <= displayProps.endY))) {
                console.log('VERTICAL OVERLAP')
                return true;
            }


            //overlapping with other vertical words

            /* console.log(word.startX, displayProps.startX, (word.startY <= displayProps.endY <= word.endY))
            if (verticalWords.some((word) => (word.startX === displayProps.startX) && (word.startY <= displayProps.endY <= word.endY))) {
                console.log('OVERLAP')
                return true;
            } */
        }

        if (!displayProps.isVertical) {
            //overlapping with vertical words
            if (verticalWords.some((word) => (word.startY <= displayProps.startY <= word.endY) && (displayProps.startX <= word.startX <= displayProps.endX))) {
                console.log('HORIZONTAL OVERLAP')
                return true;
            }

            //overlapping with other horizontal words
            /* if (horizontalWords.some((word) => {
                console.log(word.word, word.startY, displayProps.startY, (word.startX <= displayProps.endX <= word.endX))
                return (word.startY === displayProps.startY) && (word.startX <= displayProps.endX <= word.endX)
            })) {
                console.log('OVERLAP X')
                return true;
            } */
        }

        return false;
    };

    const updateUnavailableCharIndexes = (intersectionProps, words) => {
        return words.map((word, index) => {
            if (index === intersectionProps.displayedWordIndex) {
                return {
                    ...words[index],
                    unavailableCharIndexes: [...new Set([
                        ...words[index].unavailableCharIndexes,
                        intersectionProps.displayedCharIndex
                    ])]
                }
            }
            
            return word;
        })
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

        const newCharIndexPixels = newCharIndex * CHAR_WIDTH;
        const oldCharIndexPixels = displayedCharIndex * CHAR_WIDTH;
        const entireWordPixels = notDisplayedWord.length * CHAR_WIDTH;

        const X = displayedWord.startX - newCharIndexPixels;
        if (isVertical) {
            return {
                isVertical: false,
                startY: displayedWord.startY + oldCharIndexPixels,
                startX: X,
                endX: X + entireWordPixels
            }
        }

        const Y = displayedWord.startY - newCharIndexPixels;
        return {
            isVertical: true,
            startY: Y,
            startX: displayedWord.startX + oldCharIndexPixels,
            endY: Y + entireWordPixels
        }
    };

    //FIND THE INDEX OF THE WORD TO INTERSECT ---> FIND THE INDEXES OF CHARACTERS THAT INTERSECT
    const getIntersectionProps = (word, unavailableWords=[]) => {
        let newCharIndex;
        let displayedCharIndex;

        console.log('filtered', displayedWords
        .map((displayedWord) => {
            if(unavailableWords.some((word) => word.word === displayedWord.word)) {
                return null;
            }

            return displayedWord;
        }))
        const displayedWordIndex = displayedWords
            .map((displayedWord) => {
                if(unavailableWords.some((word) => word.word === displayedWord.word)) {
                    return null;
                }

                return displayedWord;
            })
            .map((displayedWord) => {
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

                return [...word]
            })
            .findIndex((charArray) => {
                console.log(charArray)
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

        console.log(displayedWordIndex)
        const intersectionProps = {
            notDisplayedWord: word,
            displayedWordIndex: displayedWordIndex,
            newCharIndex: newCharIndex,
            displayedCharIndex: displayedCharIndex
        };

        //CHECK IF WORD WILL OVERLAP
        console.log('WORD CHECKED:', word, 'TO LINK:', displayedWords[intersectionProps.displayedWordIndex])

        const wordsToCheck = displayedWords.filter((displayedWord) => displayedWord.word !== displayedWords[intersectionProps.displayedWordIndex]?.word);
        console.log('to check', wordsToCheck)
        if (willWordOverlap(getDisplayProps(intersectionProps, displayedWords[intersectionProps.displayedWordIndex]), wordsToCheck)) {
            console.log('overlapped')
            unavailableWords = [...unavailableWords, displayedWords[intersectionProps.displayedWordIndex]];
            getIntersectionProps(word, unavailableWords);
        };

        console.log('final', intersectionProps)
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
                unavailableCharIndexes: [],
                unavailableWords: []
            }];
        } else {
            //DETERMINE INTERSECTION + DISPLAY PROPS FOR NEXT ITEMS
            const intersectionProps = getIntersectionProps(word);
            const displayProps = getDisplayProps(intersectionProps, displayedWords[intersectionProps.displayedWordIndex]);

            displayedWords = [...updateUnavailableCharIndexes(intersectionProps, displayedWords), {
                word: word,
                unavailableCharIndexes: [intersectionProps.newCharIndex],
                ...displayProps
            }];

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