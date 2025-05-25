import React, { useEffect, useRef, useState } from 'react';
import { useStorage } from '@plasmohq/storage/hook';

interface StatItemProps {
  label: string;
  value: string | number | React.ReactNode;
  hoverContent: React.ReactNode;
  valueClassName?: string;
  labelClassName?: string;
  className?: string;
}

// 唯一 ID 计数器
let instanceCount = 0;

export function HoverStatItem({
  label,
  value,
  hoverContent,
  valueClassName = '',
  labelClassName = '',
  className = '',
}: StatItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [theme] = useStorage('@xhunt/theme', 'dark');
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // 每个实例拥有一个唯一 ID
  const idRef = useRef<string>(`hover-stat-item-${instanceCount++}`);

  // 广播当前打开的组件 ID
  useEffect(() => {
    if (isHovered) {
      window.dispatchEvent(new CustomEvent('hover-stat-item-opened', { detail: idRef.current }));
    }
  }, [isHovered]);

  // 监听其他组件打开事件
  useEffect(() => {
    const handleOtherHover = (e: any) => {
      const openedId = e.detail;
      if (openedId !== idRef.current) {
        setIsHovered(false);
      }
    };

    window.addEventListener('hover-stat-item-opened', handleOtherHover);

    return () => {
      window.removeEventListener('hover-stat-item-opened', handleOtherHover);
    };
  }, []);

  // 处理 main[role] 的 z-index
  useEffect(() => {
    const mainElement = document.querySelector('main[role]') as HTMLElement;
    if (!mainElement) return;

    if (isHovered) {
      mainElement.style.zIndex = '50';
    } else {
      mainElement.style.zIndex = '0';
    }

    const handleResize = () => {
      mainElement.style.zIndex = '0';
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mainElement.style.zIndex = '0';
      window.removeEventListener('resize', handleResize);
    };
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      data-theme={theme}
      className={`relative mr-6 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={() => {
        requestIdleCallback(() => {
          if (isHovered) return;
          setIsHovered(true);
        })
      }}
      onMouseLeave={() => {
        hoverTimer.current = setTimeout(() => {
          setIsHovered(false);
        }, 100);
      }}
    >
      <div className="flex items-center gap-1 cursor-pointer">
        <span
          className={`text-sm theme-text-primary ${labelClassName}`}
          dangerouslySetInnerHTML={{ __html: label }}
        />
        {typeof value === 'string' ? <span
          className={`text-sm ${valueClassName}`}
          dangerouslySetInnerHTML={{ __html: value || '' }}
        /> : <span className={`text-sm ${valueClassName}`}>
          {value}
        </span>}
      </div>

      {/* Hover Panel Container */}
      {isHovered && hoverContent && (
        <div
          data-theme={theme}
          className="absolute bottom-full left-1/2 -translate-x-1/2 w-max max-w-[320px] z-50"
          onMouseEnter={() => {
            clearTimeout(hoverTimer.current);
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            hoverTimer.current = setTimeout(() => {
              setIsHovered(false);
            }, 100);
          }}
        >
          {/* Panel Content */}
          <div className="theme-bg-secondary theme-text-primary rounded-lg shadow-lg theme-border border p-1 -translate-y-2">
            {hoverContent}
          </div>
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-2 -bottom-[6px] w-3 h-3 rotate-45 theme-bg-secondary theme-border border-t-0 border-l-0"></div>
        </div>
      )}
    </div>
  );
}
