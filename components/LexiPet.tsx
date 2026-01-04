
import React, { useState, useEffect } from 'react';

interface LexiPetProps {
  totalWords: number;
  isEvolving?: boolean;
}

const LexiPet: React.FC<LexiPetProps> = ({ totalWords, isEvolving }) => {
  const [showEvolutionOverlay, setShowEvolutionOverlay] = useState(false);

  const getPetStage = (words: number) => {
    if (words < 50) return { emoji: '🥚', label: '灵能之卵', color: 'from-blue-100 to-indigo-100', text: '潜能积蓄中...' };
    if (words < 100) return { emoji: '🐣', label: '破壳幼灵', color: 'from-yellow-100 to-orange-100', text: '初识大千世界' };
    if (words < 200) return { emoji: '🐥', label: '识字羽灵', color: 'from-green-100 to-emerald-100', text: '羽翼渐丰' };
    if (words < 500) return { emoji: '🦊', label: '幻羽天狐', color: 'from-pink-100 to-rose-100', text: '通晓人情世故' };
    if (words < 1000) return { emoji: '🦄', label: '逐影独角兽', color: 'from-purple-100 to-violet-100', text: '漫步于真理之境' };
    return { emoji: '🐲', label: '万词圣龙', color: 'from-indigo-200 to-slate-900', text: '语言的主宰者' };
  };

  // 进化动画逻辑
  useEffect(() => {
    if (isEvolving) {
      setShowEvolutionOverlay(true);
      const timer = setTimeout(() => setShowEvolutionOverlay(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isEvolving]);

  const currentStage = getPetStage(totalWords);
  const previousStage = getPetStage(Math.max(0, totalWords - 50));

  return (
    <div className="relative w-full">
      {/* 基础显示卡片 */}
      <div className={`relative flex flex-col items-center justify-center p-8 rounded-[3rem] bg-gradient-to-br ${currentStage.color} shadow-inner transition-all duration-700 overflow-hidden`}>
        {/* 背景光晕 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/40 blur-3xl rounded-full"></div>
        
        {/* 漂浮装饰 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute w-1.5 h-1.5 bg-white rounded-full animate-float" style={{ 
              top: `${20 + i * 15}%`, 
              left: `${10 + (i * 23) % 80}%`,
              animationDelay: `${i * 0.7}s`
            }}></div>
          ))}
        </div>

        <div className="text-7xl mb-4 animate-float relative z-10 filter drop-shadow-2xl">
          {currentStage.emoji}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/50 shadow-sm mb-1">
            <span className="text-[10px] font-black text-gray-900 tracking-widest uppercase">{currentStage.label}</span>
          </div>
          <p className="text-[9px] text-gray-500 font-bold opacity-70 italic">{currentStage.text}</p>
        </div>
      </div>

      {/* 进化全屏动画层 */}
      {showEvolutionOverlay && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in">
          {/* 旋转光束 */}
          <div className="absolute w-[150vw] h-[150vw] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.4),transparent)] animate-spin-slow opacity-30"></div>
          
          <div className="relative flex flex-col items-center">
            {/* 进化前后的切换动画 */}
            <div className="relative w-48 h-48 flex items-center justify-center">
               <div className="absolute text-8xl animate-shake opacity-0 [animation:shake_0.1s_linear_infinite,fadeOut_1s_ease-out_forwards_2s]">
                {previousStage.emoji}
               </div>
               <div className="absolute text-9xl scale-0 opacity-0 [animation:bounceIn_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards_2.5s]">
                {currentStage.emoji}
               </div>
               {/* 闪光弹效果 */}
               <div className="absolute inset-0 bg-white rounded-full scale-0 opacity-0 [animation:ping_1s_ease-out_forwards_2.2s] blur-2xl"></div>
            </div>

            <div className="mt-12 text-center space-y-2">
              <h2 className="text-white font-black text-3xl tracking-tighter opacity-0 [animation:slideUp_0.5s_ease-out_forwards_3s]">形态进化成功！</h2>
              <div className="bg-indigo-600 px-6 py-2 rounded-full inline-block shadow-2xl shadow-indigo-500/50 opacity-0 [animation:slideUp_0.5s_ease-out_forwards_3.3s]">
                <span className="text-white font-black text-sm">{previousStage.label} ➔ {currentStage.label}</span>
              </div>
            </div>
          </div>

          {/* 彩色碎纸屑装饰 (静态模拟逻辑，实际可通过JS动态创建) */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="confetti" 
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#FDE047', '#F472B6', '#60A5FA', '#34D399'][i % 4],
                  animationDelay: `${2.5 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LexiPet;
