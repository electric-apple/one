import { useEffect, useState, useRef } from 'react';

// 模块级变量，跨 Hook 实例共享
let currentUrlRef = { current: window.location.href };
let intervalRef = { current: null as number | null };
let visibilityListenerAdded = false;
let observers = new Set<(url: string) => void>();
let refCount = 0;

const notifyObservers = (newUrl: string) => {
  currentUrlRef.current = newUrl;
  observers.forEach((cb) => cb(newUrl));
};

const checkUrl = () => {
  const newUrl = window.location.href;
  if (newUrl !== currentUrlRef.current) {
    notifyObservers(newUrl);
  }
};

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    checkUrl();
  }
};

const useCurrentUrl = () => {
  const [url, setUrl] = useState(currentUrlRef.current);

  // 每个 Hook 实例注册自己的更新函数
  const observerRef = useRef<(url: string) => void>(() => {});

  // 注册观察者
  useEffect(() => {
    observerRef.current = (newUrl) => setUrl(newUrl);
    observers.add(observerRef.current);

    // 首次挂载时增加引用计数
    refCount++;
    if (refCount === 1) {
      // 启动定时器
      intervalRef.current = window.setInterval(checkUrl, 500);
      // 添加 visibilitychange 监听
      document.addEventListener('visibilitychange', handleVisibilityChange);
      visibilityListenerAdded = true;
    }

    return () => {
      // 卸载时移除观察者
      observers.delete(observerRef.current);
      refCount--;

      // 最后一个组件卸载时清理资源
      if (refCount === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (visibilityListenerAdded) {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          visibilityListenerAdded = false;
        }
      }
    };
  }, []);

  return url;
};

export default useCurrentUrl;
