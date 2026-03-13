export interface Product {
  id: string;
  product_id: string;
  user_id?: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  price: string;
  is_active: boolean;
  product_type: string;
  product_category: string;
  app_url: string;
  landing_page_url: string;
  features: Record<string, unknown> | null;
  thumbnail_url: string;
  image_url: string;
  url: string;
  download_url: string;
  access_type: string;
  delivery_method: string;
  gumroad_product_url: string;
  is_subscription: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanWeek {
  week: number;
  theme: string;
  actions: string[];
  contentPrompts: string[];
  conversionActivity: string;
}

export interface MarketingPlan {
  id: string;
  product_id: string;
  goal: string;
  channels: string;
  plan_json: string | PlanWeek[];
  created_at: string;
}

export interface Campaign {
  id: string;
  product_id: string;
  name?: string;
  type: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  progress: number;
  startDate?: string;
  created_at: string;
  products?: { name: string };
}

export interface Post {
  id: string;
  campaign_id: string;
  platform: string;
  title: string;
  content: string;
  scheduled_at: string;
  status: 'draft' | 'scheduled' | 'published';
  created_at: string;
}

export interface Lead {
  id: string;
  email: string;
  source: string;
  stage: 'Visitor' | 'Subscriber' | 'Lead' | 'Customer';
  notes: string;
  last_contacted: string;
  created_at: string;
}

export interface DashboardSummary {
  activeCampaigns: number;
  scheduledPosts: number;
  newLeads: number;
  focus: string;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  full_name: string;
  primary_product: string;
  brand_voice: string;
  target_audience: string;
}
