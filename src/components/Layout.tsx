'use client';

import { useAuth } from '@/hooks/useAuth';
import AuthForm from './AuthForm';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChefHat, LogOut, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* モバイル優先ヘッダー */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* ロゴ・タイトル - モバイルでコンパクト */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                <span className="sm:hidden">レシピ</span>
                <span className="hidden sm:inline">レシピ管理アプリ</span>
              </h1>
            </div>

            {/* デスクトップナビゲーション */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-700">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <SignOutButton />
            </div>

            {/* モバイル/タブレットナビゲーション */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-80 sm:w-96">
                  <SheetHeader>
                    <SheetTitle className="text-left">メニュー</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-6 pt-6">
                    {/* ユーザー情報 */}
                    <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-orange-100 text-orange-700 text-lg">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">ユーザー</p>
                        <p className="text-sm text-muted-foreground truncate max-w-48">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* サインアウトボタン */}
                    <div className="px-2">
                      <SignOutButton />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ - モバイル優先パディング */}
      <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* フッター - モバイルでコンパクト */}
      <footer className="sticky top-full border-t bg-background/50 backdrop-blur mt-8">
        <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-4 w-4 text-orange-500" />
                <span className="text-xs sm:text-sm text-muted-foreground text-center">
                  美味しい料理を、いつでも簡単に
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                © 2025 レシピ管理アプリ. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SignOutButton() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      size="sm"
      className="w-full lg:w-auto text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
    >
      <LogOut className="mr-2 h-4 w-4" />
      ログアウト
    </Button>
  );
}
