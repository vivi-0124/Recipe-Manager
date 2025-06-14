'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { YouTubeVideo, Ingredient } from '@/lib/supabase'

interface RecipeSearchProps {
  ingredients: Ingredient[]
  onFavoriteChange?: () => void
}

export default function RecipeSearch({ ingredients, onFavoriteChange }: RecipeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 材料リストから自動でレシピを提案
  const searchByIngredients = async () => {
    if (ingredients.length === 0) return

    const ingredientNames = ingredients.map(ing => ing.name).slice(0, 3).join(' ')
    await searchRecipes(ingredientNames)
  }

  // レシピ検索
  const searchRecipes = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (response.ok) {
        setVideos(data.videos || [])
      } else {
        setError(data.error || '検索に失敗しました')
      }
          } catch {
        setError('検索に失敗しました')
      } finally {
      setLoading(false)
    }
  }

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchRecipes(searchQuery)
  }



  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">レシピ検索</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="作りたい料理を検索してください"
              className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? '検索中...' : '検索'}
            </button>
          </div>
        </form>

        {ingredients.length > 0 && (
          <div className="mt-4">
            <button
              onClick={searchByIngredients}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              今ある材料でレシピを提案
            </button>
            <p className="text-sm text-gray-500 mt-1">
              使用する材料: {ingredients.slice(0, 3).map(ing => ing.name).join(', ')}
              {ingredients.length > 3 && '...'}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-600 text-sm">{error}</div>
        )}
      </div>

      {videos.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            検索結果 ({videos.length}件)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard 
                key={video.videoId} 
                video={video} 
                onFavoriteChange={onFavoriteChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface VideoCardProps {
  video: YouTubeVideo
  onFavoriteChange?: () => void
}

function VideoCard({ video, onFavoriteChange }: VideoCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const { user } = useAuth()

  // 説明文の表示/非表示を切り替え
  const toggleDescription = () => {
    setShowDescription(!showDescription)
  }

  // お気に入りに追加/削除
  const toggleFavorite = async () => {
    if (!user) return

    console.log('toggleFavorite called, current isFavorite:', isFavorite) // デバッグ用
    setLoading(true)
    try {
      if (isFavorite) {
        // お気に入りから削除
        console.log('Removing from favorites:', video.videoId) // デバッグ用
        const response = await fetch(`/api/favorites?userId=${user.id}&videoId=${video.videoId}`, {
          method: 'DELETE',
        })
        console.log('Delete response:', response.status) // デバッグ用
        if (response.ok) {
          setIsFavorite(false)
          // 親コンポーネントのお気に入りデータを更新
          if (onFavoriteChange) {
            console.log('Calling onFavoriteChange after delete') // デバッグ用
            onFavoriteChange()
          }
        }
      } else {
        // お気に入りに追加
        console.log('Adding to favorites:', video.videoId) // デバッグ用
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
        })
        console.log('Add response:', response.status) // デバッグ用
        if (response.ok) {
          setIsFavorite(true)
          // 親コンポーネントのお気に入りデータを更新
          if (onFavoriteChange) {
            console.log('Calling onFavoriteChange after add') // デバッグ用
            onFavoriteChange()
          }
        }
      }
    } catch (error) {
      console.error('お気に入り操作に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return duration

    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M回再生`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K回再生`
    }
    return `${count}回再生`
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          width={320}
          height={180}
          className="w-full h-48 object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7/2Q=="
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {video.title}
        </h4>
        <p className="text-sm text-gray-600 mb-2">{video.channelName}</p>
        <p className="text-xs text-gray-500 mb-3">
          {formatViewCount(video.viewCount)}
        </p>
        
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-2 px-3 rounded text-sm font-medium"
            >
              YouTubeで見る
            </a>
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className={`px-3 py-2 rounded text-sm font-medium disabled:opacity-50 ${
                isFavorite
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {loading ? '...' : isFavorite ? '★' : '☆'}
            </button>
          </div>
          
          <button
            onClick={toggleDescription}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium"
          >
            {showDescription ? '説明を隠す' : '説明文を表示'}
          </button>
          
          {showDescription && (
            <div className="bg-gray-50 p-3 rounded text-sm">
              {video.description ? (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">動画の説明:</h5>
                  <div className="text-gray-700 whitespace-pre-line max-h-40 overflow-y-auto">
                    {video.description.length > 500 
                      ? `${video.description.substring(0, 500)}...` 
                      : video.description}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">説明文がありません</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 