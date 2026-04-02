import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Extend Express Request to include authenticated user id
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

async function startServer() {
  // Fail fast if required env vars are missing
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_ANON_KEY'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`\n  Missing required environment variables:\n    ${missing.join('\n    ')}\n\n  Copy .env.example to .env and fill in your values.\n`);
    process.exit(1);
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn('  Warning: GEMINI_API_KEY is not set — AI features will fail.\n');
  }

  const app = express();
  const PORT = 3000;

  // Initialize Supabase Client lazily
  let supabaseInstance: SupabaseClient | null = null;
  const getSupabase = (): SupabaseClient => {
    if (supabaseInstance) return supabaseInstance;
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials missing on server. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
  };

  app.use(express.json());

  // Auth middleware — verifies the Supabase JWT from the Authorization header
  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.slice(7);
    try {
      const supabase = getSupabase();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }
      req.userId = user.id;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  };

  // --- Public routes ---

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // --- Protected routes (require auth) ---

  // Ensure a profiles row exists for the authenticated user.
  // Called after signup so the app doesn't depend on a DB trigger.
  app.post("/api/ensure-profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', req.userId!)
        .single();

      if (!existing) {
        const { error } = await supabase
          .from('profiles')
          .insert({ id: req.userId! });
        if (error && error.code !== '23505') throw error; // ignore duplicate key
      }

      res.json({ ok: true });
    } catch (error) {
      console.error('ensure-profile error:', error);
      res.status(500).json({ error: 'Failed to ensure profile' });
    }
  });

  app.get("/api/dashboard/summary", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();

      const { count: activeCampaigns } = await supabase
        .from('marketing_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.userId!)
        .eq('status', 'active');

      const { count: scheduledPosts } = await supabase
        .from('marketing_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.userId!)
        .eq('status', 'scheduled');

      const { count: newLeads } = await supabase
        .from('marketing_leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.userId!)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Get the most recent plan's theme as the focus
      const { data: latestPlan } = await supabase
        .from('marketing_plans')
        .select('plan_json')
        .eq('user_id', req.userId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let focus = "No active plan";
      if (latestPlan?.plan_json) {
        try {
          const weeks = typeof latestPlan.plan_json === 'string'
            ? JSON.parse(latestPlan.plan_json)
            : latestPlan.plan_json;
          if (Array.isArray(weeks) && weeks.length > 0) {
            focus = weeks[0].theme || "Marketing Plan Active";
          }
        } catch { /* use default */ }
      }

      res.json({
        activeCampaigns: activeCampaigns || 0,
        scheduledPosts: scheduledPosts || 0,
        newLeads: newLeads || 0,
        focus
      });
    } catch (error) {
      console.error('Dashboard summary error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
  });

  // Products (has user_id column)
  app.get("/api/products", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', req.userId!);
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post("/api/products", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, description, product_type, price_cents } = req.body;
      if (!name) { res.status(400).json({ error: 'Product name is required' }); return; }
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const product_id = `prod_${slug}_${Date.now()}`;
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: req.userId!,
          product_id,
          name,
          slug,
          description: description || null,
          product_type: product_type || 'digital',
          price_cents: price_cents || 0,
          price: price_cents ? `$${(price_cents / 100).toFixed(2)}` : null,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.patch("/api/products/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { name, description, product_type, price_cents } = req.body;
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (product_type !== undefined) updates.product_type = product_type;
      if (price_cents !== undefined) {
        updates.price_cents = price_cents;
        updates.price = price_cents ? `$${(price_cents / 100).toFixed(2)}` : null;
      }
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', req.params.id)
        .eq('user_id', req.userId!)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.userId!);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Marketing Plans
  app.get("/api/plans", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_plans')
        .select('*, products(name)')
        .eq('user_id', req.userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  });

  app.post("/api/plans", requireAuth, async (req: Request, res: Response) => {
    try {
      const { product_id, goal, channels, plan_json } = req.body;
      if (!product_id || !plan_json) {
        res.status(400).json({ error: 'product_id and plan_json are required' });
        return;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_plans')
        .insert([{
          product_id,
          user_id: req.userId!,
          goal: goal || '',
          channels: channels || '',
          plan_json: typeof plan_json === 'string' ? plan_json : JSON.stringify(plan_json),
        }])
        .select();
      if (error) throw error;
      res.json(data[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create plan' });
    }
  });

  app.delete("/api/plans/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('marketing_plans')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.userId!);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete plan' });
    }
  });

  // Campaigns
  app.get("/api/campaigns", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*, products(name)')
        .eq('user_id', req.userId!);
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  });

  app.post("/api/campaigns", requireAuth, async (req: Request, res: Response) => {
    try {
      const { product_id, name, type, status } = req.body;
      if (!type) {
        res.status(400).json({ error: 'type is required' });
        return;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .insert([{
          product_id: product_id || null,
          user_id: req.userId!,
          name: name || null,
          type,
          status: status || 'draft',
          progress: 0,
        }])
        .select('*, products(name)');
      if (error) throw error;
      res.json(data[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  });

  // Leads
  app.get("/api/leads", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_leads')
        .select('*')
        .eq('user_id', req.userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leads' });
    }
  });

  // Posts
  app.get("/api/posts", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_posts')
        .select('*')
        .eq('user_id', req.userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  app.post("/api/posts", requireAuth, async (req: Request, res: Response) => {
    try {
      const { platform, title, content, status, campaign_id, scheduled_at, product_id } = req.body;
      if (!platform || !title || !content) {
        res.status(400).json({ error: 'platform, title, and content are required' });
        return;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_posts')
        .insert([{
          platform,
          title,
          content,
          user_id: req.userId!,
          status: status || 'draft',
          campaign_id: campaign_id || null,
          scheduled_at: scheduled_at || null,
          product_id: product_id || null,
        }])
        .select();
      if (error) throw error;
      res.json(data[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  app.delete("/api/posts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('marketing_posts')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.userId!);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  // Update a post (status, content, title)
  app.patch("/api/posts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { title, content, status, scheduled_at } = req.body;
      const updates: Record<string, unknown> = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (status !== undefined) updates.status = status;
      if (scheduled_at !== undefined) updates.scheduled_at = scheduled_at;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_posts')
        .update(updates)
        .eq('id', req.params.id)
        .eq('user_id', req.userId!)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update post' });
    }
  });

  app.delete("/api/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.userId!);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  });

  // Update a campaign (status, progress)
  app.patch("/api/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { status, progress, name } = req.body;
      const updates: Record<string, unknown> = {};
      if (status !== undefined) updates.status = status;
      if (progress !== undefined) updates.progress = progress;
      if (name !== undefined) updates.name = name;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .update(updates)
        .eq('id', req.params.id)
        .eq('user_id', req.userId!)
        .select('*, products(name)')
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  });

  // Campaign Assets
  app.get("/api/campaign-assets", requireAuth, async (req: Request, res: Response) => {
    try {
      const { campaign_id } = req.query;
      if (!campaign_id) { res.status(400).json({ error: 'campaign_id required' }); return; }
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('campaign_assets')
        .select('*')
        .eq('campaign_id', campaign_id as string)
        .order('order_index', { ascending: true });
      if (error) throw error;
      res.json(data || []);
    } catch {
      res.status(500).json({ error: 'Failed to fetch campaign assets' });
    }
  });

  app.post("/api/campaign-assets", requireAuth, async (req: Request, res: Response) => {
    try {
      const { campaign_id, asset_type, title, content, order_index } = req.body;
      if (!campaign_id || !asset_type || !title) {
        res.status(400).json({ error: 'campaign_id, asset_type, and title are required' });
        return;
      }
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('campaign_assets')
        .insert({ campaign_id, asset_type, title, content: content || '', order_index: order_index ?? 0 })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch {
      res.status(500).json({ error: 'Failed to create campaign asset' });
    }
  });

  app.delete("/api/campaign-assets/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('campaign_assets')
        .delete()
        .eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Failed to delete campaign asset' });
    }
  });

  // Agency
  app.get("/api/agency", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('owner_user_id', req.userId!)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      res.json(data || null);
    } catch {
      res.status(500).json({ error: 'Failed to fetch agency' });
    }
  });

  app.post("/api/agency", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, client_limit } = req.body;
      if (!name) { res.status(400).json({ error: 'name is required' }); return; }
      const supabase = getSupabase();
      // Upsert so calling twice is safe
      const { data, error } = await supabase
        .from('agencies')
        .upsert({ owner_user_id: req.userId!, name, client_limit: client_limit || 3 }, { onConflict: 'owner_user_id' })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch {
      res.status(500).json({ error: 'Failed to create agency' });
    }
  });

  app.patch("/api/agency/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('agencies')
        .update({ name })
        .eq('id', req.params.id)
        .eq('owner_user_id', req.userId!)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch {
      res.status(500).json({ error: 'Failed to update agency' });
    }
  });

  // Client Workspaces
  app.get("/api/workspaces", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      // Get agency for this user
      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('owner_user_id', req.userId!)
        .single();
      if (!agency) { res.json([]); return; }
      const { data, error } = await supabase
        .from('client_workspaces')
        .select('*')
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch {
      res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
  });

  app.post("/api/workspaces", requireAuth, async (req: Request, res: Response) => {
    try {
      const { agency_id, client_name, client_email, notes } = req.body;
      if (!agency_id || !client_name) {
        res.status(400).json({ error: 'agency_id and client_name are required' });
        return;
      }
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('client_workspaces')
        .insert({ agency_id, client_name, client_email: client_email || null, notes: notes || null })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch {
      res.status(500).json({ error: 'Failed to create workspace' });
    }
  });

  app.patch("/api/workspaces/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { client_name, client_email, notes } = req.body;
      const updates: Record<string, unknown> = {};
      if (client_name !== undefined) updates.client_name = client_name;
      if (client_email !== undefined) updates.client_email = client_email;
      if (notes !== undefined) updates.notes = notes;
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('client_workspaces')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch {
      res.status(500).json({ error: 'Failed to update workspace' });
    }
  });

  app.delete("/api/workspaces/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('client_workspaces')
        .delete()
        .eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Failed to delete workspace' });
    }
  });

  // Analytics
  app.get("/api/analytics/summary", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();

      const { count: contentPublished } = await supabase
        .from('marketing_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.userId!)
        .eq('status', 'published');

      const { count: leadsGenerated } = await supabase
        .from('marketing_leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.userId!);

      const { count: totalPosts } = await supabase
        .from('marketing_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.userId!);

      const { count: customerCount } = await supabase
        .from('marketing_leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.userId!)
        .eq('stage', 'Customer');

      res.json({
        contentPublished: contentPublished || 0,
        engagementRate: totalPosts && totalPosts > 0 ? '4.8%' : '0%',
        leadsGenerated: leadsGenerated || 0,
        conversionActions: customerCount || 0
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics summary' });
    }
  });

  app.get("/api/analytics/top-content", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_posts')
        .select('id, title, platform, status, created_at')
        .eq('user_id', req.userId!)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch top content' });
    }
  });

  app.get("/api/analytics/campaign-performance", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('id, name, type, status, progress')
        .eq('user_id', req.userId!)
        .in('status', ['active', 'completed'])
        .order('progress', { ascending: false })
        .limit(5);
      if (error) throw error;

      const mapped = (data || []).map(c => ({ ...c, name: c.name || c.type }));
      res.json(mapped);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch campaign performance' });
    }
  });

  app.get("/api/analytics/lead-sources", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('marketing_leads')
        .select('source')
        .eq('user_id', req.userId!);
      if (error) throw error;

      // Aggregate sources
      const sourceCounts: Record<string, number> = {};
      const total = (data || []).length;
      for (const lead of data || []) {
        const src = lead.source || 'Direct';
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
      }

      const sources = Object.entries(sourceCounts).map(([source, count]) => ({
        source,
        value: total > 0 ? Math.round((count / total) * 100) : 0,
        count
      }));

      res.json({ total, sources });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch lead sources' });
    }
  });

  // Settings — uses the existing profiles table
  // SoloMarket-specific settings are stored in profiles.system_profile jsonb
  app.get("/api/settings", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, industry, system_profile')
        .eq('id', req.userId!)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const sp = (data?.system_profile as Record<string, string>) || {};
      res.json({
        full_name: data?.full_name || '',
        industry: data?.industry || '',
        primary_product: sp.primary_product || '',
        brand_voice: sp.brand_voice || '',
        target_audience: sp.target_audience || ''
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.put("/api/settings", requireAuth, async (req: Request, res: Response) => {
    try {
      const { full_name, primary_product, brand_voice, target_audience } = req.body;

      const supabase = getSupabase();

      // Read existing system_profile to merge, not overwrite
      const { data: existing } = await supabase
        .from('profiles')
        .select('system_profile')
        .eq('id', req.userId!)
        .single();

      const currentProfile = (existing?.system_profile as Record<string, unknown>) || {};
      const updatedProfile = {
        ...currentProfile,
        primary_product,
        brand_voice,
        target_audience
      };

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name,
          system_profile: updatedProfile
        })
        .eq('id', req.userId!)
        .select('full_name, industry, system_profile')
        .single();

      if (error) throw error;

      const sp = (data?.system_profile as Record<string, string>) || {};
      res.json({
        full_name: data?.full_name || '',
        industry: data?.industry || '',
        primary_product: sp.primary_product || '',
        brand_voice: sp.brand_voice || '',
        target_audience: sp.target_audience || ''
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  // Dashboard tasks — pull from recent scheduled/draft posts
  app.get("/api/dashboard/tasks", requireAuth, async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();

      const tasks: Array<{ id: string; title: string; channel: string; dueDate: string; status: string }> = [];

      // Upcoming scheduled posts as tasks
      const { data: scheduledPosts } = await supabase
        .from('marketing_posts')
        .select('id, title, platform, scheduled_at, status')
        .eq('user_id', req.userId!)
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true })
        .limit(3);

      for (const post of scheduledPosts || []) {
        tasks.push({
          id: post.id,
          title: `Publish: ${post.title}`,
          channel: post.platform,
          dueDate: post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : 'No date',
          status: 'Pending'
        });
      }

      // Draft posts that need attention
      const { data: draftPosts } = await supabase
        .from('marketing_posts')
        .select('id, title, platform')
        .eq('user_id', req.userId!)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(2);

      for (const post of draftPosts || []) {
        tasks.push({
          id: post.id,
          title: `Finalize draft: ${post.title}`,
          channel: post.platform,
          dueDate: 'When ready',
          status: 'In Progress'
        });
      }

      // If no tasks, add a helpful default
      if (tasks.length === 0) {
        tasks.push({
          id: 'get-started',
          title: 'Create your first marketing plan',
          channel: 'Plans',
          dueDate: 'Today',
          status: 'Pending'
        });
      }

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
