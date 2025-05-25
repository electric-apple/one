import { useState, useEffect } from 'react';

/**
 * 在页面加载后 1 秒自动获取 twid Cookie 的 Hook
 * @returns { data: string | null; loading: boolean }
 */
function useFetchTwId() {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1 秒后执行
    const timer = setTimeout(() => {
      const twid = document.cookie
      .split('; ')
      .find(row => row.startsWith('twid='))
      ?.split('=')[1] || null;

      setData(twid);
      setLoading(false);
    }, 1000);

    // 清理定时器
    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
}

export default useFetchTwId;
