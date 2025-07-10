# PR #12: feat: Set up Vite development environment for Chrome extension

## 概要
PR #12では、FACE Chrome拡張機能のVite開発環境をセットアップしました。

**PR URL:** https://github.com/oshimaryo/face/pull/12

## 実施内容

### 1. 初期状態
- PR #12をチェックアウト（ブランチ: `claude/issue-11-20250709_145010`）
- 初回ビルドで複数のエラーが発生

### 2. ビルドエラーの修正

#### スクリプトタグのtype属性
- **問題**: HTMLファイル内のscriptタグに`type="module"`属性が必要
- **解決**: popup/settings.htmlとsrc/popup/settings.htmlの両方に`type="module"`を追加

#### Vite設定の問題
- **問題**: `inlineDynamicImports`オプションのエラー
- **解決**: vite.config.jsを以下のように修正:
  ```javascript
  export default defineConfig({
    root: 'src',
    publicDir: '../public',
    plugins: [
      webExtension({
        manifest: 'manifest.json'
      })
    ],
    build: {
      outDir: '../dist',
      emptyOutDir: true
    }
  })
  ```

### 3. 動作不良の修正

#### 複数の顔が生成される問題
- **問題**: クリックすると新しい顔が生成されてしまう
- **解決**: 重複チェックを削除（各タブで独立したインスタンスが必要なため）

#### アイコンが表示されない問題
- **問題**: ビルド後にアイコンが表示されない
- **解決**: publicディレクトリを作成し、アイコンをコピー

### 4. Manifest V3への移行

#### 非推奨警告への対応
- **問題**: Manifest V2の非推奨警告
- **解決**: Manifest V3に移行
  - `manifest_version`を3に変更
  - `browser_action`を`action`に変更
  - パーミッション構造を更新

#### 権限エラーの修正
- **問題**: Manifest V3移行後、顔が表示されない
- **解決**: 
  - 必要なパーミッションを追加（`storage`, `activeTab`, `scripting`）
  - 古い`executeScript`呼び出しを削除

### 5. マルチタブサポートの修正

#### 最初のタブでのみ動作する問題
- **問題**: 2番目以降のタブで顔が表示されない
- **解決**: 重複防止チェックを削除し、各タブで独立して動作するように修正

#### ページ読み込み時の問題
- **問題**: 拡張機能インストール後、既存のページで動作しない
- **解決**: manifest.jsonに`"run_at": "document_idle"`を追加

## 最終的な変更内容

1. **vite.config.js**: 適切なディレクトリ構造に対応
2. **manifest.json**: Manifest V3に完全移行
3. **content-scripts/face.js**: マルチタブサポートと初期化処理の改善
4. **popup/settings.js**: Manifest V3対応のメッセージ送信
5. **HTMLファイル**: ES moduleサポート

## コミット履歴
- 最終コミット: "Update PR #12: Fix build errors, migrate to Manifest V3, and improve multi-tab support"
  - すべてのビルドエラーを修正
  - Manifest V3への移行完了
  - マルチタブサポートの改善
  - コンテンツスクリプトの適切な注入タイミング設定

## ステータス
PR #12は正常に更新され、すべての修正が反映されました。拡張機能は以下の状態で正しく動作します：
- Viteでのビルドが成功
- Chrome/Firefoxの両方で動作
- 複数タブでの適切な動作
- Manifest V3準拠