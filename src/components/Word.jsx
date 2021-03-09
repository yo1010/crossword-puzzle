import React from 'react';
import classnames from 'classnames';
import '../App.css';

const Word = ({ word, startY=0, startX=0, isVertical, noLink=false, index }) => {
    const WordStyles = classnames(
        {"Word-vertical": isVertical},
        {"Word-horizontal": !isVertical},
        {"Word-no-link": noLink}
    );

    const charStyles = classnames("char",
        {"char-no-link": noLink}
    );
    return (
        <div className={WordStyles} style={{ position: 'absolute', top: startY, left: startX }} key={`${word}-${index}`}>
            {word.split('').map((char, index) => (
                <div className={charStyles} key={`${char}-${index}`}>
                    {char}
                </div>
            ))}
        </div>
    );
};

export default Word;
