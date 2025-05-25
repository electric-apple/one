import { useDebounceEffect, useLockFn, useRequest } from 'ahooks';
import { fetchDelTwitterInfo, fetchRootDataInfo, fetchTwitterInfo, fetchTwRenameInfo } from '~contents/services/api.ts';
import { useEffect, useState } from 'react';
import { extractUsernameFromUrl } from '~contents/utils';
import useCurrentUrl from '~contents/hooks/useCurrentUrl.ts';
import { AccountsResponse, DeletedTweet, InvestmentData, KolData } from '~types';
import { getHandeReviewInfo, updateUserInfo } from '~contents/services/review.ts';
import { ReviewStats, UserInfo } from '~types/review.ts';
import { useStorage } from '@plasmohq/storage/hook';

export interface MainData {
  currentUrl: string;
  userId: string;
  deletedTweets: DeletedTweet[];
  twInfo: KolData | null;
  loadingTwInfo: boolean;
  loadingDel: boolean;
  error: Error | undefined;
  rootData: InvestmentData | null;
  loadingRootData: boolean;
  renameInfo: AccountsResponse | null;
  loadingRenameInfo: boolean;
  reviewInfo: ReviewStats | null;
  loadingReviewInfo: boolean;
  refreshAsyncReviewInfo: () => Promise<ReviewStats | undefined>;
  userInfo: UserInfo | null;
  loadingUserInfo: boolean;
  refreshAsyncUserInfo: () => Promise<UserInfo | undefined>;
}

const useMainData = (): MainData => {
  const currentUrl = useCurrentUrl();
  const [userId, setUserId] = useState('');
  const [reviewOnlyKol] = useStorage('@xhunt/reviewOnlyKol', true);
  const [token] = useStorage('@xhunt/token', '');
  const { data: deletedTweets = [] as DeletedTweet[], run: fetchDelData, loading: loadingDel } = useRequest(() => fetchDelTwitterInfo(userId), {
    refreshDeps: [userId],
    debounceWait: 300,
    manual: true,
    debounceLeading: true,
    debounceTrailing: false,
  });
  const { data: twInfo = null, run: fetchTwitterData, loading: loadingTwInfo, error } = useRequest(() => fetchTwitterInfo(userId), {
    refreshDeps: [userId],
    debounceWait: 300,
    manual: true,
    debounceLeading: true,
    debounceTrailing: false,
  });

  const { data: rootData = null, run: fetchRootData, loading: loadingRootData } = useRequest(() => fetchRootDataInfo(userId), {
    refreshDeps: [userId],
    debounceWait: 300,
    manual: true,
    debounceLeading: true,
    debounceTrailing: false,
  });

  const { data: renameInfo = null, run: fetchRenameInfo, loading: loadingRenameInfo } = useRequest(() => fetchTwRenameInfo(userId), {
    refreshDeps: [userId],
    debounceWait: 300,
    manual: true,
    debounceLeading: true,
    debounceTrailing: false,
  });
  const { data: reviewInfo = null, run: fetchReviewInfo, loading: loadingReviewInfo, refreshAsync: refreshAsyncReviewInfo } = useRequest(() => getHandeReviewInfo(userId, reviewOnlyKol), {
    refreshDeps: [userId, reviewOnlyKol],
    debounceWait: 300,
    manual: true,
    debounceLeading: true,
    debounceTrailing: false,
  });
  const { data: userInfo = null, run: fetchUserInfo, loading: loadingUserInfo, refreshAsync: refreshAsyncUserInfo } = useRequest(() => updateUserInfo(), {
    refreshDeps: [token],
    debounceWait: 300,
    manual: true,
    debounceLeading: true,
    debounceTrailing: false,
  });

  const loadData = useLockFn(async () => {
    if (!userId || String(userId).length <= 4) return;
    fetchDelData();
    fetchTwitterData();
    fetchRootData();
    fetchRenameInfo();
    fetchReviewInfo();
  });
  useEffect(() => {
    if (!userId || String(userId).length <= 4) return;
    fetchReviewInfo();
  }, [reviewOnlyKol, token]);
  useEffect(() => {
    loadData().then(r => r);
  }, [userId]);
  useEffect(() => {
    fetchUserInfo();
  }, [])
  useDebounceEffect(() => {
    const uid = extractUsernameFromUrl(currentUrl);
    setUserId(uid);
  }, [currentUrl], { wait: 300 });
  return {
    currentUrl,
    userId,
    deletedTweets,
    twInfo,
    loadingTwInfo,
    loadingDel,
    error,
    rootData,
    loadingRootData,
    renameInfo,
    loadingRenameInfo,
    reviewInfo,
    loadingReviewInfo,
    refreshAsyncReviewInfo,
    userInfo,
    loadingUserInfo,
    refreshAsyncUserInfo,
  }
}

export default useMainData;
