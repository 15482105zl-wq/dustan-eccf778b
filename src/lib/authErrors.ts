// Map common Supabase auth errors to friendly Chinese messages.
export function translateAuthError(message: string | undefined | null): string {
  if (!message) return "操作失败，请稍后再试";
  const m = message.toLowerCase();

  if (m.includes("weak") && m.includes("password"))
    return "密码强度太弱，容易被猜到，请重新设置一个更复杂的密码。";
  if (m.includes("pwned") || m.includes("compromised") || m.includes("hibp"))
    return "该密码已在公开数据泄露中出现，请换一个更安全的密码。";
  if (m.includes("password") && (m.includes("short") || m.includes("at least") || m.includes("6")))
    return "密码至少需要 6 位字符";
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "邮箱或密码不正确";
  if (m.includes("email not confirmed") || m.includes("not confirmed"))
    return "邮箱尚未验证，请先点击验证邮件中的链接";
  if (m.includes("user already registered") || m.includes("already registered") || m.includes("already exists"))
    return "该邮箱已被注册，请直接登录";
  if (m.includes("rate limit") || m.includes("too many"))
    return "操作过于频繁，请稍后再试";
  if (m.includes("invalid email") || m.includes("email address") && m.includes("invalid"))
    return "邮箱格式不正确";
  if (m.includes("same as") || m.includes("same password"))
    return "新密码不能与旧密码相同";
  if (m.includes("expired") || m.includes("invalid token") || m.includes("token has expired"))
    return "链接已失效，请重新发起请求";
  if (m.includes("network") || m.includes("failed to fetch"))
    return "网络连接异常，请检查网络后重试";

  return message;
}
