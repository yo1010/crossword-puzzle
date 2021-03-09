import React, { useState } from 'react';
import Word from './components/Word';
import { CHAR_WIDTH, WORDS } from './constants/constants';
import generateCrossword from './helpers/generateCrossword';

import './App.css';

//NEED TO ADD INPUT FOR WORDS

//NEED TO HANDLE WORDS THAT DON'T LINK

//NEED TO HANDLE OVERLAPPING

const App = () => {
  const [isGenerated, toggleCrossword] = useState(false);

  const handleToggle = () => {
    if (isGenerated) {
      toggleCrossword(false);
    } else {
      toggleCrossword(true);
    }
  };

  return (
    <div className="App">
      <button onClick={handleToggle} className="link-button">LINK WORDS</button>
      {!isGenerated && 
        <div style={{ width: 'fit-content', margin: 'auto' }}>
          {WORDS.map((word, index) => (
            <Word word={word} isVertical={false} startY={index * CHAR_WIDTH} index={99 + index}/>
          ))}
        </div>
      }

      {isGenerated && 
        <div style={{ width: 'fit-content', margin: 'auto', height: '500px' }}>
          {generateCrossword(WORDS)}
        </div>
      }
    </div>
  );
};

export default App;
