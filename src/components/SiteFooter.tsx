const SiteFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-6 mb-2 text-center text-xs text-muted-foreground"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      © 2020 - {year} Dustan Hub · 用心运营每一天
      <br />
      All Rights Reserved.
    </footer>
  );
};

export default SiteFooter;
