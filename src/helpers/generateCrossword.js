import Word from "../components/Word";
import { CHAR_WIDTH, START_AXES_Y, START_AXES_X } from "../constants/constants";
import { mapWordCharacters, updateUnavailableCharIndexes } from "./helpers";

const generateCrossword = (words) => {
    let displayedWords = [];

    const shouldNotDisplay = (displayProps, displayedWords) => {
        // ----------- FIX OVERLAPPING LOGIC FOR SAME ORIENTATION ITEMS ---------------

        //NO AVAILABLE INTERSECTION
        if (displayProps.noIntersection) {
            console.log('NO INTERSECTION')
            return false;
        }

        const horizontalWords = displayedWords.filter((displayedWord) => !displayedWord.isVertical);
        const verticalWords = displayedWords.filter((displayedWord) => displayedWord.isVertical);
        //VERTICAL WORD OVERLAPPING
        if (displayProps.isVertical) {

            //OVERLAPPING WITH HORIZONTAL WORDS
            const horizontalOverlapWord = horizontalWords.find((word) => {
                const isBetweenXAxes = (word.startX <= displayProps.startX) && (displayProps.startX < word.endX);
                const isAroundYAxes =(word.startY >= displayProps.startY) && (word.startY <= displayProps.endY);

                console.log('y', word.startY > displayProps.startY)

                console.log(displayProps.startY, '-->', word.startY)

                return isBetweenXAxes && isAroundYAxes;
            });

            if (horizontalOverlapWord) {
                console.log('VERTICAL OVERLAP', displayProps.word, '-->', horizontalOverlapWord);
                return true;
            }

            //OVERLAPPING WITH VERTICAL WORDS
            if (verticalWords.some((word) => {
                const isSameXOrNextToX = (word.startX === displayProps.startX) || (word.startX - displayProps.startX === 20) || (word.startX - displayProps.startX === -20);
                const isStartInBetween = (word.startY <= displayProps.endY) && (word.startY >= displayProps.startY);
                const isEndInBetween = (word.endY <= displayProps.endY) && (word.endY >= displayProps.startY);
                const isDisplayWordStartInBetween = (displayProps.startY <= word.endY) && (displayProps.startY >= word.startY);
                const isDisplayWordEndInBetween = (displayProps.endY <= word.endY) && (displayProps.endY >= word.startY);

                console.log(isSameXOrNextToX, isStartInBetween, isEndInBetween,isDisplayWordEndInBetween, isDisplayWordStartInBetween, word, displayProps);
                return isSameXOrNextToX && ((isStartInBetween || isEndInBetween) || (isDisplayWordEndInBetween || isDisplayWordStartInBetween));
            }))
            {
                console.log('OVERLAP')
                return true;
            }

            return false;
        }

        //HORIZONTAL WORD OVERLAPPING
        if (!displayProps.isVertical) {
            //OVERLAPPING WITH VERTICAL WORDS
            const verticalOverlapWord = verticalWords.find((word) => {
                const isBetweenYAxes = (word.startY <= displayProps.startY) && (displayProps.startY < word.endY);
                const isAroundXAxes = (displayProps.startX <= word.startX) && (word.startX <= displayProps.endX);

                return isBetweenYAxes && isAroundXAxes;
            });

            if (verticalOverlapWord) {
                console.log('HORIZONTAL OVERLAP', displayProps.word, '-->', verticalOverlapWord)
                return true;
            }

            console.log('horizontal', displayProps, horizontalWords, displayedWords)
            //OVERLAPPING WITH HORIZONTAL WORDS
            if (horizontalWords.some((word) => {
                const isSameYOrNextToY = (word.startY === displayProps.startY) || (word.startY - displayProps.startY === 20) || (word.startY - displayProps.startY === -20);
                const isStartInBetween = (word.startX <= displayProps.endX) && (word.startX >= displayProps.startX);
                const isEndInBetween = (word.endX <= displayProps.endX) && (word.endX >= displayProps.startX);
                const isDisplayWordStartInBetween = (displayProps.startX <= word.endX) && (displayProps.startX >= word.startX);
                const isDisplayWordEndInBetween = (displayProps.endX <= word.endX) && (displayProps.endX >= word.startX);

                console.log(isSameYOrNextToY, isStartInBetween, isEndInBetween,isDisplayWordEndInBetween, isDisplayWordStartInBetween, word, displayProps);
                return isSameYOrNextToY && ((isStartInBetween || isEndInBetween) || (isDisplayWordEndInBetween || isDisplayWordStartInBetween));
            }))
            {
                console.log('OVERLAP X')
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
            .map(mapWordCharacters)
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

        const intersectionProps = {
            notDisplayedWord: word,
            displayedWordIndex: displayedWordIndex,
            newCharIndex: newCharIndex,
            displayedCharIndex: displayedCharIndex
        };

        //CHECK IF WORD WILL OVERLAP
        console.log('WORD CHECKED:', word, 'TO LINK:', passedWords[intersectionProps.displayedWordIndex])

        return intersectionProps;
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
        console.log('AVAILABLE WORDS', availableWords)
        const displayProps = getDisplayProps(intersectionProps, availableWords[intersectionProps.displayedWordIndex]);

        console.log('first', displayProps)

        const wordsToCheckForOverlap = availableWords
            .filter((displayedWord) => displayedWord.word !== availableWords[intersectionProps.displayedWordIndex]?.word);

        //IF OVERLAPPING GET NEXT PROPS
        if (shouldNotDisplay(displayProps, wordsToCheckForOverlap)) {
            return getFinalProps(word, updateUnavailableCharIndexes(intersectionProps, availableWords));
        }

        console.log(displayProps)

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
        console.log('new props')

        //SIDE EFFECT - REGISTER DISPLAYED WORDS
        registerDisplayedWords(word, props.intersectionProps, props.displayProps);

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