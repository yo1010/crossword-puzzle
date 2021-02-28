import React from 'react';
import classnames from 'classnames';
import '../App.css';

const Word = ({ word, startY=0, startX=0, isVertical, noLink=false }) => {
    const WordStyles = classnames(
        {"Word-vertical": isVertical},
        {"Word-horizontal": !isVertical},
        {"Word-no-link": noLink}
    );

    const charStyles = classnames("char",
        {"char-no-link": noLink}
    );
    return (
        <div className={WordStyles} style={{ position: 'absolute', top: startY, left: startX  }}>
            {word.split('').map((char) => (
                <div className={charStyles}>
                    {char}
                </div>
            ))}
        </div>
    );
};

export default Word;
