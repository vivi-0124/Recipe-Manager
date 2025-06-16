'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { YouTubeVideo, Ingredient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Utensils,
  Clock,
  Users,
  Star,
  ExternalLink,
  AlertCircle,
  Eye,
  FileText,
} from 'lucide-react';

interface RecipeSearchProps {
  ingredients: Ingredient[];
  onFavoriteChange?: () => void;
}

// sessionStorageのキー（コンポーネント外で定義）
const STORAGE_KEYS = {
  searchQuery: 'recipeSearch_query',
  videos: 'recipeSearch_videos',
  selectedIngredients: 'recipeSearch_selectedIngredients',
} as const;

export default function RecipeSearch({
  ingredients,
  onFavoriteChange,
}: RecipeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 選択された材料のIDを管理
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    []
  );

  // コンポーネントマウント時にsessionStorageから状態を復元
  useEffect(() => {
    try {
      const savedQuery = sessionStorage.getItem(STORAGE_KEYS.searchQuery);
      const savedVideos = sessionStorage.getItem(STORAGE_KEYS.videos);
      const savedSelectedIngredients = sessionStorage.getItem(
        STORAGE_KEYS.selectedIngredients
      );

      if (savedQuery) {
        setSearchQuery(savedQuery);
      }

      if (savedVideos) {
        const parsedVideos = JSON.parse(savedVideos);
        setVideos(parsedVideos);
      }

      if (savedSelectedIngredients) {
        const parsedSelectedIngredients = JSON.parse(savedSelectedIngredients);
        setSelectedIngredientIds(parsedSelectedIngredients);
      }
    } catch (error) {
      console.error(
        'Failed to restore search state from sessionStorage:',
        error
      );
    }
  }, []);

  // 検索クエリが変更された時にsessionStorageに保存
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.searchQuery, searchQuery);
  }, [searchQuery]);

  // 検索結果が変更された時にsessionStorageに保存
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.videos, JSON.stringify(videos));
  }, [videos]);

  // 選択された材料が変更された時にsessionStorageに保存
  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEYS.selectedIngredients,
      JSON.stringify(selectedIngredientIds)
    );
  }, [selectedIngredientIds]);

  // 材料の選択/非選択を切り替え
  const toggleIngredientSelection = (ingredientId: string) => {
    setSelectedIngredientIds(prev =>
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  // 全選択/全解除を切り替え
  const toggleSelectAll = () => {
    if (selectedIngredientIds.length === ingredients.length) {
      // 全て選択されている場合は全解除
      setSelectedIngredientIds([]);
    } else {
      // 一部または何も選択されていない場合は全選択
      setSelectedIngredientIds(ingredients.map(ing => ing.id));
    }
  };

  // 選択された材料を取得
  const getSelectedIngredients = () => {
    return ingredients.filter(ing => selectedIngredientIds.includes(ing.id));
  };

  // レシピ検索（選択した材料と検索キーワードを組み合わせ）
  const searchRecipes = async (query: string) => {
    setLoading(true);
    setError('');

    try {
      // 選択された材料名を取得
      const selectedIngredients = getSelectedIngredients();
      const ingredientNames = selectedIngredients.map(ing => ing.name);

      // 検索クエリと選択した材料を組み合わせ
      const searchTerms = [];
      if (query.trim()) {
        searchTerms.push(query.trim());
      }
      if (ingredientNames.length > 0) {
        searchTerms.push(...ingredientNames);
      }

      const finalQuery = searchTerms.join(' ');

      if (!finalQuery) {
        setError('検索キーワードまたは材料を選択してください');
        return;
      }

      const response = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(finalQuery)}`
      );
      const data = await response.json();

      if (response.ok) {
        setVideos(data.videos || []);
      } else {
        setError(data.error || '検索に失敗しました');
      }
    } catch {
      setError('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchRecipes(searchQuery);
  };

  // 統一されたアイテムクリックハンドラー
  const handleItemClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  // 統一されたキーボードハンドラー
  const handleItemKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      action();
    }
  };

  // 全選択の状態を判定
  const isAllSelected =
    ingredients.length > 0 &&
    selectedIngredientIds.length === ingredients.length;
  const isPartiallySelected =
    selectedIngredientIds.length > 0 &&
    selectedIngredientIds.length < ingredients.length;

  return (
    <main className="space-y-4 sm:space-y-6" role="main">
      {/* ヘッダー - 横並びレイアウト */}
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
          <h2 className="text-xl sm:text-2xl font-bold">レシピ検索</h2>
        </div>
      </div>

      {/* レシピ検索カード */}
      <section aria-labelledby="search-heading">
        <Card>
          <CardContent className="space-y-6">
            {/* 検索フォーム */}
            <form
              onSubmit={handleSubmit}
              className="flex gap-3"
              role="search"
              aria-label="レシピ検索フォーム"
            >
              <div className="flex-1">
                <Label htmlFor="search-input" className="sr-only">
                  レシピ検索キーワード
                </Label>
                <Input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="例：和食、洋食、中華、イタリアン..."
                  className="flex-1 focus:border-green-400 focus:ring-green-300"
                  aria-describedby="search-help"
                  autoComplete="off"
                />
                <div id="search-help" className="sr-only">
                  料理のジャンルを入力してレシピを検索できます。選択した材料と組み合わせて検索されます。
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                aria-describedby={loading ? 'search-status' : undefined}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <span className="sr-only">
                      検索中です。しばらくお待ちください。
                    </span>
                    検索中...
                  </>
                ) : (
                  <>
                    <span className="sr-only">レシピを検索する</span>
                    検索
                  </>
                )}
              </Button>
              {loading && (
                <div id="search-status" className="sr-only" aria-live="polite">
                  検索を実行しています
                </div>
              )}
            </form>

            {/* 材料選択セクション */}
            {ingredients.length > 0 && (
              <section aria-labelledby="ingredients-heading">
                <div className="space-y-4">
                  <Separator role="separator" aria-hidden="true" />

                  {/* アコーディオン */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="ingredients">
                      <AccordionTrigger aria-describedby="ingredient-selection-help">
                        <div className="flex items-center gap-2">
                          <Utensils
                            className="h-4 w-4 text-green-600"
                            aria-hidden="true"
                          />
                          <span id="ingredients-heading">
                            使用する材料を選択
                          </span>
                          {selectedIngredientIds.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-2 bg-green-100 text-green-700 border-green-200"
                              aria-label={`${selectedIngredientIds.length}個の材料が選択されています`}
                            >
                              {selectedIngredientIds.length}個選択中
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <div id="ingredient-selection-help" className="sr-only">
                        材料を個別に選択してレシピを検索できます。選択した材料は検索キーワードと組み合わせて使用されます。
                      </div>
                      <AccordionContent className="pt-4">
                        <div className="space-y-4">
                          {/* 材料選択リスト */}
                          <fieldset>
                            <legend className="sr-only">
                              使用する材料を選択してください
                            </legend>
                            <div
                              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-2"
                              role="group"
                              aria-labelledby="ingredients-heading"
                            >
                              {/* 全選択項目 */}
                              <div
                                className={`col-span-full flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 ${
                                  isAllSelected
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                }`}
                                onClick={e =>
                                  handleItemClick(e, () => toggleSelectAll())
                                }
                                onKeyDown={e =>
                                  handleItemKeyDown(e, toggleSelectAll)
                                }
                                tabIndex={0}
                                role="button"
                                aria-pressed={isAllSelected}
                                aria-describedby="select-all-desc"
                              >
                                <Checkbox
                                  id="select-all"
                                  checked={isAllSelected}
                                  ref={el => {
                                    if (el) {
                                      const input = el.querySelector('input');
                                      if (input) {
                                        input.indeterminate =
                                          isPartiallySelected;
                                      }
                                    }
                                  }}
                                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 pointer-events-none"
                                  tabIndex={-1}
                                />
                                <Label
                                  htmlFor="select-all"
                                  className="text-sm cursor-pointer flex-1 font-medium pointer-events-none"
                                >
                                  すべて選択
                                </Label>
                                <div id="select-all-desc" className="sr-only">
                                  すべての材料を
                                  {isAllSelected ? '選択解除' : '選択'}する
                                </div>
                              </div>

                              {/* 個別材料項目 */}
                              {ingredients.map(ingredient => {
                                const isSelected =
                                  selectedIngredientIds.includes(ingredient.id);
                                return (
                                  <div
                                    key={ingredient.id}
                                    className={`flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 ${
                                      isSelected
                                        ? 'border-green-400 bg-green-50'
                                        : 'border-gray-200 hover:border-green-300'
                                    }`}
                                    onClick={e =>
                                      handleItemClick(e, () =>
                                        toggleIngredientSelection(ingredient.id)
                                      )
                                    }
                                    onKeyDown={e =>
                                      handleItemKeyDown(e, () =>
                                        toggleIngredientSelection(ingredient.id)
                                      )
                                    }
                                    tabIndex={0}
                                    role="button"
                                    aria-pressed={isSelected}
                                    aria-describedby={`ingredient-${ingredient.id}-desc`}
                                  >
                                    <Checkbox
                                      id={ingredient.id}
                                      checked={isSelected}
                                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 pointer-events-none"
                                      tabIndex={-1}
                                    />
                                    <Label
                                      htmlFor={ingredient.id}
                                      className="text-sm cursor-pointer flex-1 pointer-events-none"
                                    >
                                      {ingredient.name}
                                    </Label>
                                    <div
                                      id={`ingredient-${ingredient.id}-desc`}
                                      className="sr-only"
                                    >
                                      {ingredient.name}を
                                      {isSelected ? '選択解除' : '選択'}する
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </fieldset>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </section>
            )}

            {/* エラー表示 */}
            {error && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>
                  <span className="font-semibold">エラー:</span> {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 検索結果 */}
      {videos.length > 0 && (
        <section aria-labelledby="results-heading">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle
                  id="results-heading"
                  className="flex items-center gap-2"
                >
                  <Users
                    className="h-5 w-5 text-green-600"
                    aria-hidden="true"
                  />
                  検索結果
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 border-green-200"
                  aria-label={`${videos.length}件の検索結果が見つかりました`}
                >
                  {videos.length}件見つかりました
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="list"
                aria-label="レシピ動画一覧"
              >
                {videos.map((video, index) => (
                  <div key={video.videoId} role="listitem">
                    <VideoCard
                      video={video}
                      onFavoriteChange={onFavoriteChange}
                      index={index + 1}
                      totalCount={videos.length}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 検索結果が0件の場合 */}
      {videos.length === 0 && !loading && !error && searchQuery && (
        <section aria-live="polite">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                「{searchQuery}」に関するレシピが見つかりませんでした。
                <br />
                別のキーワードで検索してみてください。
              </p>
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}

interface VideoCardProps {
  video: YouTubeVideo;
  onFavoriteChange?: () => void;
  index?: number;
  totalCount?: number;
}

function VideoCard({
  video,
  onFavoriteChange,
  index,
  totalCount,
}: VideoCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const { user } = useAuth();

  // お気に入りに追加/削除
  const toggleFavorite = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (isFavorite) {
        // お気に入りから削除
        const response = await fetch(
          `/api/favorites?userId=${user.id}&videoId=${video.videoId}`,
          {
            method: 'DELETE',
          }
        );
        if (response.ok) {
          setIsFavorite(false);
          // 親コンポーネントのお気に入りデータを更新
          if (onFavoriteChange) {
            onFavoriteChange();
          }
        }
      } else {
        // お気に入りに追加
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            youtube_video_id: video.videoId,
            title: video.title,
            channel_name: video.channelName,
            thumbnail_url: video.thumbnailUrl,
            description: video.description,
            duration: video.duration,
            view_count: video.viewCount,
            published_at: video.publishedAt,
          }),
        });
        if (response.ok) {
          setIsFavorite(true);
          // 親コンポーネントのお気に入りデータを更新
          if (onFavoriteChange) {
            onFavoriteChange();
          }
        }
      }
    } catch (error) {
      console.error('お気に入り操作に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M回再生`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K回再生`;
    }
    return `${count}回再生`;
  };

  const cardAriaLabel = `${index && totalCount ? `${totalCount}件中${index}番目: ` : ''}${video.title}、チャンネル: ${video.channelName}、再生時間: ${formatDuration(video.duration)}、再生回数: ${formatViewCount(video.viewCount)}`;

  return (
    <Card className="overflow-hidden" role="article" aria-label={cardAriaLabel}>
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          <Image
            src={video.thumbnailUrl}
            alt={`${video.title}のサムネイル画像`}
            fill
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7/2Q=="
          />
        </AspectRatio>
        <div className="absolute bottom-2 right-2">
          <Badge
            variant="secondary"
            className="bg-black/80 text-white"
            aria-label={`動画の長さ: ${formatDuration(video.duration)}`}
          >
            <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
            {formatDuration(video.duration)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <CardTitle className="text-base font-medium line-clamp-2 mb-2">
            {video.title}
          </CardTitle>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span aria-label={`チャンネル名: ${video.channelName}`}>
              {video.channelName}
            </span>
            <span
              className="flex items-center gap-1"
              aria-label={`再生回数: ${formatViewCount(video.viewCount)}`}
            >
              <Eye className="h-3 w-3" aria-hidden="true" />
              {formatViewCount(video.viewCount)}
            </span>
          </div>
        </div>

        <div className="flex gap-2" role="group" aria-label="動画アクション">
          <Button
            asChild
            size="sm"
            className="flex-1"
            aria-describedby={`youtube-link-${video.videoId}`}
          >
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${video.title}をYouTubeで視聴する（新しいタブで開きます）`}
            >
              <ExternalLink className="h-3 w-3 mr-1" aria-hidden="true" />
              YouTube
            </a>
          </Button>
          <div id={`youtube-link-${video.videoId}`} className="sr-only">
            新しいタブでYouTubeが開きます
          </div>
          <Button
            onClick={toggleFavorite}
            disabled={loading}
            variant={isFavorite ? 'default' : 'outline'}
            size="sm"
            aria-label={`${video.title}を${isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}する`}
            aria-pressed={isFavorite}
            className={
              isFavorite
                ? 'bg-green-600 hover:bg-green-700'
                : 'hover:bg-green-50 hover:border-green-300 border-green-200'
            }
          >
            {loading ? (
              <span className="sr-only">処理中...</span>
            ) : (
              <>
                <Star
                  className={`h-3 w-3 ${isFavorite ? 'fill-current' : ''}`}
                  aria-hidden="true"
                />
                <span className="sr-only">
                  {isFavorite ? 'お気に入り済み' : 'お気に入りに追加'}
                </span>
              </>
            )}
          </Button>
        </div>

        <Dialog open={showDescription} onOpenChange={setShowDescription}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center hover:bg-green-50 transition-colors"
              aria-expanded={showDescription}
              aria-controls={`description-${video.videoId}`}
              aria-label={`${video.title}の詳細情報を${showDescription ? '閉じる' : '表示する'}`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" aria-hidden="true" />
                <span className="text-xs sm:text-sm">詳細情報</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full sm:max-w-[600px] lg:max-w-[800px] max-h-[85vh] p-0 rounded-2xl overflow-hidden flex flex-col">
            {/* ヘッダー部分 */}
            <DialogHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-gray-50 to-white rounded-t-2xl flex-shrink-0">
              <DialogTitle className="text-base sm:text-lg font-semibold line-clamp-2 text-left pr-8 break-words">
                {video.title}
              </DialogTitle>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-muted-foreground pt-2">
                <span className="font-medium break-words">
                  {video.channelName}
                </span>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(video.duration)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatViewCount(video.viewCount)}
                  </span>
                </div>
              </div>
            </DialogHeader>

            {/* コンテンツ部分 */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* 動画アクション */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1 h-10 sm:h-11 rounded-xl">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm sm:text-base">
                          YouTubeで視聴
                        </span>
                      </a>
                    </Button>
                    <Button
                      onClick={toggleFavorite}
                      disabled={loading}
                      variant={isFavorite ? 'default' : 'outline'}
                      className={`h-10 sm:h-11 min-w-[140px] rounded-xl ${
                        isFavorite
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'hover:bg-green-50 hover:border-green-300 border-green-200'
                      }`}
                    >
                      <Star
                        className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`}
                      />
                      <span className="text-sm sm:text-base">
                        {isFavorite ? 'お気に入り済み' : 'お気に入りに追加'}
                      </span>
                    </Button>
                  </div>

                  {/* 説明文セクション */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2 text-gray-800">
                      <FileText className="h-4 w-4 text-green-600" />
                      動画の説明
                    </h4>
                    {video.description ? (
                      <div className="border rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-inner overflow-hidden">
                        <ScrollArea className="h-[200px] sm:h-[250px]">
                          <div className="p-4">
                            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700 break-words break-all overflow-wrap-anywhere word-wrap-break-word">
                              {video.description}
                            </p>
                          </div>
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="border rounded-2xl p-8 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center h-[150px] shadow-inner">
                        <div className="text-center space-y-2">
                          <FileText className="h-8 w-8 text-gray-400 mx-auto" />
                          <p className="text-sm text-muted-foreground">
                            説明文がありません
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
