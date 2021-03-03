import Word from "../components/Word";
import { CHAR_WIDTH, START_AXES_Y, START_AXES_X } from "../constants/constants";
import { mapWordCharacters, updateUnavailableCharIndexes } from "./helpers";

const generateCrossword = (words) => {
    let displayedWords = [];

    const willWordOverlap = (displayProps, displayedWords) => {
        // ----------- FIX OVERLAPPING LOGIC ---------------

        console.log(displayProps)
        if (displayProps.noIntersection) {
            console.log('NO INTERSECTION')
            return false;
        }  

        const horizontalWords = displayedWords.filter((displayedWord) => !displayedWord.isVertical);
        const verticalWords = displayedWords.filter((displayedWord) => displayedWord.isVertical);

        if (displayProps.isVertical) {
            //overlapping with horizontal words
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

            //overlapping with other vertical words
            if (verticalWords.some((word) => (word.startX === displayProps.startX) && ((word.startY <= displayProps.endY) && (displayProps.endY <= word.endY)))) {
                console.log('OVERLAP')
                return true;
            }

            return false;
        }

        if (!displayProps.isVertical) {
            //overlapping with vertical words
            const verticalOverlapWord = verticalWords.find((word) => {
                const isBetweenYAxes = (word.startY <= displayProps.startY) && (displayProps.startY < word.endY);
                const isAroundXAxes = (displayProps.startX <= word.startX) && (word.startX <= displayProps.endX);

                return isBetweenYAxes && isAroundXAxes;
            });

            if (verticalOverlapWord) {
                console.log('HORIZONTAL OVERLAP', displayProps.word, '-->', verticalOverlapWord)
                return true;
            }

            //overlapping with other horizontal words
            if (horizontalWords.some((word) => {
                console.log(word.word, word.startY, displayProps.startY, (word.startX <= displayProps.endX <= word.endX))
                return (word.startY === displayProps.startY) && (word.startX <= displayProps.endX) && (displayProps.endX <= word.endX);
            })) {
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
        console.log(displayedWord)
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

        const X = displayedWord.startX - newCharIndexPixels;
        if (displayedWord.isVertical) {
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
        console.log('WORD CHECKED:', word, 'TO LINK:', passedWords[intersectionProps.displayedWordIndex])

        console.log('final', intersectionProps)
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
        while (willWordOverlap(displayProps, wordsToCheckForOverlap) === true) {
            if (getFinalProps(word, wordsToCheckForOverlap)) {
                return getFinalProps(word, wordsToCheckForOverlap);
            }
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