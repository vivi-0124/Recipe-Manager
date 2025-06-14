'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Ingredient, ShoppingList, FavoriteRecipe } from '@/lib/supabase'
import Layout from '@/components/Layout'
import IngredientManager from '@/components/IngredientManager'
import RecipeSearch from '@/components/RecipeSearch'
import ShoppingListManager from '@/components/ShoppingListManager'
import FavoriteRecipesManager from '@/components/FavoriteRecipesManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Search, ShoppingCart, Heart } from 'lucide-react'

// Props interfaces

type TabType = 'ingredients' | 'recipes' | 'shopping' | 'favorites'

export default function HomePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('ingredients')
  
  // 全データを親で管理
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([])
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])
  
  // 各タブのローディング状態を個別管理
  const [loadingStates, setLoadingStates] = useState({
    ingredients: false,
    shopping: false,
    favorites: false
  })

  // データが取得済みかどうかのフラグ
  const [dataFetched, setDataFetched] = useState({
    ingredients: false,
    shopping: false,
    favorites: false
  })

  // 材料データの取得
  const fetchIngredients = useCallback(async (force = false) => {
    if (!user || (!force && dataFetched.ingredients)) return

    console.log('fetchIngredients called, force:', force) // デバッグ用
    setLoadingStates(prev => ({ ...prev, ingredients: true }))
    try {
      const response = await fetch(`/api/ingredients?userId=${user.id}`)
      const data = await response.json()
      
      if (response.ok) {
        console.log('Ingredients fetched:', data.ingredients?.length || 0) // デバッグ用
        setIngredients(data.ingredients || [])
        setDataFetched(prev => ({ ...prev, ingredients: true }))
      }
    } catch (error) {
      console.error('材料の取得に失敗しました:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, ingredients: false }))
    }
  }, [user, dataFetched.ingredients])

  // 買い物リストデータの取得
  const fetchShoppingLists = useCallback(async (force = false) => {
    if (!user || (!force && dataFetched.shopping)) return

    console.log('fetchShoppingLists called, force:', force) // デバッグ用
    setLoadingStates(prev => ({ ...prev, shopping: true }))
    try {
      const response = await fetch(`/api/shopping-lists?userId=${user.id}`)
      const data = await response.json()
      
      if (response.ok) {
        console.log('Shopping lists fetched:', data.shoppingLists?.length || 0) // デバッグ用
        setShoppingLists(data.shoppingLists || [])
        setDataFetched(prev => ({ ...prev, shopping: true }))
      }
    } catch (error) {
      console.error('買い物リストの取得に失敗しました:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, shopping: false }))
    }
  }, [user, dataFetched.shopping])

  // お気に入りデータの取得
  const fetchFavorites = useCallback(async (force = false) => {
    if (!user || (!force && dataFetched.favorites)) return

    console.log('fetchFavorites called, force:', force) // デバッグ用
    setLoadingStates(prev => ({ ...prev, favorites: true }))
    try {
      const response = await fetch(`/api/favorites?userId=${user.id}`)
      const data = await response.json()
      
      if (response.ok) {
        console.log('Favorites fetched:', data.favorites?.length || 0) // デバッグ用
        setFavorites(data.favorites || [])
        setDataFetched(prev => ({ ...prev, favorites: true }))
      }
    } catch (error) {
      console.error('お気に入りの取得に失敗しました:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, favorites: false }))
    }
  }, [user, dataFetched.favorites])

  // タブ切り替え時にデータを取得
  const handleTabChange = useCallback((value: string) => {
    const newTab = value as TabType
    setActiveTab(newTab)
    
    // 未取得のデータのみ取得
    switch (newTab) {
      case 'ingredients':
        fetchIngredients()
        break
      case 'shopping':
        fetchShoppingLists()
        break
      case 'favorites':
        fetchFavorites()
        break
    }
  }, [fetchIngredients, fetchShoppingLists, fetchFavorites])

  // 初回ロード時に材料データを取得
  useEffect(() => {
    if (user) {
      fetchIngredients()
    }
  }, [user, fetchIngredients])

  // データの更新関数（子コンポーネントから呼ばれる）
  const refreshIngredients = useCallback(() => {
    console.log('refreshIngredients called') // デバッグ用
    // 強制的に再取得
    fetchIngredients(true)
  }, [fetchIngredients])

  const refreshShoppingLists = useCallback(() => {
    console.log('refreshShoppingLists called') // デバッグ用
    // 強制的に再取得
    fetchShoppingLists(true)
  }, [fetchShoppingLists])

  const refreshFavorites = useCallback(() => {
    console.log('refreshFavorites called') // デバッグ用
    // 強制的に再取得
    fetchFavorites(true)
  }, [fetchFavorites])

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* ウェルカムメッセージ - モバイル優先 */}
        <div className="text-center space-y-1 sm:space-y-2 px-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            おかえりなさい！
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            今日はどんな美味しい料理を作りますか？
          </p>
        </div>

        {/* タブナビゲーション - 1行4列レイアウト */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* 全画面で1行4列、小さい画面では省略表示 */}
          <TabsList className="mx-auto grid grid-cols-4 gap-0.5 h-auto p-1 w-full max-w-2xl">
            <TabsTrigger 
              value="ingredients" 
              className="flex items-center justify-center gap-1 py-1.5 px-1 text-xs font-medium"
            >
              <Package className="h-3.5 w-3.5" />
              <span>材料</span>
              <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded">{ingredients.length}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="recipes" 
              className="flex items-center justify-center gap-1 py-1.5 px-1 text-xs font-medium"
            >
              <Search className="h-3.5 w-3.5" />
              <span>レシピ</span>
            </TabsTrigger>
            <TabsTrigger 
              value="shopping" 
              className="flex items-center justify-center gap-1 py-1.5 px-1 text-xs font-medium"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>買い物</span>
              <span className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded">{shoppingLists.length}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="flex items-center justify-center gap-1 py-1.5 px-1 text-xs font-medium"
            >
              <Heart className="h-3.5 w-3.5" />
              <span>お気に入り</span>
              <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">{favorites.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients" className="mt-4 sm:mt-6">
            <IngredientManager 
              ingredients={ingredients}
              loading={loadingStates.ingredients}
              onRefresh={refreshIngredients}
            />
          </TabsContent>

          <TabsContent value="recipes" className="mt-4 sm:mt-6">
            <RecipeSearch 
              ingredients={ingredients} 
              onFavoriteChange={refreshFavorites}
            />
          </TabsContent>

          <TabsContent value="shopping" className="mt-4 sm:mt-6">
            <ShoppingListManager 
              shoppingLists={shoppingLists}
              loading={loadingStates.shopping}
              onRefresh={refreshShoppingLists}
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-4 sm:mt-6">
            <FavoriteRecipesManager 
              favorites={favorites}
              loading={loadingStates.favorites}
              onRefresh={refreshFavorites}
              onTabChange={handleTabChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}


