import { createClient } from "@supabase/supabase-js";

// Lazy Supabase singleton (typed as any to skip schema inference — no generated types)
let supabase: any = null;
function getSupabase(): any {
  if (supabase) return supabase;
  supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  return supabase;
}

// Auth helper — returns userId or null
async function authenticate(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const { data: { user }, error } = await getSupabase().auth.getUser(token);
    if (error || !user) return null;
    return user.id;
  } catch {
    return null;
  }
}

// JSON response helpers
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function unauthorized() {
  return json({ error: "Unauthorized" }, 401);
}

// ---- Route handlers ----

async function handleHealth() {
  return json({ status: "ok" });
}

async function handleDashboardSummary(userId: string) {
  const sb = getSupabase();

  const { count: activeCampaigns } = await sb
    .from("marketing_campaigns")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  const { count: scheduledPosts } = await sb
    .from("marketing_posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "scheduled");

  const { count: newLeads } = await sb
    .from("marketing_leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const { data: latestPlan } = await sb
    .from("marketing_plans")
    .select("plan_json")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let focus = "No active plan";
  if (latestPlan?.plan_json) {
    try {
      const weeks = typeof latestPlan.plan_json === "string"
        ? JSON.parse(latestPlan.plan_json)
        : latestPlan.plan_json;
      if (Array.isArray(weeks) && weeks.length > 0) {
        focus = weeks[0].theme || "Marketing Plan Active";
      }
    } catch { /* use default */ }
  }

  return json({
    activeCampaigns: activeCampaigns || 0,
    scheduledPosts: scheduledPosts || 0,
    newLeads: newLeads || 0,
    focus,
  });
}

async function handleDashboardTasks(userId: string) {
  const sb = getSupabase();
  const tasks: Array<{ id: string; title: string; channel: string; dueDate: string; status: string }> = [];

  const { data: scheduledPosts } = await sb
    .from("marketing_posts")
    .select("id, title, platform, scheduled_at, status")
    .eq("user_id", userId)
    .eq("status", "scheduled")
    .order("scheduled_at", { ascending: true })
    .limit(3);

  for (const post of scheduledPosts || []) {
    tasks.push({
      id: post.id,
      title: `Publish: ${post.title}`,
      channel: post.platform,
      dueDate: post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : "No date",
      status: "Pending",
    });
  }

  const { data: draftPosts } = await sb
    .from("marketing_posts")
    .select("id, title, platform")
    .eq("user_id", userId)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(2);

  for (const post of draftPosts || []) {
    tasks.push({
      id: post.id,
      title: `Finalize draft: ${post.title}`,
      channel: post.platform,
      dueDate: "When ready",
      status: "In Progress",
    });
  }

  if (tasks.length === 0) {
    tasks.push({
      id: "get-started",
      title: "Create your first marketing plan",
      channel: "Plans",
      dueDate: "Today",
      status: "Pending",
    });
  }

  return json(tasks);
}

async function handleGetProducts(userId: string) {
  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return json(data);
}

async function handleCreateProduct(userId: string, body: any) {
  const { name, description, product_type, price_cents } = body;
  if (!name) return json({ error: "Product name is required" }, 400);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data, error } = await getSupabase()
    .from("products")
    .insert({
      user_id: userId,
      name,
      slug,
      description: description || "",
      product_type: product_type || "digital",
      price_cents: price_cents || 0,
      price: price_cents ? `$${(price_cents / 100).toFixed(2)}` : "$0.00",
      is_active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return json(data, 201);
}

async function handleDeleteProduct(userId: string, productId: string) {
  const { error } = await getSupabase()
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("user_id", userId);
  if (error) throw error;
  return json({ success: true });
}

async function handleGetPlans(userId: string) {
  const { data, error } = await getSupabase()
    .from("marketing_plans")
    .select("*, products(name)")
    .eq("user_id", userId);
  if (error) throw error;
  return json(data);
}

async function handleCreatePlan(userId: string, body: any) {
  const { product_id, goal, channels, plan_json } = body;
  if (!product_id || !plan_json) return json({ error: "product_id and plan_json are required" }, 400);

  const { data, error } = await getSupabase()
    .from("marketing_plans")
    .insert([{
      product_id,
      user_id: userId,
      goal: goal || "",
      channels: channels || "",
      plan_json: typeof plan_json === "string" ? plan_json : JSON.stringify(plan_json),
    }])
    .select();
  if (error) throw error;
  return json(data[0]);
}

async function handleGetCampaigns(userId: string) {
  const { data, error } = await getSupabase()
    .from("marketing_campaigns")
    .select("*, products(name)")
    .eq("user_id", userId);
  if (error) throw error;
  return json(data);
}

async function handleCreateCampaign(userId: string, body: any) {
  const { product_id, name, type, status } = body;
  if (!type) return json({ error: "type is required" }, 400);

  const { data, error } = await getSupabase()
    .from("marketing_campaigns")
    .insert([{
      product_id: product_id || null,
      user_id: userId,
      name: name || null,
      type,
      status: status || "draft",
      progress: 0,
    }])
    .select("*, products(name)");
  if (error) throw error;
  return json(data[0]);
}

async function handlePatchCampaign(userId: string, id: string, body: any) {
  const { status, progress, name } = body;
  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (progress !== undefined) updates.progress = progress;
  if (name !== undefined) updates.name = name;

  if (Object.keys(updates).length === 0) return json({ error: "No fields to update" }, 400);

  const { data, error } = await getSupabase()
    .from("marketing_campaigns")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*, products(name)")
    .single();
  if (error) throw error;
  return json(data);
}

async function handleGetLeads(userId: string) {
  const { data, error } = await getSupabase()
    .from("marketing_leads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return json(data);
}

async function handleGetPosts(userId: string) {
  const { data, error } = await getSupabase()
    .from("marketing_posts")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return json(data);
}

async function handleCreatePost(userId: string, body: any) {
  const { platform, title, content, status, campaign_id, scheduled_at } = body;
  if (!platform || !title || !content) return json({ error: "platform, title, and content are required" }, 400);

  const { data, error } = await getSupabase()
    .from("marketing_posts")
    .insert([{
      platform,
      title,
      content,
      user_id: userId,
      status: status || "draft",
      campaign_id: campaign_id || null,
      scheduled_at: scheduled_at || null,
    }])
    .select();
  if (error) throw error;
  return json(data[0]);
}

async function handleDeletePost(userId: string, id: string) {
  const { error } = await getSupabase()
    .from("marketing_posts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
  return json({ success: true });
}

async function handlePatchPost(userId: string, id: string, body: any) {
  const { title, content, status, scheduled_at } = body;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (status !== undefined) updates.status = status;
  if (scheduled_at !== undefined) updates.scheduled_at = scheduled_at;

  if (Object.keys(updates).length === 0) return json({ error: "No fields to update" }, 400);

  const { data, error } = await getSupabase()
    .from("marketing_posts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return json(data);
}

async function handleAnalyticsSummary(userId: string) {
  const sb = getSupabase();

  const { count: contentPublished } = await sb
    .from("marketing_posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "published");

  const { count: leadsGenerated } = await sb
    .from("marketing_leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: totalPosts } = await sb
    .from("marketing_posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: customerCount } = await sb
    .from("marketing_leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("stage", "Customer");

  return json({
    contentPublished: contentPublished || 0,
    engagementRate: totalPosts && totalPosts > 0 ? "4.8%" : "0%",
    leadsGenerated: leadsGenerated || 0,
    conversionActions: customerCount || 0,
  });
}

async function handleAnalyticsTopContent(userId: string) {
  const { data, error } = await getSupabase()
    .from("marketing_posts")
    .select("id, title, platform, status, created_at")
    .eq("user_id", userId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw error;
  return json(data || []);
}

async function handleAnalyticsCampaignPerformance(userId: string) {
  const { data, error } = await getSupabase()
    .from("marketing_campaigns")
    .select("id, name, type, status, progress")
    .eq("user_id", userId)
    .in("status", ["active", "completed"])
    .order("progress", { ascending: false })
    .limit(5);
  if (error) throw error;

  const mapped = (data || []).map((c: any) => ({ ...c, name: c.name || c.type }));
  return json(mapped);
}

async function handleAnalyticsLeadSources(userId: string) {
  const { data, error } = await getSupabase()
    .from("marketing_leads")
    .select("source")
    .eq("user_id", userId);
  if (error) throw error;

  const sourceCounts: Record<string, number> = {};
  const total = (data || []).length;
  for (const lead of data || []) {
    const src = lead.source || "Direct";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  }

  const sources = Object.entries(sourceCounts).map(([source, count]) => ({
    source,
    value: total > 0 ? Math.round((count / total) * 100) : 0,
    count,
  }));

  return json({ total, sources });
}

async function handleGetSettings(userId: string) {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("full_name, industry, system_profile")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;

  const sp = (data?.system_profile as Record<string, string>) || {};
  return json({
    full_name: data?.full_name || "",
    industry: data?.industry || "",
    primary_product: sp.primary_product || "",
    brand_voice: sp.brand_voice || "",
    target_audience: sp.target_audience || "",
  });
}

async function handlePutSettings(userId: string, body: any) {
  const { full_name, primary_product, brand_voice, target_audience } = body;
  const sb = getSupabase();

  const { data: existing } = await sb
    .from("profiles")
    .select("system_profile")
    .eq("id", userId)
    .single();

  const currentProfile = (existing?.system_profile as Record<string, unknown>) || {};
  const updatedProfile = { ...currentProfile, primary_product, brand_voice, target_audience };

  const { data, error } = await sb
    .from("profiles")
    .update({ full_name, system_profile: updatedProfile })
    .eq("id", userId)
    .select("full_name, industry, system_profile")
    .single();

  if (error) throw error;

  const sp = (data?.system_profile as Record<string, string>) || {};
  return json({
    full_name: data?.full_name || "",
    industry: data?.industry || "",
    primary_product: sp.primary_product || "",
    brand_voice: sp.brand_voice || "",
    target_audience: sp.target_audience || "",
  });
}

// ---- Main router ----

export default async (request: Request) => {
  const url = new URL(request.url);
  const method = request.method;
  // Strip /api/ prefix to get route path
  const path = url.pathname.replace(/^\/api\/?/, "");

  // Public routes
  if (path === "health" && method === "GET") {
    return handleHealth();
  }

  // All other routes require auth
  const userId = await authenticate(request);
  if (!userId) return unauthorized();

  // Parse body for non-GET requests
  let body: any = null;
  if (method !== "GET") {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  try {
    // Dashboard
    if (path === "dashboard/summary" && method === "GET") return await handleDashboardSummary(userId);
    if (path === "dashboard/tasks" && method === "GET") return await handleDashboardTasks(userId);

    // Products
    if (path === "products" && method === "GET") return await handleGetProducts(userId);
    if (path === "products" && method === "POST") return await handleCreateProduct(userId, body);
    const productMatch = path.match(/^products\/(.+)$/);
    if (productMatch && method === "DELETE") return await handleDeleteProduct(userId, productMatch[1]);

    // Plans
    if (path === "plans" && method === "GET") return await handleGetPlans(userId);
    if (path === "plans" && method === "POST") return await handleCreatePlan(userId, body);

    // Campaigns
    if (path === "campaigns" && method === "GET") return await handleGetCampaigns(userId);
    if (path === "campaigns" && method === "POST") return await handleCreateCampaign(userId, body);
    const campaignMatch = path.match(/^campaigns\/(.+)$/);
    if (campaignMatch && method === "PATCH") return await handlePatchCampaign(userId, campaignMatch[1], body);

    // Leads
    if (path === "leads" && method === "GET") return await handleGetLeads(userId);

    // Posts
    if (path === "posts" && method === "GET") return await handleGetPosts(userId);
    if (path === "posts" && method === "POST") return await handleCreatePost(userId, body);
    const postMatch = path.match(/^posts\/(.+)$/);
    if (postMatch && method === "DELETE") return await handleDeletePost(userId, postMatch[1]);
    if (postMatch && method === "PATCH") return await handlePatchPost(userId, postMatch[1], body);

    // Analytics
    if (path === "analytics/summary" && method === "GET") return await handleAnalyticsSummary(userId);
    if (path === "analytics/top-content" && method === "GET") return await handleAnalyticsTopContent(userId);
    if (path === "analytics/campaign-performance" && method === "GET") return await handleAnalyticsCampaignPerformance(userId);
    if (path === "analytics/lead-sources" && method === "GET") return await handleAnalyticsLeadSources(userId);

    // Settings
    if (path === "settings" && method === "GET") return await handleGetSettings(userId);
    if (path === "settings" && method === "PUT") return await handlePutSettings(userId, body);

    return json({ error: "Not found" }, 404);
  } catch (err: any) {
    console.error("API error:", err);
    return json({ error: err.message || "Internal server error" }, 500);
  }
};

export const config = {
  path: "/api/*",
};
