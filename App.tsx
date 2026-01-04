
import React, { useState, useEffect } from 'react';
import { DayLesson, WordData, AppStats, LEVEL_LABELS, UserProfile, DailySentence } from './types';
import { fetchDailyLesson, fetchDailySentence } from './services/geminiService';
import LoadingScreen from './components/LoadingScreen';
import WordCard from './components/WordCard';
import SummaryView from './components/SummaryView';
import LoginScreen from './components/LoginScreen';
import LexiPet from './components/LexiPet';
import ArenaView from './components/ArenaView';
import ProfileView from './components/ProfileView';

const SRS_INTERVALS = [0, 1, 2, 4, 7, 15, 30];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'home' | 'learning' | 'profile' | 'arena'>('home');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [lesson, setLesson] = useState<DayLesson | null>(null);
  const [dailyQuote, setDailyQuote] = useState<DailySentence | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [stats, setStats] = useState<AppStats>({ 
    streak: 0, totalWords: 0, arenaHighScore: 0, unlockedBadges: [], history: [], dailyGoal: 10, totalLikesReceived: 0 
  });
  const [notebook, setNotebook] = useState<WordData[]>([]);

  useEffect(() => {
    const savedStats = localStorage.getItem('lexigo_stats_v4');
    if (savedStats) setStats(JSON.parse(savedStats));
    const savedNotebook = localStorage.getItem('lexigo_notebook_v4');
    if (savedNotebook) setNotebook(JSON.parse(savedNotebook));
    const savedUser = localStorage.getItem('lexigo_user_v4');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    setSelectedLevel(localStorage.getItem('lexigo_last_level') || 'CET-4');
    
    // 获取每日金句
    fetchDailySentence().then(setDailyQuote);
  }, []);

  const handleLogin = (loginData: { name: string; avatar: string }) => {
    const newUser = { ...loginData, id: '123', isLoggedIn: true, medals: [] };
    setUser(newUser);
    localStorage.setItem('lexigo_user_v4', JSON.stringify(newUser));
  };

  const startLearning = async () => {
    if (!selectedLevel) return;
    setIsLoading(true);
    setView('learning');
    const today = new Date();
    today.setHours(0,0,0,0);
    const reviewQueue = notebook.filter(w => new Date(w.nextReviewDate) <= today && !w.mastered).slice(0, 5);
    try {
      const data = await fetchDailyLesson(selectedLevel, stats.dailyGoal, reviewQueue);
      setLesson(data);
      setCurrentIndex(0);
      setIsFinished(false);
    } catch (e) {
      alert("词库加载失败");
      setView('home');
    } finally { setIsLoading(false); }
  };

  const handleWordResponse = (known: boolean) => {
    if (!lesson) return;
    const currentWord = lesson.words[currentIndex];
    const today = new Date();
    let updated: WordData;
    if (known) {
      const nextLvl = Math.min((currentWord.srsLevel || 0) + 1, 6);
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + SRS_INTERVALS[nextLvl]);
      updated = { ...currentWord, srsLevel: nextLvl, nextReviewDate: nextDate.toISOString().split('T')[0], mastered: nextLvl >= 5 };
    } else {
      updated = { ...currentWord, errorCount: (currentWord.errorCount || 0) + 1, srsLevel: 0, nextReviewDate: new Date(today.getTime() + 86400000).toISOString().split('T')[0], mastered: false };
    }
    setNotebook(prev => {
      const filtered = prev.filter(w => w.word.toLowerCase() !== updated.word.toLowerCase());
      const res = [...filtered, updated];
      localStorage.setItem('lexigo_notebook_v4', JSON.stringify(res));
      return res;
    });
    if (currentIndex < lesson.words.length - 1) setCurrentIndex(c => c + 1);
    else finalizeSession();
  };

  const finalizeSession = () => {
    const newTotal = stats.totalWords + lesson!.words.length;
    const newStats = { ...stats, totalWords: newTotal, streak: stats.streak + 1 };
    if (Math.floor(newTotal / 50) > Math.floor(stats.totalWords / 50)) {
      setIsEvolving(true);
      setTimeout(() => setIsEvolving(false), 5500);
    }
    setStats(newStats);
    localStorage.setItem('lexigo_stats_v4', JSON.stringify(newStats));
    setIsFinished(true);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (isLoading) return <LoadingScreen message={`正在开启 ${selectedLevel ? LEVEL_LABELS[selectedLevel] : '单词'} 识界...`} />;

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col max-w-lg mx-auto overflow-hidden font-sans relative">
      <header className="px-6 py-4 flex justify-between items-center bg-white/40 backdrop-blur-xl sticky top-0 z-40 border-b border-white/40">
        <div className="flex items-center gap-3" onClick={() => setView('home')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">L</div>
          <h1 className="text-sm font-black text-gray-900 tracking-tight">LexiGo 词灵</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-800 leading-none">{user.name}</p>
            <p className="text-[8px] text-orange-500 font-bold mt-1">🔥 STREAK {stats.streak}</p>
          </div>
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-lg border border-gray-100 shadow-sm">{user.avatar}</div>
        </div>
      </header>

      <main className="flex-1 p-6 relative z-10 overflow-y-auto no-scrollbar pb-40">
        {view === 'home' && (
          <div className="animate-fade-in space-y-8">
            {/* 每日金句卡片 */}
            {dailyQuote && (
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20"><svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9125 16 16.0171 16H19.0171V14.5C19.0171 11.4624 16.5547 9 13.5171 9H13.0171V7H13.5171C17.6592 7 21.0171 10.3579 21.0171 14.5V21H14.017ZM3.01709 21L3.01709 18C3.01709 16.8954 3.91252 16 5.01709 16H8.01709V14.5C8.01709 11.4624 5.55465 9 2.51709 9H2.01709V7H2.51709C6.65923 7 10.0171 10.3579 10.0171 14.5V21H3.01709Z"></path></svg></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Daily Inspiration</h4>
                <p className="text-sm font-bold leading-relaxed mb-2">"{dailyQuote.english}"</p>
                <p className="text-[10px] opacity-80 mb-4">{dailyQuote.chinese}</p>
                <p className="text-[9px] font-black text-right">— {dailyQuote.author}</p>
              </div>
            )}

            <LexiPet totalWords={stats.totalWords} isEvolving={isEvolving} />

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setView('arena')} className="bg-gray-900 p-5 rounded-[2.2rem] text-white flex flex-col items-center gap-2 shadow-2xl active:scale-95 transition-all">
                <span className="text-2xl">⚔️</span>
                <span className="font-black text-[10px]">竞技场</span>
              </button>
              <button className="bg-white p-5 rounded-[2.2rem] border border-gray-100 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-all">
                <span className="text-2xl">📷</span>
                <span className="font-black text-[10px] text-gray-800">拍照识词</span>
              </button>
            </div>

            <div className="space-y-4 pb-20">
               <h3 className="text-lg font-black text-gray-900">选择学习领域</h3>
               <div className="grid grid-cols-2 gap-3">
                 {Object.keys(LEVEL_LABELS).slice(0, 8).map(lib => (
                   <button key={lib} onClick={() => setSelectedLevel(lib)} className={`p-4 rounded-3xl border transition-all ${selectedLevel === lib ? 'bg-indigo-50 border-indigo-500 shadow-lg' : 'bg-white border-gray-100'}`}>
                     <span className={`font-bold text-xs ${selectedLevel === lib ? 'text-indigo-900' : 'text-gray-800'}`}>{LEVEL_LABELS[lib]}</span>
                   </button>
                 ))}
               </div>
            </div>
          </div>
        )}

        {view === 'arena' && lesson && <ArenaView words={lesson.words} onQuit={() => setView('home')} onFinish={(s) => { setStats(prev => ({...prev, arenaHighScore: Math.max(prev.arenaHighScore, s)})); setView('home'); }} />}
        {view === 'profile' && <ProfileView notebook={notebook} stats={stats} user={user} onBack={() => setView('home')} />}
        {view === 'learning' && lesson && !isFinished && <WordCard data={lesson.words[currentIndex]} index={currentIndex} total={lesson.words.length} onResponse={handleWordResponse} isFirst={currentIndex === 0} />}
        {view === 'learning' && isFinished && <SummaryView summary={lesson?.summarySentence || ""} onRestart={() => setView('home')} />}
      </main>

      {view !== 'learning' && view !== 'arena' && (
        <nav className="fixed bottom-6 inset-x-6 h-20 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-2xl flex items-center justify-around px-4 z-40">
          <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>
            <span className="text-[8px] font-black uppercase tracking-widest">单词</span>
          </button>
          
          <div className="w-16 h-16 transform -translate-y-4">
            <button onClick={startLearning} disabled={!selectedLevel} className={`w-full h-full rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white active:scale-90 transition-all ${selectedLevel ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
            </button>
          </div>

          <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 ${view === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-black">{user.avatar}</div>
            <span className="text-[8px] font-black uppercase tracking-widest">My</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
