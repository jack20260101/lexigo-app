
import React, { useState, useEffect, useRef } from 'react';
import { WordData, Comment } from '../types';
import { generateMnemonicImage, playAudio, evaluatePronunciation } from '../services/geminiService';

interface WordCardProps {
  data: WordData;
  index: number;
  total: number;
  onResponse: (known: boolean) => void;
  isFirst: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ data, index, total, onResponse, isFirst }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [evalResult, setEvalResult] = useState<{ score: number; feedback: string } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    const loadImage = async () => {
      setLoadingImage(true);
      try {
        const url = await generateMnemonicImage(data.imagePrompt);
        setImageUrl(url);
      } catch {
        setImageUrl(`https://picsum.photos/seed/${data.word}/400/400`);
      } finally {
        setLoadingImage(false);
      }
    };
    loadImage();
    setComments([
      { 
        id: '1', user: '粉丝酱', avatar: '🌸', content: `这个词的谐音"${data.homophone}"绝了！`, likes: 12, timestamp: '10分钟前',
        replies: [
          { id: '1-1', user: '单词迷', avatar: '🦉', content: '确实，我一下子就记住了。', likes: 2, timestamp: '5分钟前', replyTo: '粉丝酱' }
        ]
      },
      { id: '2', user: '学霸小明', avatar: '🎓', content: '跟读了一下，AI给了95分！', likes: 5, timestamp: '2小时前' }
    ]);
  }, [data.word]);

  const handleLike = (commentId: string) => {
    setComments(prev => {
      const updateList = (list: Comment[]): Comment[] => {
        return list.map(c => {
          if (c.id === commentId) {
            const isNowLiked = !c.isLiked;
            return { ...c, isLiked: isNowLiked, likes: c.likes + (isNowLiked ? 1 : -1) };
          }
          if (c.replies) {
            return { ...c, replies: updateList(c.replies) };
          }
          return c;
        });
      };
      return updateList(prev);
    });
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      user: '你',
      avatar: '🦊',
      content: newCommentText.trim(),
      likes: 0,
      timestamp: '刚刚',
      replyTo: replyTarget ? replyTarget.user : undefined,
      isLiked: false
    };

    if (replyTarget) {
      setComments(prev => prev.map(c => {
        if (c.id === replyTarget.id || c.replies?.some(r => r.id === replyTarget.id)) {
          return { ...c, replies: [...(c.replies || []), newComment] };
        }
        return c;
      }));
    } else {
      setComments([...comments, newComment]);
    }
    setNewCommentText('');
    setReplyTarget(null);
  };

  const startReply = (comment: Comment) => {
    setReplyTarget(comment);
    inputRef.current?.focus();
  };

  const renderComment = (c: Comment, isReply = false) => (
    <div key={c.id} className={`group animate-fade-in ${isReply ? 'ml-8 mt-2 pl-3 border-l-2 border-indigo-50' : 'bg-gray-50/50 p-3 rounded-2xl border border-gray-50'}`}>
      <div className="flex gap-3">
        <span className={isReply ? "text-sm" : "text-xl"}>{c.avatar}</span>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[10px] font-black text-gray-700">
              {c.user} {c.replyTo && <span className="text-gray-400 font-normal ml-1">回复 @{c.replyTo}</span>}
            </span>
            <span className="text-[8px] text-gray-400">{c.timestamp}</span>
          </div>
          <p className="text-[10px] text-gray-600 leading-snug">{c.content}</p>
          <div className="flex gap-4 mt-1.5 items-center">
            <button 
              onClick={() => handleLike(c.id)}
              className={`flex items-center gap-1 text-[8px] font-bold transition-all active:scale-125 ${c.isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}
            >
              <svg className="w-3 h-3" fill={c.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              {c.likes > 0 ? c.likes : '点赞'}
            </button>
            <button 
              onClick={() => startReply(c)}
              className="text-[8px] font-bold text-gray-400 hover:text-indigo-500 transition-colors"
            >
              回复
            </button>
          </div>
        </div>
      </div>
      {!isReply && c.replies && c.replies.map(r => renderComment(r, true))}
    </div>
  );

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];
    mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await evaluatePronunciation(data.word, base64);
        setEvalResult(res);
      };
    };
    mediaRecorder.current.start();
    setIsRecording(true);
    setEvalResult(null);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col h-[85vh] relative animate-slide-up">
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="text-indigo-600 font-bold text-xs">进度 {index + 1}/{total}</span>
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${data.srsLevel > 0 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
              {data.srsLevel >= 5 ? '👑 已掌握' : data.srsLevel > 0 ? `🚀 掌握等级 ${data.srsLevel}` : '🆕 新词学习'}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= index ? 'bg-indigo-600 w-4' : 'bg-gray-100 w-2'}`} />
            ))}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 leading-none">{data.word}</h1>
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => playAudio(data.word)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-full hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
              </button>
              <p className="text-sm text-gray-400 font-medium">{data.phonetic}</p>
              <button 
                onMouseDown={startRecording} onMouseUp={stopRecording}
                onTouchStart={startRecording} onTouchEnd={stopRecording}
                className={`ml-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500'}`}
              >
                {isRecording ? '正在录音...' : '按住跟读'}
              </button>
            </div>
          </div>
          <div className="text-lg font-black text-indigo-700 bg-indigo-50 px-4 py-1.5 rounded-2xl">{data.translation}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4 no-scrollbar">
        {evalResult && (
          <div className="bg-indigo-600 text-white p-3 rounded-2xl animate-bounce-in shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase">AI 评分</span>
              <span className="text-lg font-black">{evalResult.score}</span>
            </div>
            <p className="text-[10px] opacity-90 leading-tight">{evalResult.feedback}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 relative h-44 shadow-inner flex items-center justify-center">
          {loadingImage ? <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /> : <img src={imageUrl || ''} className="w-full h-full object-cover" />}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 p-3"><p className="text-white text-xs font-bold">谐音: <span className="text-yellow-400">{data.homophone}</span></p></div>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-amber-900 text-xs leading-relaxed"><span className="font-black">💡 记忆：</span>{data.mnemonic}</p>
        </div>

        <div className="p-1 relative group">
          <button onClick={() => playAudio(data.example)} className="absolute right-0 top-0 p-2 text-indigo-400 hover:text-indigo-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg></button>
          <h3 className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">Scenario Example</h3>
          <p className="text-gray-800 text-xs font-bold leading-relaxed pr-8">{data.example}</p>
          <p className="text-gray-500 text-[10px] italic mt-1">{data.exampleTranslation}</p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-gray-800 font-black text-xs mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span> 讨论区
          </h4>
          <div className="space-y-4 pb-2">
            {comments.map(c => renderComment(c))}
          </div>
          
          <div className="mt-4 bg-white sticky bottom-0 pt-2 pb-4">
            {replyTarget && (
              <div className="flex justify-between items-center bg-indigo-50 px-3 py-1.5 rounded-t-xl border-x border-t border-indigo-100 animate-slide-up">
                <span className="text-[8px] font-bold text-indigo-600 uppercase">正在回复 @{replyTarget.user}</span>
                <button onClick={() => setReplyTarget(null)} className="text-indigo-400 hover:text-indigo-600">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input 
                ref={inputRef}
                type="text" 
                placeholder={replyTarget ? `回复 @${replyTarget.user}...` : "我有个神记忆法..."} 
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                className={`flex-1 bg-gray-50 border-none px-4 py-2.5 text-[10px] font-bold outline-none ring-1 ring-gray-100 focus:ring-indigo-200 transition-all shadow-inner ${replyTarget ? 'rounded-b-xl rounded-t-none' : 'rounded-xl'}`}
              />
              <button 
                onClick={handleAddComment}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black active:scale-95 transition-all shadow-lg shadow-indigo-100"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100 flex gap-4">
        <button onClick={() => onResponse(false)} className="flex-1 bg-rose-50 text-rose-600 font-black py-4 rounded-[1.5rem] text-sm active:scale-95 transition-all">记不住</button>
        <button onClick={() => onResponse(true)} className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-[1.5rem] text-sm shadow-xl active:scale-95 transition-all">太简单了</button>
      </div>
    </div>
  );
};

export default WordCard;
