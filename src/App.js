import React, { useState } from 'react';
import './App.css';
import Word from './components/Word';
import { WORDS } from './constants/constants';
import { mapLinkedWords, mapOrientationOfWords } from './helpers/linkWords';

const App = () => {
  const [linkedWords, setLinkedWords] = useState([]);

  const handleWordLinking = () => {
    const linkedWordItems = WORDS
      .map(mapLinkedWords)
      .map(mapOrientationOfWords);

    linkedWordItems.forEach((wordItem) => {
      if (wordItem.wordToLink) {
        linkedWordItems.splice(WORDS.indexOf(wordItem.wordToLink), 0, linkedWordItems.splice(WORDS.indexOf(wordItem.word), 1)[0]);
      }
    });
    setLinkedWords(linkedWordItems);
  };

  return (
    <div className="App">
      <button onClick={handleWordLinking}>LINK WORDS</button>
      {linkedWords.length === 0 && 
        <div style={{ width: 'fit-content', margin: 'auto' }}>
          {WORDS.map((word, index) => {
            return (
              <Word word={word} isVertical={index % 2 === 0} />
            )
          })}
        </div>
      }

      {linkedWords.length !== 0 && 
        <div style={{ width: 'fit-content', margin: 'auto' }}>
          {linkedWords.map((wordItem, index) => {
            return (
              <Word
                word={wordItem.word}
                wordToLink={wordItem.wordToLink}
                charToLink={wordItem.charToLink}
                isVertical={wordItem.isVertical}
                index={index}
                noLink={!wordItem.wordToLink && !linkedWords.some((word) => word.wordToLink === wordItem.word)}
                words={linkedWords}
              />
            )
          })}
        </div>
      }
    </div>
  );
};

export default App;
