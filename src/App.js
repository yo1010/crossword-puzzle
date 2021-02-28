import React, { useState } from 'react';
import Word from './components/Word';
import { CHAR_WIDTH, START_AXES, WORDS } from './constants/constants';

import './App.css';

const App = () => {
  const [isGenerated, generateCrossword] = useState(false);

  const renderWordsOntoCrosswords = (words) => {
    let isVertical = true;
    let displayedWords = [];
    let startY = START_AXES;
    let startX = START_AXES;

    //DETERMINE THE NEXT X, Y AXES TO DISPLAY WORD
    const returnDisplayProperties = ({ oldWordCharIndex, newCharIndex }, displayedWord) => {
      const { isVertical } = displayedWord;

      const newCharIndexPixels = newCharIndex * CHAR_WIDTH;
      const oldCharIndexPixels = oldWordCharIndex * CHAR_WIDTH;
      console.log(oldCharIndexPixels, newCharIndexPixels)

      return {
        isVertical: isVertical ? false : true,
        startY: isVertical ? displayedWord.startY + oldCharIndexPixels : displayedWord.startY + newCharIndexPixels,
        startX: isVertical ? displayedWord.startX - newCharIndexPixels : displayedWord.startX - oldCharIndexPixels
      }
    };

    //FIND THE INDEX OF THE WORD TO INTERSECT ---> FIND THE INDEXES OF CHARACTERS THAT INTERSECT
    const returnIntersectionProperties = (word) => {
      let newCharIndex;
      let oldWordCharIndex;

      const wordChars = displayedWords.map((item) => [...item.word]);
      console.log(wordChars);

      //DETERMINE INTERSECTION INDEXES OF WORD AND CHARACTERS
      const newWordIndex = displayedWords
      .map((item) => [...item.word])
      .findIndex((charArray) => {
        const isCharacterInWord = charArray.some((char, index) => {
          if (word.includes(char)) {
            console.log('-->', charArray, char, word);
            oldWordCharIndex = index;
            newCharIndex = word.indexOf(char);
          }

          return word.includes(char);
        });

        return isCharacterInWord;
      });
      console.log(newWordIndex);

      return {
        newWordIndex: newWordIndex,
        newCharIndex: newCharIndex,
        oldWordCharIndex: oldWordCharIndex
      };
    };

    //MAP WORDS AND ADD DISPLAYED WORDS INTO SEPARATE ARRAY
    const mapWordsOntoCrosswords = (word, index) => {
      if (displayedWords.length === 0) {
        //DISPLAY FIRST WORD
        displayedWords = [...displayedWords, { word: word, isVertical: isVertical, startY: startY, startX: startX }];
      } else {
        const intersectionProps = returnIntersectionProperties(word);
        const displayProps = returnDisplayProperties(intersectionProps, displayedWords[intersectionProps.newWordIndex]);
        displayedWords = [...displayedWords, {
          word: word, 
          ...displayProps
        }];
        startY = `${displayProps.startY}px`;
        startX = `${displayProps.startX}px`;
        //find word that can intersect with displayed word
        isVertical = false;
      };

      console.log(startX);
      console.log(startY)
  
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
      <button onClick={() => generateCrossword(true)}>LINK WORDS</button>
      {!isGenerated && 
        <div style={{ width: 'fit-content', margin: 'auto' }}>
          {WORDS.map((word, index) => (
            <Word word={word} isVertical={index % 2 === 0} />
          ))}
        </div>
      }

      {isGenerated && 
        <div style={{ width: 'fit-content', margin: 'auto', height: '500px' }}>
          {renderWordsOntoCrosswords(WORDS.slice(0, 4))}
        </div>
      }
    </div>
  );
};

export default App;
