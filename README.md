# KeyBloom 英文打字練習

使用 React、TypeScript 與 Vite 製作的繁體中文打字遊戲。共 10 個關卡，每關命中 20 次即可前進；進度會自動保存在目前瀏覽器。

[線上遊玩 KeyBloom](https://keybloom-typing-game.nickycho.workers.dev)

## 本機開發

使用 Node.js 24.11.1（版本記錄於 `.node-version`）。

```bash
npm ci
npm run dev
```

## 正式建置與預覽

```bash
npm run build
npm run preview
```

正式網站檔案會輸出至 `dist/`。部署前請確認鍵盤輸入、關卡解鎖與重新整理後的進度保存正常。

## 部署到 Cloudflare（CLI）

專案使用 Wrangler CLI 將本機建置好的 `dist/` 上傳到 Cloudflare Workers Static Assets。程式碼保存在 [GitHub 私人儲存庫](https://github.com/nickycho/typing-game)。

首次部署前，先登入 Cloudflare：

```bash
npx wrangler login
```

登入時需在瀏覽器完成授權。之後首次上線與每次更新都使用：

```bash
npm run deploy
```

此指令會先執行 TypeScript 檢查與正式建置，成功後才依 `wrangler.jsonc` 將 `dist/` 部署到 `keybloom-typing-game`。首次執行時會建立 Worker；無須另外建立 Pages 專案。完成後，以 CLI 回傳的 `*.workers.dev` 正式網站網址分享給使用者。

網站由 Cloudflare 直接提供靜態檔案，並設定 SPA 頁面回退。推送 GitHub 本身不會觸發網站更新；需要自動部署時可再加入 GitHub Actions。

此版本沒有後端 API，不需設定 API 金鑰或資料庫。Wrangler 的登入資料由本機工具管理，請勿將憑證加入版本控制。

- [Cloudflare Static Assets 部署說明](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Cloudflare SPA 設定](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)

## 進度保存

進度儲存在瀏覽器的 `localStorage`，儲存鍵為 `keybloom.progress.v1`。不同裝置、瀏覽器及網站網域的進度各自獨立；本機開發網址的進度不會自動搬到正式網址。清除網站資料或使用無痕模式可能使進度無法保留。

目前以實體鍵盤操作；尚未提供帳號登入或跨裝置同步。
