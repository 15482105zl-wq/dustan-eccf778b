            : undefined,
    };
  };

  const primary = rows.filter((r) => r.category === "primary").map(toCard);
  const secondary = rows.filter((r) => r.category === "secondary").map(toCard);
  const gridSecondary = secondary.filter((c) => c.title !== "Dustan AI助手");

  const handleChatClick = () => (canInteract ? setChatOpen(true) : requireAuth());

  return (
    <div className="min-h-screen relative">
      <SEO
        title="全球数字服务"
        description=""
        path="/vip"
        noindex
      />
      <ParticleBackground />

      <main className="relative z-10 px-4 py-8 flex flex-col items-center min-h-screen">
        <div className="w-full max-w-2xl flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            aria-label="返回首页"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <UserNav />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-blue-400 to-primary/70 bg-clip-text text-transparent">
            全球数字服务
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            尊享节点 · 独享账号 · 极速体验
          </p>
        </motion.div>

        <div className="w-full max-w-2xl grid grid-cols-2 gap-4 mb-6">
          {primary.map((c, i) => (
            <VipResourceCard key={i} {...c} delay={i * 0.06} />
          ))}
          {gridSecondary.map((c, i) => (
            <VipResourceCard key={i} {...c} delay={(i + 2) * 0.06} />
          ))}
        </div>

    {/* 底部横向在线聊天室卡片 */}
        <div className="w-full max-w-2xl">
          <div
            onClick={handleChatClick}
            className="bg-transparent rounded-xl py-5 px-16 cursor-pointer relative overflow-hidden transition-colors duration-300 border border-glass-border/40 hover:border-primary/40 group animate-breathe-glow"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-semibold text-lg text-foreground">Dustan AI助手</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary font-medium">
                  公共频道
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
