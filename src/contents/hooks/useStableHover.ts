import { useEffect, useState } from 'react';
import { useDebounce, useDebounceFn } from 'ahooks';

// 只获取当前元素自身的文本内容（不包含子元素）
function getDirectTextContent(el: HTMLElement): string {
  return Array.from(el.childNodes)
  .filter(node => node.nodeType === Node.TEXT_NODE)
  .map(node => node.textContent || '')
  .join('')
  .trim();
}

export function useStableHover(delay = 800) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [rect, setRect] = useState<DOMRect | null>(null);
  const elementDebounce = useDebounce(element, { wait: 100 });
  const textContentDebounce = useDebounce(textContent, { wait: 100 });
  const rectDebounce = useDebounce(rect, { wait: 100 });

  const updateHoveredElement = (e: MouseEvent) => {
    const target = document.elementFromPoint(e.clientX, e.clientY);

    if (target instanceof HTMLElement) {
      setElement(target);
      setTextContent(getDirectTextContent(target));
      setRect(target.getBoundingClientRect());
    } else {
      setElement(null);
      setTextContent('');
      setRect(null);
    }
  };

  const { run: debouncedUpdate } = useDebounceFn(updateHoveredElement, {
    wait: delay,
    maxWait: 1000
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      debouncedUpdate(e);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [debouncedUpdate]);

  // 滚动或窗口缩放时更新 rect
  useEffect(() => {
    if (!element) return;

    const updateRect = () => {
      if (element) {
        setRect(element.getBoundingClientRect());
      }
    };

    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [element]);

  return { element: elementDebounce, textContent: textContentDebounce, rect: rectDebounce };
}
