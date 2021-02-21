import React from 'react';
import classnames from 'classnames';
import '../App.css';

const Word = ({ word, wordToLink, index, charToLink, isVertical, noLink=false, words }) => {
    const WordStyles = classnames(
        {"Word-vertical": isVertical},
        {"Word-horizontal": !isVertical},
        {"Word-no-link": noLink}
    );

    const charStyles = classnames("char",
        {"char-no-link": noLink}
    );

    const marginVertical = words && index > words.findIndex(item => item.wordToLink === wordToLink) ? `0 0 0 -${charToLink * 20}px` : `-${charToLink * 20}px 0 0 0`;
    const margin = isVertical ? marginVertical : `0 0 ${charToLink * 20}px 0`;
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
