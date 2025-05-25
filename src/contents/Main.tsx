import { useStorage } from '@plasmohq/storage/hook';

require('events').defaultMaxListeners = 15;
import cssText from 'data-text:~/css/style.css'
import tipCss from 'data-text:~/css/tippy.css'
import scaleCss from 'data-text:~/css/scale.css'
import useMainData from '~contents/hooks/useMainData.ts';
import { FixedTwitterPanel } from '~compontents/area/FixedTwitterPanel.tsx';
import { NameRightData } from '~compontents/area/NameRightData.tsx';
import { FollowedRightData } from '~compontents/area/FollowedRightData.tsx';
import { SideBarIcon } from '~compontents/area/SideBarIcon.tsx';
import useFixUIZIndex from '~contents/hooks/useFixSectionZIndex.ts';
import useTwitterAuthCallback from '~contents/hooks/useTwitterAuthCallback.ts';
import { GlobalTips } from '~compontents/area/GlobalTips.tsx';
import ErrorBoundary from '~compontents/ErrorBoundary.tsx';
import { useVerifyLoginStatus } from '~contents/hooks/useVerifyLoginStatus.ts';
import { TickerTips } from '~compontents/area/TickerTips.tsx';

export const config = {
  matches: ['https://x.com/*']
}
export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText + tipCss + scaleCss;
  return style
}
const Main = () => {
  const [theme] = useStorage('@xhunt/theme', 'dark');
  /** ==== step-1.前端验证登录状态 **/
  useVerifyLoginStatus();
  /** ==== step0.处理推特登录回来拿到code请求后端进行登录 **/
  useTwitterAuthCallback();
  /** ==== step1.为了在x.com增加一些自定义位置弹框，修复网页zIndex层级关系,避免元素遮挡问题=== **/
  useFixUIZIndex();
  /** ==== step2.全局统一获取数据,内部useCurrentUrl已做性能优化 === **/
  const mainData = useMainData();

  if (!mainData.currentUrl.includes('x.com')) return <></>;
  return (
    <div data-theme={theme} style={{
      display: 'contents',
    }}>
      {/*【全局右上角】悬浮框*/}
      <ErrorBoundary>
        <FixedTwitterPanel {...mainData} />
      </ErrorBoundary>

      {/*【推特名字下面】获投资/已投资/改名等信息*/}
      <ErrorBoundary>
        <NameRightData {...mainData} />
      </ErrorBoundary>

      {/*【推特关注数据下面】，关注者质量排名 + 评论专区*/}
      <ErrorBoundary>
        <FollowedRightData {...mainData} />
      </ErrorBoundary>

      {/*【左侧导航栏】xHunt icon控制显隐*/}
      <ErrorBoundary>
        <SideBarIcon />
      </ErrorBoundary>

      {/*【网页下面正中间】全局toast提示*/}
      <ErrorBoundary>
        <GlobalTips />
      </ErrorBoundary>

      {/*【鼠标hover位置】鼠标hover后的悬浮框关于ticker分析*/}
      <ErrorBoundary>
        <TickerTips />
      </ErrorBoundary>
    </div>
  )
}

export default Main;
