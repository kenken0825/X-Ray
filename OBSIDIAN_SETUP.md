# Obsidian連携セットアップ

Chrome拡張機能の制限により、iCloudのObsidianフォルダに直接保存することはできません。
以下の方法で、ダウンロードフォルダからObsidianフォルダへ自動的にファイルを移動できます。

## 方法1: シンボリックリンクを使用（推奨）

### 手順

1. ターミナルを開く

2. 以下のコマンドを実行してシンボリックリンクを作成：

```bash
# Downloadsフォルダ内にObsidianへのリンクを作成
ln -s "/Users/kenken/Library/Mobile Documents/iCloud~md~obsidian/Documents/my_note/00_Memo" ~/Downloads/Obsidian-XRay
```

3. X-Ray拡張機能で「保存先フォルダ設定」をクリック

4. サブフォルダ名として `Obsidian-XRay` を入力

5. これで、`~/Downloads/Obsidian-XRay/` に保存されたファイルが、実際には Obsidianの `00_Memo` フォルダに保存されます

### 確認方法

```bash
# リンクが正しく作成されたか確認
ls -la ~/Downloads/ | grep Obsidian
```

## 方法2: 自動移動スクリプト（代替案）

シンボリックリンクが動作しない場合、以下のスクリプトを使用してファイルを自動移動できます。

### スクリプト作成

`~/move-xray-to-obsidian.sh` を作成：

```bash
#!/bin/bash

SOURCE_DIR="$HOME/Downloads/Obsidian/X-Ray"
DEST_DIR="/Users/kenken/Library/Mobile Documents/iCloud~md~obsidian/Documents/my_note/00_Memo"

# ソースディレクトリが存在する場合
if [ -d "$SOURCE_DIR" ]; then
    # .mdファイルを移動
    find "$SOURCE_DIR" -name "*.md" -type f -exec mv {} "$DEST_DIR/" \;
    echo "Files moved to Obsidian"
fi
```

### 実行権限を付与

```bash
chmod +x ~/move-xray-to-obsidian.sh
```

### 使い方

X-Rayでファイルを保存した後、ターミナルで実行：

```bash
~/move-xray-to-obsidian.sh
```

## 方法3: Hazel / Automatorを使用（Mac）

Macの自動化ツールを使用して、Downloadsフォルダを監視し、.mdファイルを自動的にObsidianフォルダに移動することもできます。

### Automator フォルダアクション

1. Automatorを開く
2. 「フォルダアクション」を選択
3. `~/Downloads/Obsidian/X-Ray` を監視対象に設定
4. 「Finderアイテムを移動」アクションを追加
5. 移動先を `/Users/kenken/Library/Mobile Documents/iCloud~md~obsidian/Documents/my_note/00_Memo` に設定

## トラブルシューティング

### シンボリックリンクが動作しない場合

Chromeのセキュリティ設定により、シンボリックリンク経由のダウンロードがブロックされる場合があります。
その場合は、方法2または方法3を使用してください。

### パーミッションエラー

iCloudフォルダへのアクセス権限がない場合：

```bash
# フォルダの権限を確認
ls -la "/Users/kenken/Library/Mobile Documents/iCloud~md~obsidian/Documents/my_note/"

# 必要に応じて権限を変更
chmod 755 "/Users/kenken/Library/Mobile Documents/iCloud~md~obsidian/Documents/my_note/00_Memo"
```
