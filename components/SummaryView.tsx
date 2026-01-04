
import React, { useEffect, useState } from 'react';

interface SummaryViewProps {
  summary: string;
  onRestart: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary, onRestart }) => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const checkIn = () => {
      const today = new Date().toISOString().split('T')[0];
      const statsStr = localStorage.getItem('word_stats');
      let stats = statsStr ? JSON.parse(statsStr) : { lastDate: '', streak: 0 };

      if (stats.lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (stats.lastDate === yesterdayStr) {
          stats.streak += 1;
        } else {
          stats.streak = 1;
        }
        stats.lastDate = today;
        localStorage.setItem('word_stats', JSON.stringify(stats));
      }
      setStreak(stats.streak);
    };
    checkIn();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-indigo-100 relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 p-4">
          <div className="flex flex-col items-center">
             <div className="text-orange-500 animate-bounce">
               <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.66 11.2c-.23-.3-.51-.56-.83-.77-1.06-.69-2.43-.8-3.53-.4l.1-.3c.28-.82.17-1.74-.29-2.47-.45-.74-1.2-1.27-2.06-1.47l-.27-.06c-.1-.02-.19-.03-.29-.03-.43 0-.84.13-1.18.35l-.1.08c-.2.15-.39.33-.55.52-1.2 1.45-1.35 3.54-.35 5.15.14.22.41.3.64.16.21-.13.28-.41.16-.64-.7-1.12-.6-2.58.23-3.6.11-.14.25-.26.4-.35.06-.04.13-.07.2-.1.26.08.49.25.63.49.33.52.41 1.17.21 1.81l-.1.3c-1.07.45-1.87 1.43-2.12 2.58-.26 1.15.16 2.37 1.05 3.14.9.76 2.14 1.01 3.25.64 1.11-.37 1.96-1.3 2.22-2.44.26-1.15-.16-2.37-1.05-3.14zM12 18c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"></path></svg>
             </div>
             <span className="text-[10px] font-bold text-orange-600 uppercase">🔥 {streak} Days</span>
          </div>
        </div>
        
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 mb-2">打卡成功！</h2>
        <p className="text-gray-500 mb-6 text-sm px-4">恭喜！你已连续学习 {streak} 天，这是今日的记忆金句：</p>
        
        <div className="bg-indigo-50 rounded-2xl p-6 border-l-4 border-indigo-600 mb-8 shadow-inner">
          <p className="text-indigo-900 font-bold text-lg leading-relaxed italic">
            "{summary}"
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            onClick={() => {
              // Share functionality simulation
              alert("已为您生成学习海报，长按图片保存（模拟）");
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            生成分享海报
          </button>
          <button 
            className="w-full bg-white text-gray-500 font-bold py-3 rounded-xl border border-gray-200 active:scale-95 transition-all text-sm"
            onClick={onRestart}
          >
            再次回顾
          </button>
        </div>
      </div>
      
      <p className="text-gray-400 text-[10px] mt-6 uppercase tracking-widest font-bold">每日一词，积少成多</p>
    </div>
  );
};

export default SummaryView;
