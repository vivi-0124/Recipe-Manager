# 🍳 Recipe Manager - 完璧なレシピ管理アプリ

> **材料選択からYouTube検索まで、限界を超えたレシピ発見体験**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

## 🎯 概要

Recipe Managerは、材料選択とYouTube検索を統合した革新的なレシピ管理アプリケーションです。手持ちの材料から最適なレシピを発見し、動画で学習できる完璧なプラットフォームを提供します。

### ✨ 主な特徴

- 🥕 **スマート材料選択** - 手持ちの材料から最適なレシピを提案
- 🔍 **YouTube統合検索** - 高品質なレシピ動画を瞬時に発見
- ⭐ **お気に入り管理** - 気に入ったレシピを簡単保存
- 📱 **完璧レスポンシブ** - あらゆるデバイスで最適表示
- ♿ **アクセシビリティ完備** - 誰でも使いやすい設計
- 💾 **状態永続化** - 検索履歴と選択状態を自動保存

## 🚀 デモ

![Recipe Manager Demo](https://via.placeholder.com/800x400/4ade80/ffffff?text=Recipe+Manager+Demo)

## 🛠️ 技術スタック

### **フロントエンド**

- **Next.js 14** - React フレームワーク（App Router）
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSS
- **shadcn/ui** - 美しいUIコンポーネント

### **バックエンド**

- **Supabase** - データベース・認証・API
- **YouTube Data API v3** - 動画検索・情報取得

### **開発ツール**

- **ESLint** - コード品質管理
- **Prettier** - コードフォーマット
- **Git** - バージョン管理

## 📦 インストール

### 前提条件

- Node.js 18.0.0 以上
- npm または yarn
- Supabase アカウント
- YouTube Data API キー

### セットアップ

1. **リポジトリをクローン**

```bash
git clone https://github.com/vivi-0124/Recipe-Manager.git
cd Recipe-Manager
```

2. **依存関係をインストール**

```bash
npm install
# または
yarn install
```

3. **環境変数を設定**

```bash
cp .env.example .env.local
```

`.env.local` に以下を設定：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key
```

4. **開発サーバーを起動**

```bash
npm run dev
# または
yarn dev
```

5. **ブラウザでアクセス**

```
http://localhost:3000
```

## 🎮 使い方

### 1. **材料選択**

- アコーディオンメニューから使用したい材料を選択
- 「すべて選択」で一括選択も可能
- 選択した材料数がバッジで表示

### 2. **レシピ検索**

- 料理のジャンル（和食、洋食、中華など）を入力
- 選択した材料と組み合わせて自動検索
- YouTube動画から最適なレシピを発見

### 3. **動画視聴**

- サムネイルクリックで詳細表示
- YouTubeで直接視聴可能
- 動画の説明文も確認できる

### 4. **お気に入り管理**

- ⭐ボタンでお気に入りに追加
- 専用タブで管理・整理
- いつでも簡単にアクセス

## 🏗️ プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── favorites/     # お気に入り管理
│   │   ├── ingredients/   # 材料管理
│   │   └── youtube/       # YouTube API
│   ├── reset-password/    # パスワードリセット
│   └── page.tsx          # メインページ
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/ui コンポーネント
│   └── RecipeSearch.tsx  # メインコンポーネント
├── hooks/                # カスタムフック
├── lib/                  # ユーティリティ
└── types/                # TypeScript型定義
```

## 🎨 UIコンポーネント

### shadcn/ui 採用コンポーネント

- **Dialog** - モーダルダイアログ
- **Card** - コンテンツカード
- **Button** - アクションボタン
- **Input** - 入力フィールド
- **Checkbox** - チェックボックス
- **Accordion** - 折りたたみメニュー
- **ScrollArea** - カスタムスクロール
- **Badge** - ステータス表示

## 🔧 開発

### **開発サーバー起動**

```bash
npm run dev
```

### **ビルド**

```bash
npm run build
```

### **型チェック**

```bash
npm run type-check
```

### **リント**

```bash
npm run lint
```

## 📱 レスポンシブ対応

- **モバイル** (< 640px) - 縦並びレイアウト
- **タブレット** (640px - 1024px) - 2カラムグリッド
- **デスクトップ** (> 1024px) - 3-4カラムグリッド

## ♿ アクセシビリティ

- **ARIA属性** 完全対応
- **キーボードナビゲーション** 対応
- **スクリーンリーダー** 対応
- **セマンティックHTML** 使用
- **カラーコントラスト** WCAG準拠

## 🚀 デプロイ

### Vercel（推奨）

```bash
npm run build
vercel --prod
```

### その他のプラットフォーム

- Netlify
- AWS Amplify
- Railway

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 👨‍💻 作者

**vivi-0124**

- GitHub: [@vivi-0124](https://github.com/vivi-0124)

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - 素晴らしいReactフレームワーク
- [Supabase](https://supabase.com/) - 完璧なBaaS
- [shadcn/ui](https://ui.shadcn.com/) - 美しいUIコンポーネント
- [Tailwind CSS](https://tailwindcss.com/) - 効率的なCSS
- [YouTube Data API](https://developers.google.com/youtube/v3) - 動画データ

---

**🍳 美味しいレシピ発見の旅を始めましょう！**
