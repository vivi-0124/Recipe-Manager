import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const maxResults = searchParams.get('maxResults') || '12';

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key is not configured' },
        { status: 500 }
      );
    }

    // YouTube Data API v3を使用して動画を検索
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.append('part', 'snippet');
    searchUrl.searchParams.append('q', `${query} レシピ 作り方`);
    searchUrl.searchParams.append('type', 'video');
    searchUrl.searchParams.append('maxResults', maxResults);
    searchUrl.searchParams.append('order', 'relevance');
    searchUrl.searchParams.append('key', apiKey);

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      return NextResponse.json(
        { error: searchData.error?.message || 'YouTube API error' },
        { status: searchResponse.status }
      );
    }

    // 動画IDを取得
    const videoIds = searchData.items
      ?.map((item: { id: { videoId: string } }) => item.id.videoId)
      .join(',');

    if (!videoIds) {
      return NextResponse.json({ videos: [] });
    }

    // 動画の詳細情報を取得
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.append('part', 'snippet,statistics,contentDetails');
    videosUrl.searchParams.append('id', videoIds);
    videosUrl.searchParams.append('key', apiKey);

    const videosResponse = await fetch(videosUrl.toString());
    const videosData = await videosResponse.json();

    if (!videosResponse.ok) {
      return NextResponse.json(
        { error: videosData.error?.message || 'YouTube API error' },
        { status: videosResponse.status }
      );
    }

    // データを整形
    const videos =
      videosData.items?.map(
        (item: {
          id: string;
          snippet: {
            title: string;
            channelTitle: string;
            description: string;
            thumbnails: {
              medium?: { url: string };
              default?: { url: string };
            };
            publishedAt: string;
          };
          contentDetails: { duration: string };
          statistics: { viewCount?: string };
        }) => ({
          videoId: item.id,
          title: item.snippet.title,
          channelName: item.snippet.channelTitle,
          description: item.snippet.description,
          thumbnailUrl:
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url,
          duration: item.contentDetails.duration,
          viewCount: parseInt(item.statistics.viewCount || '0'),
          publishedAt: item.snippet.publishedAt,
        })
      ) || [];

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
