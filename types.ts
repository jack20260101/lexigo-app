
export interface WordData {
  word: string;
  phonetic: string;
  translation: string;
  homophone: string;
  mnemonic: string;
  example: string;
  exampleTranslation: string;
  imagePrompt: string;
  imageUrl?: string;
  errorCount: number;
  lastLearned: string;
  mastered: boolean;
  srsLevel: number;
  nextReviewDate: string;
}

export interface DayLesson {
  words: WordData[];
  summarySentence: string;
}

export interface DailySentence {
  english: string;
  chinese: string;
  author: string;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  likes: number;
  timestamp: string;
  replies?: Comment[];
  replyTo?: string;
  isLiked?: boolean;
}

export const LEVEL_LABELS: Record<string, string> = {
  'Primary': '小学必备', 'Junior': '初中通关', 'Senior': '高中核心',
  'CET-4': '大学四级', 'CET-6': '大学六级', 'Postgrad': '考研必胜',
  'IELTS': '雅思核心', 'TOEFL': '托福高频', 'GRE': 'GRE词霸', 'TEM-8': '专业八级',
  'GMAT': 'GMAT精英', 'SAT': 'SAT高分', 'TOEIC': '托业实战', 'BEC': '商务英语',
  'Oxford3000': '牛津3000', 'NCE-1': '新概念一', 'NCE-2': '新概念二', 'NCE-3': '新概念三',
  'Business': '外企商务', 'Tech': '程序员英语', 'Medical': '医学日常',
  'Law': '法律正义', 'Game': '电竞术语', 'Pet': '萌宠生活',
  'Movie': '追剧达人', 'Dating': '浪漫约会', 'Travel': '出境旅游',
  'Gym': '运动健身', 'Foodie': '美食探店', 'Nomad': '数字游民',
  'News': '外刊时政', 'Art': '艺术鉴赏', 'Finance': '财富自由', 'Science': '硬核科学',
  'Literature': '文学经典', 'Fashion': '时尚潮流', 'History': '历史回响', 
  'Psychology': '心理洞察', 'Architecture': '建筑美学', 'Music': '乐理殿堂'
};

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isLoggedIn: boolean;
  medals: string[]; // 新增：勋章系统
}

export interface AppStats {
  streak: number;
  totalWords: number;
  arenaHighScore: number;
  unlockedBadges: string[];
  history: { date: string; count: number; accuracy: number }[];
  dailyGoal: number;
  totalLikesReceived: number; // 新增：获赞总数
}
