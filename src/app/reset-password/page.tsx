'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChefHat,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { updatePassword, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ユーザーがログインしていない場合はホームページにリダイレクト
    if (user) {
      // パスワードリセットフローが完了したらメインページへ
      const handlePasswordReset = async () => {
        // URLからハッシュフラグメントを確認
        if (window.location.hash.includes('access_token')) {
          setMessage(
            'パスワードをリセットできます。新しいパスワードを入力してください。'
          );
        } else {
          router.push('/');
        }
      };
      handlePasswordReset();
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error.message);
      } else {
        setMessage('パスワードが正常に更新されました');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* ロゴ部分 - AuthFormと統一 */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-white rounded-full shadow-lg">
            <ChefHat className="h-10 w-10 sm:h-12 sm:w-12 text-orange-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent text-center">
            レシピ管理アプリ
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center mt-1 sm:mt-2">
            美味しい料理を、いつでも簡単に
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">
              パスワードリセット
            </CardTitle>
            <CardDescription className="text-sm">
              新しいパスワードを設定してください
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 新しいパスワード */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  新しいパスワード
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="新しいパスワードを入力"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 text-base sm:text-sm h-11 sm:h-10"
                    required
                  />
                </div>
              </div>

              {/* パスワード確認 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">
                  パスワード確認
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="パスワードを再入力"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="pl-10 text-base sm:text-sm h-11 sm:h-10"
                    required
                  />
                </div>
              </div>

              {/* エラー・成功メッセージ */}
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="border-green-200 bg-green-50 text-green-800 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {/* 更新ボタン */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 h-11 sm:h-10 text-base sm:text-sm font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  'パスワードを更新'
                )}
              </Button>

              {/* ホームに戻るボタン */}
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full h-11 sm:h-10 text-base sm:text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                ホームに戻る
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
