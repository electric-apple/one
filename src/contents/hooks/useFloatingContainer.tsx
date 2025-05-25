import React, {
  useState,
  useRef,
  useCallback,
  forwardRef,
  useMemo,
  useImperativeHandle,
} from 'react';
import {
  useEventListener,
  useUpdateEffect,
  useLatest, useDebounceFn,
} from 'ahooks';

interface FloatingContainerOptions {
  offsetX?: number;
  offsetY?: number;
  maxWidth?: string;
  maxHeight?: string;
}

interface UseFloatingContainerReturn {
  Container: React.ForwardRefExoticComponent<
    React.HTMLProps<HTMLDivElement> & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLDivElement>
  >;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  isVisible: boolean;
}

export function useFloatingContainer(
  targetRef: React.RefObject<HTMLElement>,
  options: FloatingContainerOptions = {}
): UseFloatingContainerReturn {
  try {
    const {
      offsetX = 10,
      offsetY = 10,
      maxWidth = '80vw',
      maxHeight = '80vh',
    } = options;
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const latestState = useLatest({ isVisible });

    const _updatePosition = useCallback(() => {
      try {
        const { current: target } = targetRef;
        const { current: container } = containerRef;
        const { isVisible } = latestState.current;

        if (!target || !container || !isVisible) return;

        const targetRect = target.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const isTargetVisible =
          targetRect.top < viewportHeight &&
          targetRect.bottom > 0 &&
          targetRect.left < viewportWidth &&
          targetRect.right > 0;

        if (!isTargetVisible) {
          setIsVisible(false);
          return;
        }

        let left = targetRect.left + offsetX;
        let top = targetRect.top + offsetY;

        const adjustPosition = (pos: number, size: number, elementSize: number) =>
          Math.min(Math.max(pos, 0), Math.max(0, size - elementSize));

        left = adjustPosition(left, viewportWidth, containerRect.width);
        top = adjustPosition(top, viewportHeight, containerRect.height);

        container.style.left = `${left}px`;
        container.style.top = `${top}px`;
        container.style.opacity = '1';
      } catch (err) {
        console.log(err, 'updatePosition');
      }
    }, [offsetX, offsetY, targetRef, latestState]);

    const { run: updatePosition } = useDebounceFn(() => {
      _updatePosition();
    }, {
      wait: 100,
      trailing: true,
      leading: false,
    })

    // 容器尺寸变化时更新位置
    useUpdateEffect(() => {
      if (isVisible) {
        updatePosition();
      }
    }, [containerRef.current?.offsetWidth, containerRef.current?.offsetHeight]);

    // 监听滚动和窗口大小变化
    useEventListener('scroll', () => {
      if (rafIdRef.current) return;
      rafIdRef.current = requestAnimationFrame(() => {
        updatePosition();
        rafIdRef.current = null;
      });
    }, {
      target: document,
    });

    useEventListener('resize', updatePosition);
    // 显示/隐藏逻辑
    const toggleVisibility = useCallback((visible: boolean) => {
      setIsVisible(visible);
      if (visible) {
        updatePosition();
      }
    }, [updatePosition]);
    // 创建 Container 组件
    const Container = useMemo(
      () => {
        return forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
          (props, ref) => {
            const { children, ...rest } = props;

            useImperativeHandle(ref, () => containerRef.current!);

            return <>
              <div
                {...rest}
                ref={(node) => {
                  containerRef.current = node;
                }}
                style={{
                  position: 'fixed',
                  zIndex: 9999,
                  maxWidth,
                  maxHeight,
                  overflow: 'auto',
                  display: isVisible ? 'block' : 'none',
                  pointerEvents: isVisible ? 'auto' : 'none',
                  opacity: 0,
                }}
                className={'shadow-[0_8px_24px_rgba(0,0,0,0.25)] theme-border rounded-lg'}
              >
                {children || ''}
              </div>
              <div style={{
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                zIndex: 9998,
                backgroundColor: 'transparent',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
                cursor: 'default',
                display: isVisible ? 'block' : 'none',
              }} onClick={() => {
                toggleVisibility(false);
              }} />
            </>
          }
        )
      },
      [isVisible, maxWidth, maxHeight]
    );
    return {
      Container,
      show: () => toggleVisibility(true),
      hide: () => toggleVisibility(false),
      toggle: () => toggleVisibility(!isVisible),
      isVisible,
    };
  } catch (err) {
    return {
      // @ts-ignore
      Container: <div></div>,
      show: () => undefined,
      hide: () => undefined,
      toggle: () => undefined,
      isVisible: false,
    };
  }

}

const _useFloatingContainer = () => <div style={{
  display: 'none',
  opacity: 0
}}>1</div>;
export default _useFloatingContainer;
