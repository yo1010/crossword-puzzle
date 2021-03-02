import Word from "../components/Word";
import { CHAR_WIDTH, START_AXES_Y, START_AXES_X } from "../constants/constants";
import { mapWordCharacters } from "./displayedWordHelpers";

const generateCrossword = (words) => {
    let displayedWords = [];

    const willWordOverlap = (displayProps, displayedWords) => {
        // ----------- FIX OVERLAPPING LOGIC ---------------

        console.log(displayProps)
        if (displayProps.noIntersection) {
            return false;
        }  

        const horizontalWords = displayedWords.filter((displayedWord) => !displayedWord.isVertical);
        const verticalWords = displayedWords.filter((displayedWord) => displayedWord.isVertical);

        if (displayProps.isVertical) {
            //overlapping with horizontal words
            const horizontalOverlapWord = horizontalWords.find((word) => (word.startX <= displayProps.startX <= word.endX) && (displayProps.startY <= word.startY <= displayProps.endY));
            if (horizontalOverlapWord) {
                console.log('VERTICAL OVERLAP', displayProps.word, '-->', horizontalOverlapWord);
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
            const verticalOverlapWord = verticalWords.find((word) => (word.startY <= displayProps.startY <= word.endY) && (displayProps.startX <= word.startX <= displayProps.endX));
            if (verticalOverlapWord) {
                console.log('HORIZONTAL OVERLAP', displayProps.word, '-->', verticalOverlapWord)
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

    const updateUnavailableCharIndexes = (intersectionProps, displayedWords) => {
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

    //DETERMINE THE NEXT X, Y AXES TO DISPLAY WORD
    const getDisplayProps = ({ displayedCharIndex, newCharIndex, notDisplayedWord }, displayedWord) => {
        //HANDLE NOT INTERSECTED WORD
        console.log(displayedWord)
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
            word: notDisplayedWord,
            isVertical: true,
            startY: Y,
            startX: displayedWord.startX + oldCharIndexPixels,
            endY: Y + entireWordPixels
        }
    };

    //FIND THE INDEX OF THE WORD TO INTERSECT ---> FIND THE INDEXES OF CHARACTERS THAT INTERSECT
    const getIntersectionProps = (word, displayedWords) => {
        let newCharIndex;
        let displayedCharIndex;

        console.log(word)

        const displayedWordIndex = displayedWords
            .map(mapWordCharacters)
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

        console.log('final', intersectionProps)
        return intersectionProps;
    };

    const registerDisplayedAndReturnFinalDisplayProps = (word) => {
        const intersectionProps = getIntersectionProps(word, displayedWords);
        console.log(intersectionProps, 'props')
        const displayProps = getDisplayProps(intersectionProps, displayedWords[intersectionProps.displayedWordIndex]);


        const wordsToCheckForOverlap = displayedWords
            .filter((displayedWord) => displayedWord.word !== displayedWords[intersectionProps.displayedWordIndex]?.word);

        console.log(wordsToCheckForOverlap)
        if (willWordOverlap(displayProps, wordsToCheckForOverlap)) {
            console.log('overlap')
        }

        displayedWords = [...updateUnavailableCharIndexes(intersectionProps, displayedWords), {
            word: word,
            unavailableCharIndexes: [intersectionProps.newCharIndex],
            ...displayProps
        }];

        return displayProps;
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
        const displayProps = registerDisplayedAndReturnFinalDisplayProps(word);

        return (
            <Word
                startY={displayProps.startY}
                startX={displayProps.startX}
                word={word}
                isVertical={displayProps.isVertical}
                index={index}
            />
        );
    };

    return words.map(mapWordsOntoCrosswords);
};


export default generateCrossword;