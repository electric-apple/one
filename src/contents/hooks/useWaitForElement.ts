import { useEffect, useState } from 'react';

/**
 * 自定义 Hook：等待指定的 DOM 元素出现
 * @param selector - 要查找的 CSS 选择器
 * @param deps - 可选依赖项数组
 * @param timeout - 等待超时时间（毫秒），默认为 10000ms
 * @returns 匹配到的 HTMLElement 或 null
 */
function useWaitForElement(
  selector: string,
  deps: any[] = [],
  timeout = 10000
): HTMLElement | null {
  // const timeout = 10000;
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const checkForElement = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        setElement(el);
        return true;
      }
      return false;
    };

    // 立即检查一次
    if (checkForElement()) {
      return;
    }

    // 设置 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(() => {
      if (checkForElement()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 设置超时机制
    let timeoutId: number | undefined;
    if (timeout > 0) {
      timeoutId = window.setTimeout(() => {
        observer.disconnect();
      }, timeout);
    }

    // 清理函数
    return () => {
      observer.disconnect();
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [selector, timeout, ...deps]);

  return element;
}

export default useWaitForElement;
