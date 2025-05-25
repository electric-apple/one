import { useStorage } from '@plasmohq/storage/hook';
// import { useGlobalTips } from '~compontents/area/GlobalTips.tsx';
import useFetchTwId from '~contents/hooks/useFetchTwId.ts';
import { useEffect } from 'react';

export const useVerifyLoginStatus = () => {
  const [token, setToken] = useStorage('@xhunt/token', '');
  const [user, setUser] = useStorage<{
    avatar: string;
    displayName: string;
    username: string;
    id: string;
    twitterId: string;
  } | null | ''>('@xhunt/user', null);
  // const [, setTips] = useGlobalTips();
  const { data: twId, loading: loadingTwId } = useFetchTwId();
  useEffect(() => {
    if (!loadingTwId && user && token) {
      if(!user.twitterId || !twId?.includes(user.twitterId)) {
        setToken('');
        setUser('');
        // setTips("登录已过期");
      }
    }
  }, [loadingTwId, user, token]);
}
