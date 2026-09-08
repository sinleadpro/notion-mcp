# Notion MCP 設定（從 0 開始）

用 `sinleadpro/notion-mcp`（fork 自 `shck-dev/notion-mcp`）。
Fork 的原因：上游在 api/v3 請求沒帶 User-Agent header，會被 Cloudflare 擋下並回 403 HTML，導致 `notion_search` 完全不能用。修正在 branch `fix/browser-ua-cloudflare-403`。

前置需求：Node 18+、git。

---

## 1. Clone 並建置

```bash
cd ~/Documents/work/sinleadpro
git clone -b fix/browser-ua-cloudflare-403 git@github.com:sinleadpro/notion-mcp.git
cd notion-mcp
npx -y esbuild@0.25.0 src/server.ts --bundle --platform=node --format=esm --outfile=dist/server.js
chmod +x dist/server.js
```

> `dist/` 有被 gitignore，所以 clone 後一定要自己 build。
> 官方工具鏈是 bun（`bun run build`），上面的 esbuild 指令是等價替代，不必裝 bun。

## 2. 取得 Notion 憑證

瀏覽器登入 Notion → DevTools（F12）→ Network → 隨便點一下頁面，找一個 `notion.so/api/v3/...` 的請求 → 右鍵 **Copy as cURL**。

```bash
node dist/server.js init
```

貼上 cURL，按 **Ctrl-D**。它會抽出 token / userId / spaceId 寫進 `~/.notion-mcp/config.json`。

> 那串 cURL 含 `token_v2` session cookie，等於帳號完整權限，不要外流。
> 多個 workspace 時它會列出來，再跑一次並指定 space 即可。

## 3. 註冊 MCP

```bash
claude mcp add notion -s user -- node ~/Documents/work/sinleadpro/notion-mcp/dist/server.js
```

## 4. 重啟並驗證

改設定不會影響已經在跑的 server process，要用 `/mcp` 重連或重開 Claude Code。

```bash
claude mcp list | grep notion     # 應顯示 ✔ Connected
```

然後在對話中呼叫 `notion_search` 試搜一個關鍵字。

---

## 選用設定

`~/.notion-mcp/config.json`：

| 欄位 | 說明 |
|---|---|
| `token` / `userId` / `spaceId` | 憑證，由 `init` 寫入 |
| `userAgent` | 選填。覆寫送出的 User-Agent |

對應的環境變數：`NOTION_TOKEN`、`NOTION_USER_ID`、`NOTION_SPACE_ID`、`NOTION_USER_AGENT`、`NOTION_MCP_CONFIG_DIR`（換 config 目錄）、`NOTION_DEBUG=1`（輸出請求記錄到 stderr）。

優先序：**環境變數 > config.json > 內建預設**。

## 疑難排解

**`403` + 一堆 HTML** — Cloudflare 擋的，代表 UA 沒送出去。確認跑的是 fork 的 `dist/server.js`（`claude mcp list` 看路徑）且已 build。若哪天 Cloudflare 收緊規則，從瀏覽器複製一個當下的 UA 填進 `userAgent` 即可，不必等上游改。

**`401` / 提示 token 過期** — Notion 會定期輪替 session cookie，重跑步驟 2 就好。

**改了程式碼沒反應** — 要重新 build（`dist/` 不會自動更新），然後重連 MCP。

## 維護

- 本機 clone 停在 `fix/browser-ua-cloudflare-403`。MCP 直接跑該目錄的 `dist/`，所以**切 branch 等於改 MCP 行為**；建議把修正 merge 進 fork 的 main。
- 同步上游：`git fetch upstream && git rebase upstream/main`，然後重新 build。
