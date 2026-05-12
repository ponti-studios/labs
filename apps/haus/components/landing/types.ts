export type ServiceFeature = {
  category: string;
  items: readonly string[];
};

export type ServiceEngagement = {
  duration: string;
  team: string;
  delivery: string;
  investment: string;
};

export type Service = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: ServiceFeature[];
  differentiators?: string[];
  process?: string[];
  engagement: ServiceEngagement;
  perfectFor: string[];
};
