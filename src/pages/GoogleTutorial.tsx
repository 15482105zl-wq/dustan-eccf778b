import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";
import SiteFooter from "@/components/SiteFooter";

const sections = [
  {
    num: "1",
    title: "各品牌说明",
    content: (
      <>
        <p>在安装之前，请先确认您的手机是否自带谷歌服务。部分品牌手机的系统已内置服务框架与 Play 服务，重复安装反而会导致闪退或无法使用。请先打开设置查看是否有 Google 入口，或打开本机应用商店搜索“谷歌”，确认后再按以下说明操作：</p>
        <ul className="space-y-3 mt-3">
          <li>
            <div className="font-semibold text-foreground">Vivo / iQOO</div>
            <div className="text-muted-foreground text-sm mt-0.5">服务框架与 Play 服务为系统内置，无需安装。Play 商店可在 Vivo 应用商店中搜索“谷歌”下载安装，或前往网盘 Google全家桶安装 ❸Play 商店。安装后登录谷歌账号即可使用。如设置 → 系统管理与升级中没有 Google 入口，请按普通安卓流程安装三件套。</div>
          </li>
          <li>
            <div className="font-semibold text-foreground">小米 / 红米</div>
            <div className="text-muted-foreground text-sm mt-0.5">系统已内置谷歌服务框架。请先在设置中搜索“谷歌基础服务”并打开开关，再到小米应用商店搜索“谷歌”安装 Play 商店即可。请勿自行安装 Play 服务，以免与系统内置服务冲突。</div>
          </li>
          <li>
            <div className="font-semibold text-foreground">OPPO / 一加 / 真我</div>
            <div className="text-muted-foreground text-sm mt-0.5">系统已内置谷歌服务框架。请先在设置中搜索“谷歌”，打开“谷歌移动服务”开关，再到软件商店搜索“谷歌”安装。如商店中搜索不到，请按下方“安装三件套”流程操作。</div>
          </li>
          <li>
            <div className="font-semibold text-foreground">荣耀</div>
            <div className="text-muted-foreground text-sm mt-0.5">请先在设置 → 用户和账户中打开“Google Play 服务”开关，再到应用市场搜索“谷歌”，即可下载谷歌系列应用。</div>
          </li>
          <li>
            <div className="font-semibold text-foreground">三星</div>
            <div className="text-muted-foreground text-sm mt-0.5">Play 商店为系统预装，直接在桌面或应用列表中打开即可使用，无需安装。</div>
          </li>
          <li>
            <div className="font-semibold text-foreground">华为</div>
            <div className="text-muted-foreground text-sm mt-0.5">鸿蒙 4.x 及以下机型请勿直接安装三件套，请前往网盘“华为Gbox辅助”目录下载 GBox（首选，无广告）或 GSpace（备选，有广告），在沙盒环境内使用谷歌服务。建议使用不重要的小号登录，消息推送可能延迟。鸿蒙 5.0 以上机型目前暂无稳定方案，建议使用其他品牌设备。</div>
          </li>
          <li>
            <div className="font-semibold text-foreground">魅族</div>
            <div className="text-muted-foreground text-sm mt-0.5">请在应用商店搜索“谷歌”，下载谷歌安装器一键安装即可。</div>
          </li>
          <li>
            <div className="font-semibold text-foreground">其他品牌</div>
            <div className="text-muted-foreground text-sm mt-0.5">如本机应用商店搜索不到 Play 商店，请按下方“安装三件套”流程操作。</div>
          </li>
        </ul>
      </>
    ),
  },
  {
    num: "2",
    title: "安装三件套",
    content: (
      <>
        <p>请先连接好网络加速，再按以下顺序安装：</p>
        <ol>
          <li>前往网盘：高价值资源包 → 热门应用 → Google全家桶</li>
          <li>按顺序安装：❶服务框架（请按您的安卓版本选择，查看方法：设置 → 关于手机 → Android 版本，显示几就选几）→ ❷Play 服务 → ❸Play 商店</li>
          <li>安装完成后重启手机</li>
          <li>三件套无需使用 SAI 安装，直接安装即可</li>
        </ol>
      </>
    ),
  },
  {
    num: "3",
    title: "注册谷歌账号",
    content: (
      <>
        <p>请先连接好网络加速，再按以下步骤注册：</p>
        <ol>
          <li>打开浏览器访问 accounts.google.com/signup，或在 Gmail、Play 商店中选择创建账号</li>
          <li>填写姓名，设置一个未被使用过的 Gmail 用户名与密码</li>
          <li>确认生日与性别</li>
          <li>如要求手机号验证，请填写手机号并输入收到的验证码</li>
          <li>同意服务条款，完成注册</li>
        </ol>
        <p className="mt-2">如注册时卡住：国内手机号可能收不到验证码，请检查短信拦截、换个时间再试，请勿在短时间内反复提交。</p>
      </>
    ),
  },
  {
    num: "4",
    title: "现成账号",
    content: (
      <p>如自行注册遇到困难，可在站内“海外账号”卡片中搜索“Gmail”购买现成账号。一个 Gmail 账号可登录所有谷歌服务，成品号自动发货，购买后请改绑为自己的手机号。</p>
    ),
  },
  {
    num: "5",
    title: "常见问题",
    content: (
      <ul className="space-y-3">
        <li>
          <div className="font-semibold text-foreground">Play 服务装不上或更新不了？</div>
          <div className="text-muted-foreground text-sm mt-0.5">请确认版本与您的安卓版本对应；如已安装旧版，请先在应用管理中卸载更新，再安装新包，否则会因签名冲突失败；之后请按顺序重新安装三件套。</div>
        </li>
        <li>
          <div className="font-semibold text-foreground">提示软件包冲突？</div>
          <div className="text-muted-foreground text-sm mt-0.5">多为签名不一致所致，请先卸载或停用同名应用包，再重新安装。</div>
        </li>
        <li>
          <div className="font-semibold text-foreground">登录时要求验证本人号码？</div>
          <div className="text-muted-foreground text-sm mt-0.5">请确认使用的是账号绑定的号码；反复失败时请停一会儿再试，检查短信拦截，或使用备用邮箱验证；购买的现成账号请先改绑为自己的手机号；验证期间请保持网络加速稳定，请勿频繁切换节点。</div>
        </li>
        <li>
          <div className="font-semibold text-foreground">忘记密码？</div>
          <div className="text-muted-foreground text-sm mt-0.5">请在谷歌登录页面选择“忘记密码”，按提示操作即可。</div>
        </li>
        <li>
          <div className="font-semibold text-foreground">Play 商店打不开或闪退？</div>
          <div className="text-muted-foreground text-sm mt-0.5">请先检查网络加速是否已连接，再确认三件套是否完整且按顺序安装。</div>
        </li>
        <li>
          <div className="font-semibold text-foreground">Gmail 打不开？</div>
          <div className="text-muted-foreground text-sm mt-0.5">请先连接网络加速，如仍无法打开，请尝试切换节点。</div>
        </li>
      </ul>
    ),
  },
];

const GoogleTutorial = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <SEO
        title="谷歌安装教程"
        description="各品牌安装方法与账号注册"
        path="/google-tutorial"
        noindex
      />
      <ParticleBackground />

      <main className="relative z-10 px-4 pt-5 pb-8 sm:py-8 flex flex-col items-center min-h-screen">
        <div className="w-full max-w-2xl flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <UserNav />
            <button
              onClick={() => navigate("/")}
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
            谷歌安装教程
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            各品牌安装方法与账号注册
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

        <div
          className="w-full max-w-2xl mt-6 rounded-2xl p-5 border border-white/10"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <p className="text-sm leading-7 text-muted-foreground">
            提示：如遇到问题，请前往首页，在“互助专区”发帖求助，人工客服会尽快帮助您解决。
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
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

export default GoogleTutorial;
