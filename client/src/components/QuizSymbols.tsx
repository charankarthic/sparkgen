import React from 'react';

// Symbols to use for different quiz types
const mathSymbols = ['∑', '∞', 'π', '√', '∫', '≠', '≈', '∂', '+', '-', '×', '÷'];
const scienceSymbols = ['⚛', '⚕', '🧪', '🔬', '🔭', '🧫', '🧬', '⚡', '🌡️', '🌍', '🌌', '💊'];
const historySymbols = ['⏳', '📜', '👑', '⚔️', '🏺', '🏛️', '🗿', '⚱️', '🏰', '🔱', '⚓', '🛡️'];
const englishSymbols = ['📚', '✒️', '📝', '🖋️', '📖', '🔤', '🔠', '🔡', '📔', '📕', '📓', '📘'];
const generalSymbols = ['❓', '❔', '❗', '❕', '💡', '🧠', '🎯', '🎓', '🧩', '🔍', '📊', '🏆'];

// Component to render animated symbols for quizzes
const QuizSymbols: React.FC<{ quizType: string }> = ({ quizType }) => {
  let symbols: string[] = [];
  
  // Select symbols based on quiz type
  switch (quizType?.toLowerCase()) {
    case 'math':
      symbols = mathSymbols;
      break;
    case 'science':
      symbols = scienceSymbols;
      break;
    case 'history':
      symbols = historySymbols;
      break;
    case 'english':
      symbols = englishSymbols;
      break;
    default:
      symbols = generalSymbols;
  }

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {symbols.map((symbol, index) => {
        // Generate random positions and animations for each symbol
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const size = Math.random() * 1.5 + 1; // Size between 1rem and 2.5rem
        const delay = Math.random() * 5; // Random delay for animation
        const duration = Math.random() * 10 + 10; // Animation duration between 10-20s
        
        return (
          <div
            key={index}
            className="absolute text-primary-foreground opacity-20 animate-float"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              fontSize: `${size}rem`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          >
            {symbol}
          </div>
        );
      })}
    </div>
  );
};

export default QuizSymbols;