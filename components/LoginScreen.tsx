
import React, { useState, useEffect } from 'react';

interface LoginScreenProps {
  onLogin: (user: { name: string; avatar: string }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<'options' | 'phone' | 'authorizing'>('options');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleWechatAuth = () => {
    setView('authorizing');
    // 模拟微信授权跳转延迟
    setTimeout(() => {
      onLogin({ name: "微信用户", avatar: "🦊" });
    }, 2000);
  };

  const startCountdown = () => {
    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
      alert("请输入正确的手机号");
      return;
    }
    setCountdown(60);
  };

  const handlePhoneLogin = () => {
    if (code.length !== 4) {
      alert("请输入4位验证码");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onLogin({ name: `用户${phoneNumber.slice(-4)}`, avatar: "👤" });
      setIsLoading(false);
    }, 1500);
  };

  if (view === 'authorizing') {
    return (
      <div className="fixed inset-0 bg-white z-[110] flex flex-col items-center justify-center p-10 animate-fade-in">
        <div className="w-20 h-20 bg-[#07C160] rounded-full flex items-center justify-center text-white mb-6 animate-pulse">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M8.281 12.06c-.461 0-.833-.314-.833-.701 0-.387.372-.7.833-.7s.833.313.833.7c0 .387-.372.701-.833.701zm3.844 0c-.461 0-.833-.314-.833-.701 0-.387.372-.7.833-.7s.833.313.833.7c0 .387-.372.701-.833.701zm7.375-3.041C19.5 5.253 16.353 2.5 12.5 2.5 8.358 2.5 5 5.432 5 9.049c0 2.053 1.077 3.882 2.766 5.122l-.703 2.108 2.454-1.227c.618.158 1.282.25 1.983.25 3.853 0 7-2.753 7-6.283zm-7 10c-.394 0-.776-.027-1.144-.078l-1.636.818.468-1.405C9.467 17.525 8.75 16.307 8.75 14.938c0-2.35 2.127-4.25 4.75-4.25s4.75 1.9 4.75 4.25-2.127 4.25-4.75 4.25z"/></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">微信授权中...</h2>
        <p className="text-gray-400 text-sm mt-2">正在获取您的公开信息</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-between p-10 overflow-hidden">
      <div className="mt-16 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-100 mx-auto mb-6 transform -rotate-6">L</div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">LexiGo 词灵</h1>
        <p className="text-gray-400 text-sm mt-1 font-medium">让单词在场景中“活”过来</p>
      </div>

      {view === 'options' ? (
        <div className="w-full space-y-4 mb-8 animate-fade-in">
          <button 
            onClick={handleWechatAuth}
            className="w-full bg-[#07C160] text-white font-bold py-4 rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.281 12.06c-.461 0-.833-.314-.833-.701 0-.387.372-.7.833-.7s.833.313.833.7c0 .387-.372.701-.833.701zm3.844 0c-.461 0-.833-.314-.833-.701 0-.387.372-.7.833-.7s.833.313.833.7c0 .387-.372.701-.833.701zm7.375-3.041C19.5 5.253 16.353 2.5 12.5 2.5 8.358 2.5 5 5.432 5 9.049c0 2.053 1.077 3.882 2.766 5.122l-.703 2.108 2.454-1.227c.618.158 1.282.25 1.983.25 3.853 0 7-2.753 7-6.283zm-7 10c-.394 0-.776-.027-1.144-.078l-1.636.818.468-1.405C9.467 17.525 8.75 16.307 8.75 14.938c0-2.35 2.127-4.25 4.75-4.25s4.75 1.9 4.75 4.25-2.127 4.25-4.75 4.25z"/></svg>
            微信一键登录
          </button>
          <button 
            onClick={() => setView('phone')}
            className="w-full bg-slate-50 text-slate-600 font-bold py-4 rounded-3xl border border-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            手机号码登录
          </button>
        </div>
      ) : (
        <div className="w-full space-y-5 mb-8 animate-slide-up">
          <div className="space-y-4">
            <div className="relative">
              <input 
                type="tel" 
                placeholder="请输入手机号" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none ring-2 ring-transparent focus:ring-indigo-200 transition-all font-bold text-gray-800"
              />
            </div>
            <div className="flex gap-3">
              <input 
                type="number" 
                placeholder="验证码" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none ring-2 ring-transparent focus:ring-indigo-200 transition-all font-bold text-gray-800"
              />
              <button 
                onClick={startCountdown}
                disabled={countdown > 0}
                className="px-6 bg-indigo-50 text-indigo-600 font-bold rounded-2xl text-sm whitespace-nowrap disabled:opacity-50"
              >
                {countdown > 0 ? `${countdown}s` : "获取验证码"}
              </button>
            </div>
          </div>
          <button 
            onClick={handlePhoneLogin}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center"
          >
            {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "立即登录"}
          </button>
          <button onClick={() => setView('options')} className="w-full text-slate-400 text-sm font-bold">返回其他方式</button>
        </div>
      )}

      <div className="text-center">
        <p className="text-[10px] text-slate-400 px-6 leading-relaxed">
          继续即代表同意 <span className="text-indigo-500 font-bold underline">用户协议</span> 和 <span className="text-indigo-500 font-bold underline">隐私权政策</span><br/>
          LexiGo 词灵由 AI 技术驱动，为您提供定制化学习体验
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
