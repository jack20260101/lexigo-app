
import React, { useState, useEffect } from 'react';
import { WordData } from '../types';

interface ArenaViewProps {
  words: WordData[];
  onQuit: () => void;
  onFinish: (score: number) => void;
}

const ArenaView: React.FC<ArenaViewProps> = ({ words, onQuit, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3.0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (currentIndex < words.length) {
      const current = words[currentIndex];
      const others = words.filter(w => w.word !== current.word)
                          .sort(() => 0.5 - Math.random())
                          .slice(0, 3)
                          .map(w => w.translation);
      setOptions([current.translation, ...others].sort(() => 0.5 - Math.random()));
      setTimeLeft(3.0);
    } else {
      onFinish(score);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setIsGameOver(true);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [isGameOver]);

  const handleChoice = (choice: string) => {
    if (choice === words[currentIndex].translation) {
      setScore(s => s + Math.round(timeLeft * 100));
      setCurrentIndex(c => c + 1);
    } else {
      setIsGameOver(true);
    }
  };

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[3rem] shadow-2xl animate-fade-in text-center">
        <div className="text-6xl mb-4">💥</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">挑战结束</h2>
        <p className="text-gray-500 mb-6">最终得分</p>
        <div className="text-5xl font-black text-indigo-600 mb-8">{score}</div>
        <button onClick={onQuit} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all">返回单词</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] animate-fade-in space-y-8">
      <div className="flex justify-between items-center px-4">
        <div className="text-2xl font-black text-indigo-600">Score: {score}</div>
        <div className={`text-xl font-bold transition-colors ${timeLeft < 1 ? 'text-rose-500 animate-pulse' : 'text-gray-400'}`}>
          {timeLeft.toFixed(1)}s
        </div>
      </div>
      
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 transition-all duration-100 ease-linear" style={{ width: `${(timeLeft / 3) * 100}%` }}></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[3rem] shadow-xl border border-indigo-50 p-10">
        <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">请选择正确含义</p>
        <h1 className="text-5xl font-black text-gray-900 mb-10">{words[currentIndex].word}</h1>
        <div className="grid grid-cols-1 gap-4 w-full">
          {options.map((opt, i) => (
            <button key={i} onClick={() => handleChoice(opt)} className="w-full py-5 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl font-bold transition-all active:scale-95 shadow-sm">
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArenaView;
