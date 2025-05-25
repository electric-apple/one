import numeral from 'numeral';

export const config = {
  matches: ['https://x.com/*']
}

/**
 * 从给定的 URL 中提取用户名
 * @param url - 完整的 URL 字符串，例如 "https://x.com/aixbt_agent"
 * @returns 提取的用户名，如果无法提取或域名不是 x.com 或是导航页则返回空字符串
 */
export function extractUsernameFromUrl(url: string): string {
  try {
    // 使用 URL 构造函数解析 URL
    const parsedUrl = new URL(url);

    // 检查域名是否为 x.com
    if (parsedUrl.hostname !== 'x.com') {
      return '';
    }

    // 获取路径部分（去掉开头的斜杠）
    const path = parsedUrl.pathname;

    // 去掉路径开头的斜杠并分割路径
    const segments = path.split('/').filter(segment => segment.length > 0);
    const path1Arg = ['with_replies', 'highlights', 'media', 'superfollows']

    if ((segments || [])?.length > 1 && !path1Arg.includes(segments[1])) {
      return '';
    }

    // 定义已知的导航页面路径（黑名单）
    const navigationPages = new Set([
      'home',          // 首页
      'explore',       // 探索页
      'notifications', // 通知页
      'messages',      // 消息页
      'search',        // 搜索页
      'settings',      // 设置页
      'i',             // 内部页面（如设置子页面）
      'logout',        // 登出
    ]);

    // 如果路径的第一个部分是导航页面，则返回空字符串
    const firstSegment = segments[0];
    if (navigationPages.has(firstSegment)) {
      return '';
    }

    // 返回路径的第一个有效部分作为用户名
    return firstSegment || '';
  } catch (error) {
    // 如果 URL 格式无效，捕获错误并返回空字符串
    console.error('Invalid URL:', error);
    return '';
  }
}

export const formatPercentage = (num: number | null | undefined) => {
  if (!num) return 'N/A';
  return numeral(num).format('0.0%');
};

export const formatNumber = (num: number) => {
  return numeral(num).format('0.[0]a').toUpperCase();
};

export const formatFunding = (amount: number) => {
  return String(numeral(amount).format('$0.0a')).toLocaleUpperCase();
};

/**
 * 判断用户是否使用中文
 * @returns {boolean} 如果用户的语言设置为中文，返回 true；否则返回 false。
 */
export function isUserUsingChinese() {
  // 获取首选语言 (兼容旧版浏览器)
  const preferredLanguage = navigator.language || 'en';

  // 获取所有语言偏好 (兼容旧版浏览器)
  const languagePreferences = Array.isArray(navigator.languages) ? navigator.languages : [preferredLanguage];

  // 检测是否包含中文语言代码
  return languagePreferences.some(lang => /^zh/i.test(lang));
}

export function getMBTIColor(mbti: string) {
  const colors: { [key: string]: string } = {
    'ENTJ': 'text-purple-400',
    'INTJ': 'text-blue-400',
    'ENTP': 'text-green-400',
    'INTP': 'text-yellow-400',
    'ENFJ': 'text-pink-400',
    'INFJ': 'text-red-400',
    'ENFP': 'text-orange-400',
    'INFP': 'text-teal-400'
  };
  return colors[mbti] || 'text-blue-400';
};

export function openNewTab(url: string) {
  const win = window.open(url, '_blank');
  if (!win || win.closed) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer'; // 安全设置
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export type URLParams = {
  [key: string]: string | string[];
};

/**
 * 解析 URL 查询参数为对象
 *
 * @param url - 包含查询参数的完整 URL 或仅查询字符串部分
 * @returns 解析后的参数对象
 */
export function parseURLParams(url: string): URLParams {
  // 提取查询字符串部分
  const queryString = url.split('?')[1] || url;

  // 创建 URLSearchParams 对象
  const params = new URLSearchParams(queryString);
  const result: URLParams = {};

  for (const [key, value] of params.entries()) {
    if (!result[key]) {
      // 第一次出现，直接赋值
      result[key] = value;
    } else {
      const existingValue = result[key];
      if (Array.isArray(existingValue)) {
        // 已是数组，push 新值
        existingValue.push(value);
      } else {
        // 首次重复，转为数组
        result[key] = [existingValue, value];
      }
    }
  }

  return result;
}


/**
 * 计算标签字符长度（中文按 4 字符计算）
 */
export function calculateTagCharLength(tag: string) {
  if (typeof tag !== 'string') return 0;
  let length = 0;
  for (let i = 0; i < tag.length; i++) {
    const charCode = tag.charCodeAt(i);
    // 判断是否是汉字或宽字符（CJK Unicode）
    if ((charCode >= 0x4e00 && charCode <= 0x9fa5) || // 中文
      charCode === 0x300c || charCode === 0x300d || // 「」
      charCode === 0x300e || charCode === 0x300f || // 《》
      charCode === 0x3010 || charCode === 0x3011) { // 【】
      length += 4;
    } else if (charCode > 127 || charCode === 94) { // 其他宽字符或 ^
      length += 2;
    } else {
      length += 1;
    }
  }
  return length;
}
