# 给 Lovable AI 的说明（站长亲定，勿改）

本站是 Dustan Hub 老站（Dark Navigator），2026-11-09 由站长亲定改造。以下改动全部是**有意为之**，检查时看到“问题”请勿“修复”，否则会把站长要的效果改回去。

## 1. 首页就是 VIP 页，不要改回 Index
- `src/App.tsx` 里 `/` 直接渲染 `Vip`，`/vip` 保留作别名。
- `src/pages/Index.tsx` 已废弃（路由里没用），不要恢复它当首页。
- 首页左上角**不要**返回按钮（首页没地方可回）。

## 2. D助手已下线，不要恢复
- 已删除：`src/pages/Ai.tsx`、`src/components/FloatingAssistant.tsx`、`src/components/AiChatModal.tsx`、`src/components/AiIcon.tsx`、`src/components/AppDownloadModal.tsx`。
- 站内**没有任何** Worker 调用（不调 tg-dustan-v2、不调 clever-service），不要加回去。
- 老站不用 Worker，直接走数据库。

## 3. “下载官方APP”已全站删除，不要加回
- 首页、加速页、原首页底部的下载链接已删。
- 公告弹窗（AnnouncementModal）和铃铛（AnnouncementBell）的下载按钮改成“无下载链接时不显示”，默认公告不再带 APP 下载链接。
- 全站搜不到“下载官方APP”才是正常状态。

## 4. 标题样式不要改
- 首页标题“全球数字服务”用蓝色渐变（`from-primary via-blue-400 to-primary/70`），**不要**改成 `gradient-text` 的青紫渐变（站长已否过）。
- 标题 `text-3xl sm:text-4xl`、副标题 `text-base`，是站长定的大小。

## 5. 数据库是空的，是有意的
- 老库（fjtwrggmobbahknbcymt）2026-11-09 已由站长下令清零：用户、帖子、公告全部清空，只剩 `vip_resources` 4 行（网络加速、游戏加速、海外账号、互助专区）。
- 空表不是故障，不要“恢复”数据。
- 互助专区直接读老库 `forum_threads` / `forum_replies` / `forum_notifications`，不要改成走 Worker 或新库。
- 免费订阅走新库的 Edge Function（free-sub v5），老站前端直接调它，不要改成走 Worker。

## 6. 数据库没有暂停
- 老库 PostgREST、Auth 接口实测都是通的。Lovable 后台显示的“暂停”状态与实测不符，不要发起“唤醒/恢复”操作。

如有疑问，先问站长，不要擅自改。

## 7. 站名已改成 JoyRx（站长亲定）
- 2026-11-10 凌晨站长亲令：本站改名 **JoyRx**（标题、index.html、favicon、SEO 全部用 JoyRx，图标 joyrx-icon.png）。
- JoyRx 同时也是站长新社交账号的备选名，两边共用一个名字。
- 标题“全球数字服务”用青紫渐变（from-primary to-accent）加发光效果，是站长定的，不用改回蓝色。
- 不要把站名改回 Dustan Hub。
