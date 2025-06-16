'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Ingredient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Package,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Scale,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
} from 'lucide-react';

interface IngredientManagerProps {
  ingredients?: Ingredient[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function IngredientManager({
  ingredients = [],
  loading = false,
  onRefresh,
}: IngredientManagerProps = {}) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
    expiry_date: '',
    category: '',
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

  // フォームのリセット
  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      unit: '',
      expiry_date: '',
      category: '',
      notes: '',
    });
    setEditingIngredient(null);
    setShowForm(false);
  };

  // 材料の追加・更新
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const operation = editingIngredient ? 'update' : 'add';
    console.log(`${operation}ing ingredient:`, formData.name); // デバッグ用

    try {
      const url = editingIngredient
        ? `/api/ingredients/${editingIngredient.id}`
        : '/api/ingredients';

      const method = editingIngredient ? 'PUT' : 'POST';

      // 空の日付フィールドをnullに変換
      const submitData = {
        ...formData,
        expiry_date: formData.expiry_date || null,
        user_id: user.id,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log(`${operation} response status:`, response.status); // デバッグ用
      if (response.ok) {
        console.log(`${operation} successful, calling onRefresh`); // デバッグ用
        if (onRefresh) {
          onRefresh();
        }
        resetForm();
      } else {
        const errorData = await response.json();
        console.error(
          `材料の${operation === 'add' ? '追加' : '更新'}に失敗しました:`,
          errorData.error
        );
        alert(`エラー: ${errorData.error}`);
      }
    } catch (error) {
      console.error('材料の保存に失敗しました:', error);
      alert('材料の保存に失敗しました');
    }
  };

  // 材料の削除
  const handleDelete = async (id: string) => {
    if (!user) return;

    console.log('Deleting ingredient:', id); // デバッグ用
    try {
      const response = await fetch(`/api/ingredients/${id}?userId=${user.id}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status); // デバッグ用
      if (response.ok) {
        console.log('Delete successful, calling onRefresh'); // デバッグ用
        if (onRefresh) {
          onRefresh();
        }
      } else {
        const errorData = await response.json();
        console.error('材料の削除に失敗しました:', errorData.error);
        alert(`エラー: ${errorData.error}`);
      }
    } catch (error) {
      console.error('材料の削除に失敗しました:', error);
      alert('材料の削除に失敗しました');
    }
  };

  // 編集開始
  const startEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      quantity: ingredient.quantity || '',
      unit: ingredient.unit || '',
      expiry_date: ingredient.expiry_date || '',
      category: ingredient.category || '',
      notes: ingredient.notes || '',
    });
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  // 期限チェック
  const getExpiryStatus = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return 'none';

    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'warning';
    return 'good';
  };

  // カテゴリ別に材料をグループ化
  const groupedIngredients = ingredients.reduce(
    (acc, ingredient) => {
      const category = ingredient.category || 'その他';
      if (!acc[category]) acc[category] = [];
      acc[category].push(ingredient);
      return acc;
    },
    {} as Record<string, Ingredient[]>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-orange-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-muted-foreground text-sm">読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ヘッダー - 横並びレイアウト */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
          <h2 className="text-xl sm:text-2xl font-bold">材料管理</h2>
        </div>
        {/* 材料がある時のみ追加ボタンを表示 */}
        {ingredients.length > 0 && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-sm"
          >
            <Plus className="mr-1 sm:mr-2 h-4 w-4" />
            追加
          </Button>
        )}
      </div>

      {/* 入力フォーム - モバイル優先 */}
      {showForm && (
        <Card className="border-orange-200">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  {editingIngredient ? '材料を編集' : '新しい材料を追加'}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  材料の詳細情報を入力してください
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* フォームフィールド - モバイルで1列、デスクトップで2列 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 材料名 */}
                <div className="space-y-2 sm:col-span-2">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Tag className="h-4 w-4" />
                    材料名 *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    ref={nameInputRef}
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="例: トマト"
                    className="text-base sm:text-sm"
                  />
                </div>

                {/* カテゴリ */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4" />
                    カテゴリ
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={value =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="text-base sm:text-sm">
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="野菜">🥬 野菜</SelectItem>
                      <SelectItem value="肉類">🥩 肉類</SelectItem>
                      <SelectItem value="魚介類">🐟 魚介類</SelectItem>
                      <SelectItem value="調味料">🧂 調味料</SelectItem>
                      <SelectItem value="乳製品">🥛 乳製品</SelectItem>
                      <SelectItem value="その他">📦 その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 賞味期限 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="expiry_date"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Calendar className="h-4 w-4" />
                    賞味期限
                  </Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={e =>
                      setFormData({ ...formData, expiry_date: e.target.value })
                    }
                    className="text-base sm:text-sm"
                  />
                </div>

                {/* 数量 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="quantity"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Scale className="h-4 w-4" />
                    数量
                  </Label>
                  <Input
                    id="quantity"
                    type="text"
                    value={formData.quantity}
                    onChange={e =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="例: 3"
                    className="text-base sm:text-sm"
                  />
                </div>

                {/* 単位 */}
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm">
                    単位
                  </Label>
                  <Input
                    id="unit"
                    type="text"
                    value={formData.unit}
                    onChange={e =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    placeholder="例: 個、kg、L"
                    className="text-base sm:text-sm"
                  />
                </div>

                {/* メモ */}
                <div className="space-y-2 sm:col-span-2">
                  <Label
                    htmlFor="notes"
                    className="flex items-center gap-2 text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    メモ
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={e =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="保存場所や調理方法などのメモ"
                    rows={3}
                    className="text-base sm:text-sm resize-none"
                  />
                </div>
              </div>

              <Separator />

              {/* ボタン - モバイル優先 */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="text-sm sm:text-base"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-sm sm:text-base"
                >
                  {editingIngredient ? '更新' : '追加'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 材料一覧 - モバイル優先 */}
      {ingredients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">
              材料がありません
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-lg">
              最初の材料を追加して冷蔵庫の管理を始めましょう
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              材料を追加
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(groupedIngredients).map(
            ([category, categoryIngredients]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-lg">
                      {category === '野菜'
                        ? '🥬'
                        : category === '肉類'
                          ? '🥩'
                          : category === '魚介類'
                            ? '🐟'
                            : category === '調味料'
                              ? '🧂'
                              : category === '乳製品'
                                ? '🥛'
                                : '📦'}
                    </span>
                    {category}
                    <Badge variant="secondary" className="text-xs">
                      {categoryIngredients.length}個
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {categoryIngredients.map(ingredient => {
                      const expiryStatus = getExpiryStatus(
                        ingredient.expiry_date
                      );

                      return (
                        <div
                          key={ingredient.id}
                          className="flex items-center justify-between py-3 px-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* 期限ステータスアイコン */}
                            <div className="flex-shrink-0">
                              {expiryStatus === 'expired' && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                              {expiryStatus === 'warning' && (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                              {expiryStatus === 'good' &&
                                ingredient.expiry_date && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              {!ingredient.expiry_date && (
                                <div className="h-4 w-4" />
                              )}
                            </div>

                            {/* 材料情報 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {ingredient.name}
                                </h4>
                                {ingredient.quantity && ingredient.unit && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0.5 flex-shrink-0"
                                  >
                                    {ingredient.quantity}
                                    {ingredient.unit}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {ingredient.expiry_date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(
                                      ingredient.expiry_date
                                    ).toLocaleDateString('ja-JP')}
                                  </span>
                                )}
                                {ingredient.notes && (
                                  <span className="flex items-center gap-1 truncate">
                                    <FileText className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {ingredient.notes}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* アクションボタン */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(ingredient)}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>

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
                                  <AlertDialogTitle>
                                    材料を削除しますか？
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    「{ingredient.name}
                                    」を削除します。この操作は取り消せません。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    キャンセル
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(ingredient.id)}
                                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                  >
                                    削除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
