'use client'

import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { FavoriteRecipe } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Heart, 
  Clock, 
  Trash2,
  Loader2,
  Search
} from 'lucide-react'

interface FavoriteRecipesManagerProps {
  favorites?: FavoriteRecipe[]
  loading?: boolean
  onRefresh?: () => void
  onTabChange?: (tab: string) => void
}

export default function FavoriteRecipesManager({ 
  favorites = [], 
  loading = false, 
  onRefresh,
  onTabChange
}: FavoriteRecipesManagerProps = {}) {
  const { user } = useAuth()

  const removeFavorite = async (videoId: string) => {
    if (!user) return

    console.log('Removing favorite:', videoId) // デバッグ用
    try {
      const response = await fetch(`/api/favorites?userId=${user.id}&videoId=${videoId}`, {
        method: 'DELETE',
      })

      console.log('Delete response status:', response.status) // デバッグ用
      if (response.ok) {
        console.log('Delete successful, calling onRefresh') // デバッグ用
        // データを強制的に再取得する
        if (onRefresh) {
          onRefresh()
        }
      } else {
        console.error('お気に入りの削除に失敗しました:', response.status)
      }
    } catch (error) {
      console.error('お気に入りの削除に失敗しました:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-red-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-muted-foreground text-sm">読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ヘッダー - 横並びレイアウト */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
          <h2 className="text-xl sm:text-2xl font-bold">お気に入りレシピ</h2>
        </div>
      </div>
      
      {favorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">お気に入りレシピがありません</h3>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-lg">
              レシピ検索でお気に入りのレシピを見つけて、ハートボタンで保存しましょう
            </p>
            <Button 
              onClick={() => onTabChange?.('recipes')}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-sm"
            >
              <Search className="mr-2 h-4 w-4" />
              レシピを探す
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {favorites.map((favorite: FavoriteRecipe) => (
            <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={favorite.thumbnail_url || '/placeholder-recipe.jpg'}
                  alt={favorite.title}
                  width={300}
                  height={200}
                  className="w-full h-36 sm:h-48 object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7/2Q=="
                />
                <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {favorite.duration}
                </div>
              </div>
              
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-medium text-sm sm:text-base mb-2 line-clamp-2 h-8 sm:h-10">
                  {favorite.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  {favorite.channel_name}
                </p>
                
                <div className="flex justify-between items-center">
                  <a
                    href={`https://youtube.com/watch?v=${favorite.youtube_video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    YouTubeで見る
                  </a>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>お気に入りから削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          「{favorite.title}」をお気に入りから削除します。この操作は取り消せません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeFavorite(favorite.youtube_video_id)}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                          削除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 