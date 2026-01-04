
import React, { useState, useMemo } from 'react';
import { WordData, LEVEL_LABELS } from '../types';
import { playAudio } from '../services/geminiService';

interface NotebookViewProps {
  notebook: WordData[];
  onBack: () => void;
}

const NotebookView: React.FC<NotebookViewProps> = ({ notebook, onBack }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered'>('all');

  // 统计逻辑
  const stats = useMemo(() => {
    const total = notebook.length;
    const mastered = notebook.filter(w => w.mastered || w.srsLevel >= 5).length;
    const learning = total - mastered;
    const accuracy = total > 0 ? Math.round(((total - notebook.reduce((acc, w) => acc + (w.errorCount || 0), 0) / total)) * 10) : 100;
    
    // 模拟遗忘曲线分布
    const srsDistribution = [0, 0, 0, 0, 0, 0].map((_, i) => notebook.filter(w => w.srsLevel === i).length);

    return { total, mastered, learning, accuracy, srsDistribution };
  }, [notebook]);

  const filteredWords = notebook.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(search.toLowerCase()) || w.translation.includes(search);
    if (filter === 'mastered') return matchesSearch && (w.mastered || w.srsLevel >= 5);
    if (filter === 'learning') return matchesSearch && !(w.mastered || w.srsLevel >= 5);
    return matchesSearch;
  }).sort((a, b) => new Date(b.lastLearned).getTime() - new Date(a.lastLearned).getTime());

  return (
    <div className="flex flex-col h-full animate-fade-in pb-20">
      {/* 顶部统计仪表盘 */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-indigo-200 mb-8 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-black">记忆圣殿</h2>
            <p className="text-xs opacity-70 font-bold uppercase tracking-widest mt-1">Knowledge Sanctuary</p>
          </div>
          <button onClick={onBack} className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
            <p className="text-[10px] font-black opacity-60 uppercase">总计词量</p>
            <p className="text-2xl font-black mt-1">{stats.total}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
            <p className="text-[10px] font-black opacity-60 uppercase">已掌握</p>
            <p className="text-2xl font-black mt-1 text-emerald-300">{stats.mastered}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
            <p className="text-[10px] font-black opacity-60 uppercase">记忆强度</p>
            <p className="text-2xl font-black mt-1 text-amber-300">{Math.min(100, stats.accuracy)}%</p>
          </div>
        </div>

        {/* 记忆分布条 */}
        <div className="mt-6">
          <div className="flex justify-between text-[10px] font-black mb-2 opacity-80 uppercase tracking-tighter">
             <span>新词入门</span>
             <span>稳固复习</span>
             <span>完美掌握</span>
          </div>
          <div className="h-3 w-full bg-black/20 rounded-full flex overflow-hidden p-0.5">
            {stats.srsDistribution.map((count, i) => (
              <div 
                key={i} 
                style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                className={`h-full transition-all duration-1000 ${
                  i === 0 ? 'bg-slate-400' : 
                  i < 3 ? 'bg-amber-400' : 
                  i < 5 ? 'bg-indigo-400' : 'bg-emerald-400'
                } ${i > 0 ? 'ml-0.5' : ''} rounded-full`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 搜索与过滤 */}
      <div className="px-2 mb-6 space-y-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="搜索单词或中文..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-gray-50 rounded-2xl px-12 py-4 text-sm font-bold shadow-sm focus:border-indigo-500 outline-none transition-all"
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        <div className="flex gap-2">
          {(['all', 'learning', 'mastered'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {f === 'all' ? '全部' : f === 'learning' ? '磨炼中' : '已掌握'}
            </button>
          ))}
        </div>
      </div>

      {/* 单词列表 */}
      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-10">
        {filteredWords.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <div className="text-6xl mb-4">📭</div>
            <p className="font-black">这里还没有单词哦</p>
          </div>
        ) : (
          filteredWords.map((word) => (
            <div key={word.word} className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900">{word.word}</h3>
                    <button onClick={() => playAudio(word.word)} className="text-indigo-500 hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 font-bold">{word.phonetic}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-indigo-600">{word.translation}</p>
                  <p className="text-[8px] text-gray-300 font-bold mt-1">上次学习: {word.lastLearned}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 mt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      i < (word.srsLevel || 0) ? 'bg-indigo-500' : 'bg-gray-100'
                    }`} 
                  />
                ))}
              </div>
              
              {/* 艾宾浩斯贴士 */}
              <div className="mt-3 flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">下次复习: {word.nextReviewDate}</span>
                <span className={`px-2 py-0.5 rounded-full ${word.srsLevel >= 5 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                   {word.srsLevel >= 5 ? 'Mastered' : 'Progressing'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotebookView;
