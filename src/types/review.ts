export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  tagCloud: Array<{
    text: string;
    value: number;
  }>;
  topReviewers: Array<{
    id: string;
    avatar: string;
    name: string;
  }>;
  currentUserReview?: {
    rating: number;
    tags: string[];
    note: string;
  };
  defaultTags: {
    kol: string[],
    project: string[],
  }
  isKol?: boolean;
  allTagCount?: number;
}

export interface UserInfo {
  username: string;
  displayName: string;
  avatar: string;
  twitterId: string,
  xPoints: number;
}
