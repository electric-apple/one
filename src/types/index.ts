export interface KolFollower {
  username: string;
  name: string;
  avatar: string;
}

export interface DeletedTweet {
  id: string;
  text: string;
  createTime: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  viewCount: number;
}

export interface TokenMention {
  text?: string;
  value?: number;
  token?: string;
  chain?: string;
  tweetId?: string;
  recordTime?: string;
  username?: string;
  mentionCount?: number;
  symbol?: string;
  name?: string;
  image?: string;
  link?: string;
  source?: string;
  dateAdded?: string;
  period?: number;
  openPrice?: number;
  maxPrice?: number;
  nowPrice?: number;
  maxProfit?: number;
  nowProfit?: number;
  maxFDV?: number;
  belowLimit?: boolean;
}

export interface TokenPeriodData {
  winRate: number | null;
  maxProfitAvg: number | null;
  nowProfitAvg: number | null;
  winRatePct: number;
  maxProfitAvgPct: number;
  nowProfitAvgPct: number;
  tokenMentions: TokenMention[];
}

export interface KolData {
  basicInfo?: {
    isKol: boolean;
    classification: string;
  };
  kolFollow: {
    globalKolFollowersCount?: number;
    cnKolFollowersCount?: number;
    topKolFollowersCount?: number;
    globalKolFollowers?: KolFollower[];
    cnKolFollowers?: KolFollower[];
    topKolFollowers?: KolFollower[];
    kolRank?: number;
    kolRank20W?: number;
    isCn: boolean;
    isProject: boolean;
    kolCnRank?: number;
    kolProjectRank?: number;
    kolCnRankChange: {
      day1: number | null;
      day7: number | null;
      day30: number | null;
    }
    kolProjectRankChange: {
      day1: number | null;
      day7: number | null;
      day30: number | null;
    },
    kolRankChange: {
      day1: number | null;
      day7: number | null;
      day30: number | null;
    }
  };
  kolTokenMention: {
    day7: TokenPeriodData;
    day30: TokenPeriodData;
    day90: TokenPeriodData;
  };
  mbti?: {
    en: MBTIData,
    cn: MBTIData,
  };
}

export type KolTabType = 'global' | 'cn' | 'top100';
export type TokenPeriodType = 'day7' | 'day30' | 'day90';

// 定义单个投资人信息
export interface Investor {
  avatar: string;
  lead_investor: boolean;
  name: string;
  twitter: string;
}

// 定义投资人组，包含一个投资人数组和总融资额
export interface InvestorsGroup {
  investors: Investor[];
  total_funding: number;
}

// 定义整体数据结构，包含 "invested" 和 "investor" 两个字段
export interface InvestmentData {
  invested: InvestorsGroup;
  investor: InvestorsGroup;
}

export interface AccountsResponse {
  accounts: NameHistory[];
}

export interface NameHistory {
  id: number;
  id_str: string;
  screen_names: {
    [key: string]: [string, string];
  };
}

export interface MBTIData {
  mbti: string;
  keyword: string[];
  explanation: string;
}


interface HoverTweet {
  text: string;
  createTime: string;
  link: string;
  username: string;
  tweetId: string;
  avatar: string;
  name: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  viewCount: number;
}

export interface TokenAnalysisData {
  tweets: HoverTweet[];
  answer: string;
  answerDS: string;
  isJson: boolean;
  fromAllKol: boolean;
}

