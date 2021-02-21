import React from 'react';
import classnames from 'classnames';
import '../App.css';
import { CHAR_WIDTH } from '../constants/constants';
import { calculatePositionForWord } from '../helpers/helpers';

const Word = ({ word, wordToLink, index, charToLink, isVertical, noLink=false, words }) => {
    const WordStyles = classnames(
        {"Word-vertical": isVertical},
        {"Word-horizontal": !isVertical},
        {"Word-no-link": noLink}
    );

    const charStyles = classnames("char",
        {"char-no-link": noLink}
    );

    const positionsInPixels = calculatePositionForWord(word, wordToLink, isVertical, words);
    const marginVertical = words && index > words.findIndex(item => item.wordToLink === wordToLink) ? `0 0 0 -${charToLink * CHAR_WIDTH}px` : `-${charToLink * CHAR_WIDTH}px 0 0 0`;
    const margin = isVertical ? `-${CHAR_WIDTH}px 0 0 ${positionsInPixels}px` : `0 ${positionsInPixels}px 0 0`;
    return (
        <div className={WordStyles} style={{ margin: margin }}>
            {word.split('').map((char) => (
                <div className={charStyles}>
                    {char}
                </div>
            ))}
        </div>
    );
};

export default Word;
