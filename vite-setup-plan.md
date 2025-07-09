# Vite開発環境セットアップ計画

## 概要
「FACE」Chrome拡張機能の開発環境をViteで構築するための計画書

## 現在の状況
- Chrome拡張機能「FACE」（Webページに顔画像を追加する機能）
- manifest.json（manifest version 2）
- 既存のビルドシステムなし
- 純粋なHTML/CSS/JS構成

## 目標
- Viteを使用したモダンな開発環境の構築
- TypeScript対応（オプション）
- HMR（Hot Module Replacement）によるリアルタイム開発
- 最適化されたビルドプロセス
- 開発サーバーでの拡張機能テスト

## 実装計画

### 1. プロジェクト初期化
- `package.json`の作成
- 必要な依存関係の追加
  - `vite`（メインビルドツール）
  - `@vitejs/plugin-react`または`@vitejs/plugin-vanilla`
  - `vite-plugin-web-extension`（拡張機能対応）

### 2. Vite設定ファイルの作成
- `vite.config.js`の作成
- 拡張機能用の設定
  - エントリーポイント設定
  - ビルドターゲット設定
  - 静的ファイル処理

### 3. プロジェクト構造の整理
```
src/
├── manifest.json
├── content-scripts/
│   └── face.js
├── popup/
│   ├── settings.html
│   ├── settings.js
│   └── settings.css
└── icons/
    └── (既存アイコン)
```

### 4. 開発スクリプトの設定
- `npm run dev`：開発サーバー起動
- `npm run build`：本番ビルド
- `npm run preview`：ビルド結果のプレビュー

### 5. 拡張機能のローディング方法
- `dist/`フォルダを拡張機能として読み込み
- 開発中の自動リロード設定

## 期待される効果
- 高速な開発サイクル
- モダンなJavaScript機能の利用
- 効率的なバンドル最適化
- 拡張機能開発の生産性向上

## 実装手順
1. package.jsonの作成と依存関係インストール
2. vite.config.jsの設定
3. srcディレクトリの作成と既存ファイルの移動
4. manifest.jsonの調整
5. 開発サーバーの起動テスト
6. ビルドプロセスの確認

## 注意事項
- manifest version 2から3への移行も検討可能
- 既存の機能を維持しながら段階的に改善
- ChromeとFirefoxの両対応を継続