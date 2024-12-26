import { INSTAGRAM_END_POINT } from "./constant";

export const getMediaIds = async (): Promise<{ id: string }[]> => {
  const ACCESS_TOKEN = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
  const res = await fetch(`${INSTAGRAM_END_POINT}/me/media?fields=id&access_token=${ACCESS_TOKEN}`);
  if (!res.ok) {
    throw new Error("미디어를 불러오는데 실패했습니다.");
  }
  const data = await res.json();
  return data.data;
};

interface MediaDetail {
  id: string;
  media_type: string;
  media_url: string;
  timestamp: string;
}

export const getMediaDetail = async ({ instagramId }: { instagramId: string }): Promise<MediaDetail[]> => {
  const ACCESS_TOKEN = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
  const res = await fetch(
    `${INSTAGRAM_END_POINT}/${instagramId}/children?fields=media_url,media_type,timestamp&access_token=${ACCESS_TOKEN}}`
  );
  if (!res.ok) {
    throw new Error("미디어를 불러오는데 실패했습니다.");
  }
  const data = await res.json();
  return data.data;
};
