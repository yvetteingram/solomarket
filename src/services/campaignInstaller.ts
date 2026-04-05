import { CampaignTemplate } from '../types';
import { apiFetch } from './api';

import linkedInLeadEngine from '../templates/linkedin-lead-engine.json';
import newsletterGrowthEngine from '../templates/newsletter-growth-engine.json';
import productLaunchCampaign from '../templates/product-launch-campaign.json';
import freelancerLeadFunnel from '../templates/freelancer-lead-funnel.json';
import agencyClientAcquisition from '../templates/agency-client-acquisition.json';

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  linkedInLeadEngine as CampaignTemplate,
  newsletterGrowthEngine as CampaignTemplate,
  productLaunchCampaign as CampaignTemplate,
  freelancerLeadFunnel as CampaignTemplate,
  agencyClientAcquisition as CampaignTemplate,
];

export const TEMPLATE_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   icon: 'bg-blue-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'bg-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'bg-orange-500' },
  green:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bg-emerald-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'bg-indigo-600' },
};

export const TEMPLATE_ICONS: Record<string, string> = {
  'linkedin-lead-engine': '🔗',
  'newsletter-growth-engine': '📧',
  'product-launch-campaign': '🚀',
  'freelancer-lead-funnel': '🎯',
  'agency-client-acquisition': '🏢',
};

export async function installCampaign(
  template: CampaignTemplate,
  productId?: string | null
): Promise<{ campaignId: string }> {
  // 1. Create the campaign record
  const campaignRes = await apiFetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: template.name,
      type: template.id,
      status: 'active',
      progress: 0,
      product_id: productId || null,
    }),
  });

  if (!campaignRes.ok) {
    const err = await campaignRes.text();
    throw new Error(`Failed to create campaign: ${err}`);
  }

  const campaign = await campaignRes.json();

  // 2. Save all template assets
  const assetPromises = template.assets.map((asset) =>
    apiFetch('/api/campaign-assets', {
      method: 'POST',
      body: JSON.stringify({
        campaign_id: campaign.id,
        asset_type: asset.type,
        title: asset.title,
        content: asset.content,
        order_index: asset.order_index,
      }),
    }).catch(() => null) // non-fatal if assets endpoint not yet set up
  );

  await Promise.all(assetPromises);

  return { campaignId: campaign.id };
}

export function getTemplateById(id: string): CampaignTemplate | undefined {
  return CAMPAIGN_TEMPLATES.find((t) => t.id === id);
}
