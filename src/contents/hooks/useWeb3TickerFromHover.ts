import { useStableHover } from './useStableHover';
import { useState, useEffect, useRef } from 'react';
import { useLatest } from 'ahooks';

export function useWeb3TickerFromHover(delay = 800) {
  const { textContent, rect } = useStableHover(delay);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [hoveringTicker, setHoveringTicker] = useState<string>('');
  const hoveringTickerRef = useLatest(hoveringTicker);
  const activeTickerRef = useRef<string>('');
  const [lastValidRect, setLastValidRect] = useState<DOMRect | undefined>();
  const isMouseOverPanelRef = useRef(false);
  const cleanupTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (isMouseOverPanelRef.current) return;
    const match = textContent.match(/\$(?=[a-zA-Z0-9_]*[a-zA-Z])[a-zA-Z0-9_]+\b/);
    const ticker = match ? match[0] : '';

    setHoveringTicker(ticker);
    rect && setLastValidRect(rect);
    if (ticker) {
      activeTickerRef.current = ticker;
      setIsVisible(true);
    } else {
      scheduleHide(true);
    }
  }, [textContent, rect]);

  useEffect(() => {
    if (!isVisible) {
      setHoveringTicker('');
    }
  }, [isVisible]);

  // 延迟关闭逻辑（800ms 后强制判断是否仍在 hover）
  const scheduleHide = (now: boolean = false) => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }

    cleanupTimeoutRef.current = window.setTimeout(() => {
      if (!isMouseOverPanelRef.current && !hoveringTickerRef.current) {
        activeTickerRef.current = '';
        setIsVisible(false);
      }
    }, now ? 0 : 1000);
  };

  // 暴露面板 hover 状态控制
  const setMouseOverPanel = (value: boolean) => {
    isMouseOverPanelRef.current = value;
    if (!value && !hoveringTickerRef.current) {
      scheduleHide();
    }
  };

  return {
    isVisible,
    lastValidRect,
    setMouseOverPanel,
    hoveringTicker,
    setIsVisible
  };
}
