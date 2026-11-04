# KeyBloom 英文打字練習

使用 React、TypeScript 與 Vite 製作的繁體中文打字遊戲。共 10 個關卡，每關命中 20 次即可前進；進度會自動保存在目前瀏覽器。

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

## 部署到 Cloudflare Pages

1. 將此專案推送到 GitHub 儲存庫。
2. 在 Cloudflare 控制台進入 **Workers & Pages → Create application → Pages → Import an existing Git repository**，連結該儲存庫。
3. 設定以下建置選項：

   | 設定 | 值 |
   | --- | --- |
   | Production branch | `main` |
   | Framework preset | React (Vite) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | 儲存庫根目錄 |

4. 選擇 **Save and Deploy**。成功後可分享 Cloudflare 提供的 `*.pages.dev` 網址。
5. 後續推送到 `main` 時，Cloudflare Pages 會自動建置並更新正式網站。

此版本沒有後端 API，不需設定 API 金鑰或資料庫。Cloudflare Pages 會讀取 `.node-version` 使用指定的 Node.js 版本。

- [Cloudflare React 部署說明](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [Cloudflare 建置環境與 Node.js 版本](https://developers.cloudflare.com/pages/configuration/build-image/)

## 進度保存

進度儲存在瀏覽器的 `localStorage`，儲存鍵為 `keybloom.progress.v1`。不同裝置、瀏覽器及網站網域的進度各自獨立；本機開發網址的進度不會自動搬到正式網址。清除網站資料或使用無痕模式可能使進度無法保留。

目前以實體鍵盤操作；尚未提供帳號登入或跨裝置同步。
