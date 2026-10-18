import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "not_logged_in" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user }, error: uErr } = await admin.auth.getUser(token);
    if (uErr || !user) return json({ error: "not_logged_in" }, 401);
    const uid = user.id;

    // 留言：先删本人帖子下的所有回复和通知，再删本人回复与帖子
    const { data: threads } = await admin.from("forum_threads").select("id").eq("user_id", uid);
    const threadIds = (threads ?? []).map((t) => t.id);
    const { data: myReplies } = await admin.from("forum_replies").select("id").eq("user_id", uid);
    const replyIds = (myReplies ?? []).map((r) => r.id);

    if (threadIds.length) {
      await admin.from("forum_notifications").delete().in("thread_id", threadIds);
    }
    if (replyIds.length) {
      await admin.from("forum_notifications").delete().in("reply_id", replyIds);
      await admin.from("forum_replies").update({ reply_to_id: null }).in("reply_to_id", replyIds);
    }
    await admin.from("forum_notifications").delete().eq("recipient_id", uid);
    if (threadIds.length) await admin.from("forum_replies").delete().in("thread_id", threadIds);
    await admin.from("forum_replies").delete().eq("user_id", uid);
    await admin.from("forum_threads").delete().eq("user_id", uid);

    // 头像
    const { data: files } = await admin.storage.from("avatars").list(uid);
    if (files?.length) await admin.storage.from("avatars").remove(files.map((f) => `${uid}/${f.name}`));

    await admin.from("profiles").delete().eq("user_id", uid);
    await admin.from("trial_claims").delete().eq("user_id", uid);
    await admin.from("user_roles").delete().eq("user_id", uid);

    const { error: dErr } = await admin.auth.admin.deleteUser(uid);
    if (dErr) return json({ error: dErr.message }, 500);
    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
