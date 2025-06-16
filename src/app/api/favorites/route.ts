import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// お気に入りレシピ一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: favorites, error } = await supabase
      .from('favorite_recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorites });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// お気に入りレシピ追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      youtube_video_id,
      title,
      channel_name,
      thumbnail_url,
      description,
      duration,
      view_count,
      published_at,
      tags,
    } = body;

    if (!user_id || !youtube_video_id || !title) {
      return NextResponse.json(
        { error: 'User ID, YouTube video ID, and title are required' },
        { status: 400 }
      );
    }

    // 既にお気に入りに追加されているかチェック
    const { data: existing } = await supabase
      .from('favorite_recipes')
      .select('id')
      .eq('user_id', user_id)
      .eq('youtube_video_id', youtube_video_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Recipe is already in favorites' },
        { status: 409 }
      );
    }

    const { data: favorite, error } = await supabase
      .from('favorite_recipes')
      .insert({
        user_id,
        youtube_video_id,
        title,
        channel_name,
        thumbnail_url,
        description,
        duration,
        view_count,
        published_at,
        tags,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// お気に入りレシピ削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const videoId = searchParams.get('videoId');

    if (!userId || !videoId) {
      return NextResponse.json(
        { error: 'User ID and video ID are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('favorite_recipes')
      .delete()
      .eq('user_id', userId)
      .eq('youtube_video_id', videoId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Favorite recipe deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
