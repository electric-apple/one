import useShadowContainer from '~contents/hooks/useShadowContainer.ts';
import ReactDOM from 'react-dom';
import indexText from 'data-text:~/css/index.css';
import { useSize } from 'ahooks';
import useWaitForElement from '~contents/hooks/useWaitForElement.ts';
import { useStorage } from '@plasmohq/storage/dist/hook';
import { useEffect } from 'react';

export function SideBarIcon() {
  const shadowRoot = useShadowContainer({
    selector: 'a[data-testid="AppTabBar_Profile_Link"]',
    styleText: indexText,
    useSiblings: true,
    siblingsStyle: 'width:auto;height:auto;max-width:100%;min-width:50.25px'
  });
  const [showPanel, setShowPanel] = useStorage('@settings/showPanel', true);
  const sidebar = useWaitForElement('nav[role]');
  const size = useSize(sidebar?.parentElement);
  const width = size?.width || 0;
  const isExpanded = width > 72;
  useEffect(() => {
    if (!shadowRoot) return;
    const header = document.querySelector('header[role]') as HTMLElement | null;
    const nav = document.querySelector('nav[role]') as HTMLElement | null;
    const navP1 = nav?.parentElement as HTMLElement | null;
    const navP2 = navP1?.parentElement as HTMLElement | null;
    const navP3 = navP2?.parentElement as HTMLElement | null;

    if (!header || !navP2 || !navP3) return;
    const addStylesIfNeeded = () => {
      if (!navP3.classList.contains('hideScrollbar')) {
        const styleEl = document.createElement('style');
        styleEl.textContent = indexText;
        header.appendChild(styleEl);
        navP3.classList.add('hideScrollbar');
      }
    };
    const observer = new MutationObserver(() => {
      requestAnimationFrame(addStylesIfNeeded);
    });
    if (header) {
      observer.observe(header, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    }
    addStylesIfNeeded();
    return () => {
      observer.disconnect();
    };
  }, [shadowRoot]);
  if (!shadowRoot) return null;
  return ReactDOM.createPortal(
    <div className={`sidebarItem ${isExpanded ? 'sidebarItemExpanded' : ''}`} onClick={() => {
      setShowPanel(!showPanel).then(r => r)
    }}>
      <img
        className="sidebarIcon"
        src="https://lh3.googleusercontent.com/07rhYmrhU7LpG-dQmEo8526pwp2gWaOWDoKEQLndhLxMqmXKKDMW3ZmAEVFLaG9c5iXN0GjWdl4x0mUnCHdnAkxGgg=s120"
        alt=""
      />
      {isExpanded && (
        <span className="sidebarText">XHunt</span>
      )}
    </div>,
    shadowRoot
  );
}
