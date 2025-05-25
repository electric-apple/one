import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Eye, MessageCircle, Heart, Repeat } from 'lucide-react';
import { DeletedTweet } from '~types';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { useI18n } from '~contents/hooks/i18n.ts';

interface DeletedTweetsSectionProps {
  deletedTweets: DeletedTweet[];
  loadingDel: boolean;
  isHoverPanel?: boolean;
}

export function DeletedTweetsSection({ deletedTweets, loadingDel, isHoverPanel = false }: DeletedTweetsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(isHoverPanel);
  const { t } = useI18n();
  const formatNumber = (num: number | undefined) => {
    return numeral(num || 0).format('0.[0]a').toUpperCase();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = dayjs(dateString);
    const now = dayjs();
    const hoursAgo = now.diff(date, 'hour');

    if (hoursAgo < 24) {
      return date.format('h:mm A');
    } else {
      return date.format('MMM D');
    }
  };

  return (
    <div>
      {!isHoverPanel && <div
        className="p-3 flex items-center justify-between cursor-pointer theme-border"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-400" />
          <h2 className="font-bold text-sm theme-text-primary">{t('deletedTweets')}</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 theme-text-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 theme-text-secondary" />
        )}
      </div>}

      <div className={`${isExpanded ? '' : 'h-0'} overflow-hidden transition-[height] duration-200`}>
        <div className="p-3 space-y-4">
          {loadingDel && <span className="block text-center text-xs theme-text-secondary">{t('loading')}</span>}
          {!deletedTweets?.length && !loadingDel &&
            <span className="block text-center text-xs theme-text-secondary">No data</span>}
          {!loadingDel && deletedTweets?.length ? deletedTweets.map(tweet => (
            <div key={tweet?.id} className="text-xs space-y-1.5">
              <p className="theme-text-primary leading-normal">{tweet?.text}</p>
              <div className="flex items-center gap-4 theme-text-secondary">
                <span>{formatDate(tweet?.createTime)}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {formatNumber(tweet?.viewCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat className="w-3.5 h-3.5" />
                    {formatNumber(tweet?.retweetCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {formatNumber(tweet?.replyCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    {formatNumber(tweet?.likeCount)}
                  </span>
                </div>
              </div>
            </div>
          )) : null}
        </div>
      </div>
    </div>
  );
}

export default {};