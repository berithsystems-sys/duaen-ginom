export interface SampleWebsite {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  previewColor: string;
}

export const SAMPLE_WEBSITES: SampleWebsite[] = [
  {
    id: 'saas-dashboard',
    name: 'PulseAnalytics SaaS Dashboard',
    category: 'Web App',
    url: 'demo://saas-dashboard',
    description: 'Modern SaaS metrics, active user live charts, revenue widgets, and user tables.',
    previewColor: 'from-blue-600 to-indigo-800',
  },
  {
    id: 'ecommerce-store',
    name: 'Aura Market E-Commerce',
    category: 'E-Commerce',
    url: 'demo://ecommerce-store',
    description: 'Responsive online store with product cards, cart drawer, and checkout flow.',
    previewColor: 'from-emerald-600 to-teal-800',
  },
  {
    id: 'dev-docs',
    name: 'Nexus API & Developer Portal',
    category: 'Developer Tools',
    url: 'demo://dev-docs',
    description: 'Interactive API documentation with code snippet switcher and API key manager.',
    previewColor: 'from-purple-600 to-violet-900',
  },
  {
    id: 'task-flow',
    name: 'Kanban Task Manager',
    category: 'Productivity',
    url: 'demo://task-flow',
    description: 'Drag & drop task board with columns, progress bars, and team member avatars.',
    previewColor: 'from-amber-600 to-orange-800',
  },
];
