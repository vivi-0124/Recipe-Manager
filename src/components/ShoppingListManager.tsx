'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingList } from '@/lib/supabase';
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
} from '@/components/ui/alert-dialog';
import { Trash2, ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ShoppingListManagerProps {
  shoppingLists?: ShoppingList[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function ShoppingListManager({
  shoppingLists = [],
  loading = false,
  onRefresh,
}: ShoppingListManagerProps = {}) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ingredient_name: '',
    quantity: '',
    unit: '',
    priority: 1,
    notes: '',
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  // フォームが表示されたときに最初のinputにフォーカス
  useEffect(() => {
    if (showForm && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100); // アニメーションが完了するまで少し待つ
    }
  }, [showForm]);

  // アイテムの追加
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    console.log('Adding shopping list item:', formData.ingredient_name); // デバッグ用
    try {
      const response = await fetch('/api/shopping-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: user.id,
        }),
      });

      console.log('Add response status:', response.status); // デバッグ用
      if (response.ok) {
        console.log('Add successful, calling onRefresh'); // デバッグ用
        if (onRefresh) {
          onRefresh();
        }
        setFormData({
          ingredient_name: '',
          quantity: '',
          unit: '',
          priority: 1,
          notes: '',
        });
        setShowForm(false);
      } else {
        const errorData = await response.json();
        console.error('アイテムの追加に失敗しました:', errorData.error);
        alert(`エラー: ${errorData.error}`);
      }
    } catch (error) {
      console.error('アイテムの追加に失敗しました:', error);
      alert('アイテムの追加に失敗しました');
    }
  };

  // 購入状態の切り替え
  const togglePurchased = async (id: string, isPurchased: boolean) => {
    if (!user) return;

    console.log(
      'Toggling purchased status for item:',
      id,
      'from',
      isPurchased,
      'to',
      !isPurchased
    ); // デバッグ用
    try {
      const response = await fetch(`/api/shopping-lists/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_purchased: !isPurchased,
          user_id: user.id,
        }),
      });

      console.log('Toggle response status:', response.status); // デバッグ用
      if (response.ok) {
        console.log('Toggle successful, calling onRefresh'); // デバッグ用
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error('購入状態の更新に失敗しました:', response.status);
      }
    } catch (error) {
      console.error('購入状態の更新に失敗しました:', error);
    }
  };

  // アイテムの削除
  const handleDelete = async (id: string) => {
    if (!user) return;

    console.log('Deleting shopping list item:', id); // デバッグ用
    try {
      const response = await fetch(
        `/api/shopping-lists/${id}?userId=${user.id}`,
        {
          method: 'DELETE',
        }
      );

      console.log('Delete response status:', response.status); // デバッグ用
      if (response.ok) {
        console.log('Delete successful, calling onRefresh'); // デバッグ用
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error('アイテムの削除に失敗しました:', response.status);
      }
    } catch (error) {
      console.error('アイテムの削除に失敗しました:', error);
    }
  };

  // 購入済みアイテムを一括削除
  const clearPurchased = async () => {
    if (!user) return;

    const purchasedItems = shoppingLists.filter(item => item.is_purchased);
    console.log('Clearing purchased items:', purchasedItems.length); // デバッグ用

    try {
      await Promise.all(
        purchasedItems.map(item =>
          fetch(`/api/shopping-lists/${item.id}?userId=${user.id}`, {
            method: 'DELETE',
          })
        )
      );
      console.log('Bulk delete successful, calling onRefresh'); // デバッグ用
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('購入済みアイテムの削除に失敗しました:', error);
    }
  };

  if (loading) {
    return <div className="text-center">読み込み中...</div>;
  }

  const unpurchasedItems = shoppingLists.filter(item => !item.is_purchased);
  const purchasedItems = shoppingLists.filter(item => item.is_purchased);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ヘッダー - 横並びレイアウト */}
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
          <h2 className="text-xl sm:text-2xl font-bold">買い物リスト</h2>
        </div>
        <div className="flex space-x-2">
          {purchasedItems.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  購入済みを削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    購入済みアイテムを削除しますか？
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    購入済みの{purchasedItems.length}
                    個のアイテムをすべて削除します。この操作は取り消せません。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearPurchased}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    削除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {shoppingLists.length > 0 && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-sm"
              size="sm"
            >
              <Plus className="mr-1 sm:mr-2 h-4 w-4" />
              追加
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            新しいアイテムを追加
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  アイテム名 *
                </label>
                <input
                  type="text"
                  required
                  ref={nameInputRef}
                  value={formData.ingredient_name}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      ingredient_name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  数量
                </label>
                <input
                  type="text"
                  value={formData.quantity}
                  onChange={e =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  単位
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={e =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  優先度
                </label>
                <select
                  value={formData.priority}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                >
                  <option value={1}>低</option>
                  <option value={2}>中</option>
                  <option value={3}>高</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  メモ
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-sm"
                size="sm"
              >
                追加
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 未購入アイテム */}
      {unpurchasedItems.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              買い物リスト ({unpurchasedItems.length}件)
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {unpurchasedItems.map(item => (
              <ShoppingListItem
                key={item.id}
                item={item}
                onToggle={togglePurchased}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* 購入済みアイテム */}
      {purchasedItems.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-500">
              購入済み ({purchasedItems.length}件)
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {purchasedItems.map(item => (
              <ShoppingListItem
                key={item.id}
                item={item}
                onToggle={togglePurchased}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {shoppingLists.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">
              買い物リストが空です
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-lg">
              最初のアイテムを追加して、買い物リストを作成しましょう。
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-sm px-6 py-3"
            >
              <Plus className="mr-1 sm:mr-2 h-4 w-4" />
              アイテムを追加
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ShoppingListItemProps {
  item: ShoppingList;
  onToggle: (id: string, isPurchased: boolean) => void;
  onDelete: (id: string) => void;
}

function ShoppingListItem({ item, onToggle, onDelete }: ShoppingListItemProps) {
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3:
        return 'text-red-600';
      case 2:
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 3:
        return '高';
      case 2:
        return '中';
      default:
        return '低';
    }
  };

  return (
    <div
      className={`p-4 flex items-center space-x-4 ${item.is_purchased ? 'opacity-60' : ''}`}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(item.id, item.is_purchased)}
        className={`flex-shrink-0 w-6 h-6 p-0 rounded border-2 flex items-center justify-center ${
          item.is_purchased
            ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
            : 'border-gray-300 hover:border-green-500 hover:bg-transparent'
        }`}
      >
        {item.is_purchased && <span className="text-sm">✓</span>}
      </Button>

      <div className="flex-1">
        <div
          className={`font-medium ${item.is_purchased ? 'line-through text-gray-500' : 'text-gray-900'}`}
        >
          {item.ingredient_name}
          {item.quantity && item.unit && (
            <span className="text-sm text-gray-500 ml-2">
              {item.quantity} {item.unit}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 space-x-2">
          <span className={getPriorityColor(item.priority)}>
            優先度: {getPriorityText(item.priority)}
          </span>
          {item.notes && <span>• {item.notes}</span>}
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>アイテムを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{item.ingredient_name}」を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(item.id)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
