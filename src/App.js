import React, { useState } from 'react';
import Word from './components/Word';
import { CHAR_WIDTH, START_AXES, WORDS } from './constants/constants';

import './App.css';

//NEED TO ADD INPUT FOR WORDS

//NEED TO HANDLE WORDS THAT DON'T LINK

//NEED TO HANDLE OVERLAPPING

const App = () => {
  const [isGenerated, generateCrossword] = useState(false);

  const handleToggle = () => {
    if (isGenerated) {
      generateCrossword(false);
    } else {
      generateCrossword(true);
    }
  };

  //GENERATE CROSSWORD
  const renderWordsOntoCrosswords = (words) => {
    let isVertical = true;
    let displayedWords = [];
    let startY = START_AXES;
    let startX = START_AXES;

    const updateUnavailableCharIndexes = (intersectionProps) => {
      displayedWords[intersectionProps.displayedWordIndex] = {
        ...displayedWords[intersectionProps.displayedWordIndex],
        unavailableCharIndexes: [
          ...displayedWords[intersectionProps.displayedWordIndex].unavailableCharIndexes,
          intersectionProps.displayedCharIndex
        ]
      }
    };

    //DETERMINE THE NEXT X, Y AXES TO DISPLAY WORD
    const returnDisplayProperties = ({ displayedCharIndex, newCharIndex }, displayedWord) => {
      const { isVertical } = displayedWord;

      const newCharIndexPixels = newCharIndex * CHAR_WIDTH;
      const oldCharIndexPixels = displayedCharIndex * CHAR_WIDTH;
      console.log(oldCharIndexPixels, newCharIndexPixels)

      return {
        isVertical: isVertical ? false : true,
        startY: isVertical ? displayedWord.startY + oldCharIndexPixels : displayedWord.startY - newCharIndexPixels,
        startX: isVertical ? displayedWord.startX - newCharIndexPixels : displayedWord.startX + oldCharIndexPixels
      }
    };

    //FIND THE INDEX OF THE WORD TO INTERSECT ---> FIND THE INDEXES OF CHARACTERS THAT INTERSECT
    const returnIntersectionProperties = (word) => {
      let newCharIndex;
      let displayedCharIndex;

      const wordChars = displayedWords.map((item) => [...item.word]);
      console.log(wordChars);

      //DETERMINE INTERSECTION INDEXES OF WORD AND CHARACTERS
      const displayedWordIndex = displayedWords
        .map((item) => {
          //MAP ITEMS AND HANDLE ALREADY INTERSECTED CHARACTERS
          console.log(item)
          const { unavailableCharIndexes, word } = item;
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
          //FIND DISPLAYED WORD TO INTERSECT WITH AND THE CHARACTERS THAT INTERSECT
          console.log(charArray)
          const isCharacterInWord = charArray.some((char, index) => {
            if (word.includes(char)) {
              console.log('-->', charArray, char, word);
              displayedCharIndex = index;
              newCharIndex = word.indexOf(char);
            }

            return word.includes(char);
          });

          return isCharacterInWord;
        });

      console.log(displayedWordIndex);

      return {
        displayedWordIndex: displayedWordIndex,
        newCharIndex: newCharIndex,
        displayedCharIndex: displayedCharIndex
      };
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
          unavailableCharIndexes: [] 
        }];
      } else {
        //DETERMINE INTERSECTION + DISPLAY PROPS FOR NEXT ITEMS
        const intersectionProps = returnIntersectionProperties(word);
        console.log('map next details', intersectionProps, word, displayedWords[intersectionProps.displayedWordIndex])
        const displayProps = returnDisplayProperties(intersectionProps, displayedWords[intersectionProps.displayedWordIndex]);

        displayedWords = [...displayedWords, {
          word: word,
          unavailableCharIndexes: [intersectionProps.newCharIndex],
          ...displayProps
        }];

        updateUnavailableCharIndexes(intersectionProps);

        startY = `${displayProps.startY}px`;
        startX = `${displayProps.startX}px`;
        isVertical = displayProps.isVertical;
      };

      console.log('y', startY);
      console.log('x', startX);

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

  return (
    <div className="App">
      <button onClick={handleToggle} className="link-button">LINK WORDS</button>
      {!isGenerated && 
        <div style={{ width: 'fit-content', margin: 'auto' }}>
          {WORDS.map((word, index) => (
            <Word word={word} isVertical={false} startY={index * CHAR_WIDTH} />
          ))}
        </div>
      }

      {isGenerated && 
        <div style={{ width: 'fit-content', margin: 'auto', height: '500px' }}>
          {renderWordsOntoCrosswords(WORDS)}
        </div>
      }
    </div>
  );
};

export default App;
