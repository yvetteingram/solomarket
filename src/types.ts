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

export interface TemplateAsset {
  type: string;
  title: string;
  content: string;
  order_index: number;
}

export interface AutomationRule {
  trigger: string;
  action: string;
  followUp: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  outcome: string;
  color: string;
  estimatedDuration: string;
  assetSummary: string[];
  assets: TemplateAsset[];
  automation: AutomationRule[];
}

export interface CampaignAsset {
  id: string;
  campaign_id: string;
  asset_type: string;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
}

export interface Agency {
  id: string;
  owner_user_id: string;
  name: string;
  client_limit: number;
  subscription_plan: string;
  created_at: string;
}

export interface ClientWorkspace {
  id: string;
  agency_id: string;
  client_name: string;
  client_email: string | null;
  notes: string | null;
  created_at: string;
  campaign_count?: number;
  lead_count?: number;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  full_name: string;
  primary_product: string;
  brand_voice: string;
  target_audience: string;
}
