# X-Ray ブラウザ自動操作ガイド

このドキュメントは、SeleniumやPuppeteer等のブラウザ自動操作ツールでX-Ray拡張機能を操作するための`data-testid`属性の一覧です。

## 概要

すべての主要なUI要素に`data-testid`属性を追加しました。これにより、CSSクラスの変更に影響されない堅牢なセレクタでの要素特定が可能です。

## セレクタ一覧

### SearchForm（検索フォーム）

#### 入力フィールド
| data-testid | 説明 | タイプ |
|------------|------|--------|
| `search-keyword-input` | キーワード入力 | text |
| `search-from-user-input` | ユーザー指定入力 | text |
| `search-min-faves-input` | 最小いいね数 | number |
| `search-min-retweets-input` | 最小リツイート数 | number |
| `search-min-replies-input` | 最小返信数 | number |
| `search-since-date-input` | 開始日 | date |
| `search-until-date-input` | 終了日 | date |
| `search-language-select` | 言語選択 | select |

#### ボタン
| data-testid | 説明 |
|------------|------|
| `get-current-user-button` | 現在のタブからユーザー名取得 |
| `search-execute-button` | 検索実行 |
| `search-save-preset-button` | プリセット保存 |

### ExtractionPanel（抽出パネル）

| data-testid | 説明 |
|------------|------|
| `extract-tweets-button` | ページから抽出 |
| `export-csv-button` | CSV保存 |
| `export-markdown-button` | Obsidian保存 |
| `select-folder-button` | 保存先フォルダ設定 |
| `clear-data-button` | データクリア |

### App（メインアプリ）

| data-testid | 説明 |
|------------|------|
| `theme-toggle-button` | ダーク/ライトモード切り替え |

---

## 使用例

### Selenium (Python)

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 拡張機能のサイドパネルに切り替え
# (実際の実装は拡張機能のコンテキストに依存)

# キーワード入力
keyword_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="search-keyword-input"]')
keyword_input.send_keys("AI")

# 最小いいね数を設定
min_faves = driver.find_element(By.CSS_SELECTOR, '[data-testid="search-min-faves-input"]')
min_faves.clear()
min_faves.send_keys("100")

# 検索実行
search_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="search-execute-button"]')
search_btn.click()

# 抽出実行
extract_btn = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="extract-tweets-button"]'))
)
extract_btn.click()

# CSV保存（抽出完了を待つ）
time.sleep(5)  # または適切な待機条件
csv_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="export-csv-button"]')
csv_btn.click()
```

### Puppeteer (JavaScript/TypeScript)

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // 拡張機能をロード
    args: [
      `--disable-extensions-except=/path/to/X-Ray/dist`,
      `--load-extension=/path/to/X-Ray/dist`
    ]
  });

  const page = await browser.newPage();
  
  // サイドパネルにアクセス（実際の方法は拡張機能の実装に依存）
  
  // キーワード入力
  await page.type('[data-testid="search-keyword-input"]', 'AI');
  
  // 最小いいね数を設定
  await page.click('[data-testid="search-min-faves-input"]');
  await page.keyboard.press('Backspace');
  await page.type('[data-testid="search-min-faves-input"]', '100');
  
  // 検索実行
  await page.click('[data-testid="search-execute-button"]');
  
  // 抽出実行
  await page.waitForSelector('[data-testid="extract-tweets-button"]');
  await page.click('[data-testid="extract-tweets-button"]');
  
  // CSV保存
  await page.waitForTimeout(5000); // 抽出完了を待つ
  await page.click('[data-testid="export-csv-button"]');
  
  await browser.close();
})();
```

### Playwright (JavaScript/TypeScript)

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=/path/to/X-Ray/dist`,
      `--load-extension=/path/to/X-Ray/dist`
    ]
  });

  const page = await browser.newPage();
  
  // キーワード入力
  await page.fill('[data-testid="search-keyword-input"]', 'AI');
  
  // ユーザー指定
  await page.fill('[data-testid="search-from-user-input"]', 'elonmusk');
  
  // 言語選択
  await page.selectOption('[data-testid="search-language-select"]', 'en');
  
  // 検索実行
  await page.click('[data-testid="search-execute-button"]');
  
  // 抽出実行
  await page.click('[data-testid="extract-tweets-button"]');
  
  // 抽出完了を待つ（より堅牢な方法）
  await page.waitForFunction(() => {
    const count = document.querySelector('[data-testid="extract-tweets-button"]');
    // ボタンのテキストや状態で判断
    return true; // 実際の条件を設定
  });
  
  // CSV保存
  await page.click('[data-testid="export-csv-button"]');
  
  await browser.close();
})();
```

---

## ベストプラクティス

### 1. 明示的な待機を使用
```python
# ❌ 悪い例
time.sleep(5)

# ✅ 良い例
WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="extract-tweets-button"]'))
)
```

### 2. 要素の状態を確認
```javascript
// ボタンが有効（disabled=false）であることを確認
await page.waitForFunction(() => {
  const btn = document.querySelector('[data-testid="export-csv-button"]');
  return btn && !btn.disabled;
});
```

### 3. エラーハンドリング
```python
try:
    element = driver.find_element(By.CSS_SELECTOR, '[data-testid="search-execute-button"]')
    element.click()
except NoSuchElementException:
    print("検索ボタンが見つかりません")
except ElementNotInteractableException:
    print("検索ボタンがクリックできません")
```

---

## 注意事項

1. **Chrome拡張機能のコンテキスト**: サイドパネルへのアクセス方法はブラウザ自動化ツールによって異なります
2. **非同期処理**: データ抽出は非同期で行われるため、適切な待機が必要です
3. **disabled状態**: CSV保存ボタンなどは、データが抽出されるまで`disabled`状態です

---

## トラブルシューティング

### 要素が見つからない
```python
# セレクタの確認
element = driver.find_element(By.CSS_SELECTOR, '[data-testid="search-keyword-input"]')
print(element.get_attribute('outerHTML'))
```

### クリックできない
```python
# JavaScriptでクリック
driver.execute_script("arguments[0].click();", element)
```

### サイドパネルにアクセスできない
Chrome拡張機能のサイドパネルは通常のページとは異なるため、専用の方法でアクセスする必要があります。詳細はブラウザ自動化ツールのドキュメントを参照してください。
