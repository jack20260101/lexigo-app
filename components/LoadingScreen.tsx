
import React from 'react';

const LoadingScreen: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-6">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">正在加载今日单词...</h2>
      <p className="text-gray-500 text-center animate-pulse">{message}</p>
      <div className="mt-8 text-sm text-gray-400">正在通过 AI 生成为您定制的记忆图解</div>
    </div>
  );
};

export default LoadingScreen;
