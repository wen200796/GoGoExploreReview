export class reviewDetail {
  starRating: number | null = null; // 星星數
  relativeTime: string | null = null; // 相對時間
  absoluteTime: string | null = null; // 換算絕對時間
  hasContent: boolean = false; // 是否有評論內容
  content: string | null = null; // 評論文字
  isContentCollapsed: boolean = false; // 評論是否被收合內容
  hasReply: boolean = false; // 是否有評論回覆
  replyContent: string | null = null; // 評論回覆
  likeCount: number | null = null; // 評論案讚數
  hasPhotos: boolean = false; // 是否有評論照片
  photos: string[] = []; // 評論照片

}