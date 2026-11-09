import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, X } from "lucide-react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";
import SiteFooter from "@/components/SiteFooter";

const FLCLASH_APK_URL = "https://wwwa.qyshare.com:2083/s/nujcn8";
const FLCLASH_FOLDER_URL = "https://wwwa.qyshare.com/s/3vfjoi";

const sections = [
  {
    num: "1",
    title: "网络加速",
    content: (
      <>
        <p>点击"网络加速"卡片进入加速页，选择服务商后：</p>
        <ol>
          <li>注册账号</li>
          <li>选择套餐</li>
          <li>完成付款</li>
          <li>复制订阅链接：付费套餐的订阅链接在机场官网首页里复制</li>
          <li>打开 FLClash，进入"配置"→点击"+"→"从 URL 导入"，粘贴订阅链接并提交</li>
          <li>进入"代理"页面，点击"测速"，选择延迟最低或想要的国家节点</li>
          <li>返回"仪表盘"，点击"开始"即可使用</li>
        </ol>
        <a
          href={FLCLASH_APK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-transform hover:scale-105"
          style={{ background: "linear-gradient(135deg, #38bdf8, #6366f1)" }}
        >
          下载 FLClash 0.9.3 安卓版
        </a>
        <p className="text-sm text-muted-foreground mt-2">
          桌面版也有：
          <a
            href={FLCLASH_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            style={{ color: "#38bdf8" }}
          >
            点这里下载
          </a>
          （电脑 41.27MB、Mac 56.41MB、Linux 38.61MB）
        </p>
        <p className="text-sm text-muted-foreground mt-2">如果下载速度不稳，请使用备用下载：打开分享链接，分享页里面就有备用下载，不用另外找链接。</p>
      </>
    ),
  },
  {
    num: "2",
    title: "海外账号",
    content: (
      <ol>
        <li>点击"海外账号"卡片进入账号商城</li>
        <li>搜索所需账号类型（如谷歌账号请搜索"Gmail"，一个 Gmail 账号可登录所有谷歌产品）</li>
        <li>下单付款前，请仔细阅读购买须知</li>
        <li>使用过程中如有任何问题，请联系商城网站客服</li>
      </ol>
    ),
  },
  {
    num: "3",
    title: "游戏加速",
    content: (
      <ol>
        <li>点击"游戏加速"卡片，查看详情并复制兑换码</li>
        <li>去官网下载给梨加速器，注册登录账号</li>
        <li>在 App 内找到兑换入口，输入兑换码，领终身免费</li>
        <li>选好游戏，开始加速</li>
      </ol>
    ),
  },
  {
    num: "4",
    title: "互助专区",
    content: (
      <p>如需寻找特定软件或遇到问题，欢迎前往互助专区求助。客服将第一时间回复，站长看到后也会第一时间处理。</p>
    ),
  },
  {
    num: "5",
    title: "常见问题",
    content: (
      <ul className="space-y-3">
        <li>
          <div className="font-semibold text-foreground">订阅链接如何导入？</div>
          <div className="text-muted-foreground text-sm mt-0.5">→ FLClash → 配置 → + → 从 URL 导入</div>
        </li>
        <li>
          <div className="font-semibold text-foreground">导入后无法连接？</div>
          <div className="text-muted-foreground text-sm mt-0.5">→ 回到代理页面，测试速度，查看选中的节点是否正常</div>
        </li>
        <li>
          <div className="font-semibold text-foreground">流量用完后无法使用？</div>
          <div className="text-muted-foreground text-sm mt-0.5">→ 属正常现象，可升级套餐或等待下月重置</div>
        </li>
      </ul>
    ),
  },
];

const Tutorials = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <SEO
        title="教程与帮助"
        description="从注册到使用，一步一步教您上手"
        path="/tutorials"
        noindex
      />
      <ParticleBackground />

      <main className="relative z-10 px-4 pt-5 pb-8 sm:py-8 flex flex-col items-center min-h-screen">
        <div className="w-full max-w-2xl flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/vip")}
            className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <UserNav />
            <button
              onClick={() => navigate("/vip")}
              className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-blue-400 to-primary/70 bg-clip-text text-transparent">
            教程与帮助
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            从注册到使用，一步一步教您上手
          </p>
        </motion.div>

        <div className="w-full max-w-2xl space-y-4">
          {sections.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-5 border border-white/10"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <h2 className="flex items-center gap-2.5 mb-3">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold"
                  style={{ background: "#38bdf8", color: "#0a0a12" }}
                >
                  {s.num}
                </span>
                <span className="font-bold text-base" style={{ color: "#38bdf8" }}>
                  {s.title}
                </span>
              </h2>
              <div className="text-sm leading-7 text-muted-foreground [&_ol]:pl-5 [&_ol]:list-decimal [&_p]:mb-1">
                {s.content}
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => navigate("/vip")}
          className="mt-8 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-transform hover:scale-105"
          style={{ background: "linear-gradient(135deg, #38bdf8, #6366f1)" }}
        >
          返回
        </button>

        <SiteFooter />
      </main>
    </div>
  );
};

export default Tutorials;
