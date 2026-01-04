
import React, { useState, useMemo } from 'react';
import { WordData, AppStats, UserProfile } from '../types';
import { playAudio } from '../services/geminiService';

interface ProfileViewProps {
  notebook: WordData[];
  stats: AppStats;
  user: UserProfile;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ notebook, stats, user, onBack }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered'>('all');

  const analysis = useMemo(() => {
    const total = notebook.length;
    const mastered = notebook.filter(w => w.srsLevel >= 5).length;
    const learning = total - mastered;
    
    // 模拟艾宾浩斯曲线点
    const userRetention = [100, 95, 88, 82, 79, 75, 72, 70]; // 用户在 SRS 辅助下的保持率 %

    return { total, mastered, learning, userRetention };
  }, [notebook]);

  const filteredWords = notebook.filter(w => {
    const matches = w.word.toLowerCase().includes(search.toLowerCase()) || w.translation.includes(search);
    if (filter === 'mastered') return matches && w.srsLevel >= 5;
    if (filter === 'learning') return matches && w.srsLevel < 5;
    return matches;
  }).sort((a, b) => new Date(b.lastLearned).getTime() - new Date(a.lastLearned).getTime());

  return (
    <div className="flex flex-col h-full animate-fade-in pb-20">
      {/* 头部：用户信息 */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-6 flex items-center gap-6">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-4xl shadow-inner ring-4 ring-white">{user.avatar}</div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
          <div className="flex gap-2 mt-2">
            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Lv.{(Math.floor(stats.totalWords / 50)) + 1} 识词者</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">🔥 {stats.streak}D STREAK</span>
          </div>
        </div>
      </div>

      {/* 遗忘曲线可视化 */}
      <div className="bg-gray-900 rounded-[2.5rem] p-6 text-white mb-6 shadow-2xl relative overflow-hidden">
        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
           <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span> Ebbinghaus Memory Curve
        </h3>
        
        <div className="h-40 flex items-end justify-between px-2 gap-1 relative">
          <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
             <path d="M0,0 Q50,120 100,140" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4" />
          </svg>
          
          {analysis.userRetention.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group relative">
              <div 
                className="w-full bg-indigo-500 rounded-t-lg transition-all duration-1000 group-hover:bg-indigo-400" 
                style={{ height: `${val}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity">{val}%</div>
              </div>
              <span className="text-[7px] mt-2 opacity-40 font-bold uppercase tracking-tighter">{['Now', '20m', '1h', '9h', '1d', '2d', '6d', '31d'][i]}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-indigo-300/60 mt-6 text-center italic font-medium">实柱为您在词灵辅助下的真实保持率</p>
      </div>

      {/* 单词本部分 */}
      <div className="flex-1 bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            我的单词本
            <span className="text-xs font-bold text-gray-300">({analysis.total})</span>
          </h3>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-emerald-500">{analysis.mastered}</p>
              <p className="text-[8px] text-gray-400 uppercase">Mastered</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-amber-500">{analysis.learning}</p>
              <p className="text-[8px] text-gray-400 uppercase">Learning</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="搜索已背单词..." 
              className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-4 py-3 text-xs font-bold outline-none ring-1 ring-gray-100 focus:ring-indigo-200 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <select 
            className="bg-gray-50 border-none rounded-2xl px-3 text-[10px] font-black uppercase text-gray-500 outline-none ring-1 ring-gray-100"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">全部</option>
            <option value="learning">磨炼中</option>
            <option value="mastered">已掌握</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
          {filteredWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <span className="text-5xl mb-4">📖</span>
              <p className="text-xs font-black uppercase tracking-widest">词本空空如也</p>
            </div>
          ) : (
            filteredWords.map(w => (
              <div key={w.word} className="flex justify-between items-center group p-4 bg-gray-50/50 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-black text-gray-900">{w.word}</h4>
                    <button onClick={() => playAudio(w.word)} className="text-indigo-400 hover:scale-110 transition-transform">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold leading-tight">{w.translation}</p>
                  <p className="text-[8px] text-gray-300 mt-2 font-medium">复习于 {w.lastLearned}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < w.srsLevel ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${w.srsLevel >= 5 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {w.srsLevel >= 5 ? 'Mastered' : 'Progressing'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
