import { useEffect, useState } from 'react';
import { useWeb3TickerFromHover } from '~contents/hooks/useWeb3TickerFromHover.ts';
import TokenAnalysisPanel from '~/compontents/TokenAnalysisPanel.tsx';
import { useRequest } from 'ahooks';
import { fetchTokenAnalysisInfo } from '~contents/services/api.ts';

export function TickerTips() {
  const { isVisible, lastValidRect, setMouseOverPanel, hoveringTicker, setIsVisible } = useWeb3TickerFromHover(1000);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const { data, run: fetchData, } = useRequest(() => fetchTokenAnalysisInfo(hoveringTicker), {
    refreshDeps: [hoveringTicker],
    debounceWait: 300,
    manual: true,
    debounceLeading: true,
    debounceTrailing: false,
  });
  useEffect(() => {
    if (!lastValidRect) {
      setPosition(null);
      return;
    }

    const panelWidth = 480;
    const panelHeight = 460;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = lastValidRect.left;
    let top = lastValidRect.bottom;

    if (left + panelWidth > viewportWidth) {
      left = Math.max(10, viewportWidth - panelWidth);
    }

    if (top + panelHeight > viewportHeight) {
      top = Math.max(10, lastValidRect.top - panelHeight);
    }

    setPosition({ left, top });
    fetchData();
  }, [lastValidRect]);

  if (!isVisible || !position || !hoveringTicker) return null;

  return (
    <div
      className="ticker-tips"
      style={{
        position: 'fixed',
        left: `${position.left}px`,
        top: `${position.top}px`,
        zIndex: 9999,
        width: '480px',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
      }}
      onMouseEnter={() => setMouseOverPanel(true)}
      onMouseLeave={() => setMouseOverPanel(false)}
    >
      <TokenAnalysisPanel token={hoveringTicker} data={data} isLoading={!data} setIsVisible={setIsVisible} />
    </div>
  );
}
