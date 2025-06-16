'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        setMessage('ログインしました');
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setMessage(
          '確認メールを送信しました。メールボックスをご確認ください。'
        );
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setMessage('パスワードリセットメールを送信しました。');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin':
        return 'ログイン';
      case 'signup':
        return '新規登録';
      case 'reset':
        return 'パスワードリセット';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin':
        return 'レシピ管理を始めましょう';
      case 'signup':
        return '新しいアカウントを作成';
      case 'reset':
        return 'パスワードをリセット';
    }
  };

  const getButtonText = () => {
    if (loading)
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          処理中...
        </>
      );
    switch (mode) {
      case 'signin':
        return 'ログイン';
      case 'signup':
        return 'アカウント作成';
      case 'reset':
        return 'リセットメール送信';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* ロゴ部分 - モバイル優先 */}
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
            <CardTitle className="text-lg sm:text-xl">{getTitle()}</CardTitle>
            <CardDescription className="text-sm">
              {getDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* メールアドレス */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  メールアドレス
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 text-base sm:text-sm h-11 sm:h-10"
                    required
                  />
                </div>
              </div>

              {/* パスワード（リセット時は非表示） */}
              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    パスワード
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pl-10 text-base sm:text-sm h-11 sm:h-10"
                      required
                    />
                  </div>
                </div>
              )}

              {/* パスワード確認（新規登録時のみ表示） */}
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm">
                    パスワード（確認）
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="もう一度入力してください"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="pl-10 text-base sm:text-sm h-11 sm:h-10"
                      required
                    />
                  </div>
                </div>
              )}

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

              {/* 送信ボタン - モバイル優先 */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 h-11 sm:h-10 text-base sm:text-sm font-medium"
                disabled={loading}
              >
                {getButtonText()}
              </Button>
            </form>

            {/* モード切り替えリンク - モバイル優先 */}
            <div className="mt-4 sm:mt-6 text-center space-y-3">
              {mode === 'signin' && (
                <div className="space-y-2">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setMode('signup')}
                    className="text-muted-foreground hover:text-primary text-sm p-1 h-auto"
                  >
                    アカウントをお持ちでない方はこちら
                  </Button>
                  <br />
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setMode('reset')}
                    className="text-muted-foreground hover:text-primary text-sm p-1 h-auto"
                  >
                    パスワードを忘れた方はこちら
                  </Button>
                </div>
              )}
              {mode === 'signup' && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setMode('signin')}
                  className="text-muted-foreground hover:text-primary text-sm p-1 h-auto"
                >
                  既にアカウントをお持ちの方はこちら
                </Button>
              )}
              {mode === 'reset' && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setMode('signin')}
                  className="text-muted-foreground hover:text-primary text-sm p-1 h-auto"
                >
                  ログインに戻る
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
