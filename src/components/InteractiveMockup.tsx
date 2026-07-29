import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  CreditCard,
  Activity,
  Search,
  Bell,
  CheckCircle,
  Menu,
  ShoppingCart,
  Star,
  Code,
  Copy,
  Layers,
  ArrowRight,
  Plus,
  Play,
  Settings,
} from 'lucide-react';

interface InteractiveMockupProps {
  siteId: string;
  isMobile?: boolean;
  onUserInteraction?: (action: string) => void;
  scrollOffset?: number;
}

export const InteractiveMockup: React.FC<InteractiveMockupProps> = ({ siteId, isMobile = false, onUserInteraction, scrollOffset = 0 }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [cartCount, setCartCount] = useState(2);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollOffset;
    }
  }, [scrollOffset]);

  const triggerAction = (label: string) => {
    setNotification(label);
    if (onUserInteraction) onUserInteraction(label);
    setTimeout(() => setNotification(null), 2500);
  };

  // Render SaaS Dashboard Mockup
  if (siteId === 'saas-dashboard' || siteId.includes('saas')) {
    return (
      <div ref={containerRef} className={`w-full h-full bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-y-auto ${isMobile ? 'text-xs' : 'text-sm'}`}>
        {/* Header */}
        <div className="bg-slate-800/90 backdrop-blur border-b border-slate-700/60 px-4 py-2.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              P
            </div>
            {!isMobile && <span className="font-semibold text-slate-100 tracking-tight text-base">PulseAnalytics</span>}
          </div>

          {!isMobile ? (
            <div className="flex items-center space-x-1 bg-slate-900/60 p-1 rounded-lg border border-slate-700/50">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  triggerAction('Switched to Overview tab');
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'overview' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => {
                  setActiveTab('users');
                  triggerAction('Switched to Users tab');
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'users' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => {
                  setActiveTab('billing');
                  triggerAction('Switched to Billing tab');
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'billing' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Revenue
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                triggerAction('Toggled mobile navigation menu');
              }}
              className="p-1.5 rounded-lg bg-slate-700 text-slate-200"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => triggerAction('Clicked Notifications')}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            </button>
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white ring-2 ring-indigo-400/30">
              DEV
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobile && mobileMenuOpen && (
          <div className="bg-slate-800 border-b border-slate-700 p-3 space-y-1 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileMenuOpen(false);
                triggerAction('Mobile: Opened Overview');
              }}
              className="w-full text-left px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400 font-medium text-xs"
            >
              📊 Overview Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                setMobileMenuOpen(false);
                triggerAction('Mobile: Opened Customers');
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 text-slate-300 text-xs"
            >
              👥 Customer Directory
            </button>
            <button
              onClick={() => {
                setActiveTab('billing');
                setMobileMenuOpen(false);
                triggerAction('Mobile: Opened Revenue');
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 text-slate-300 text-xs"
            >
              💳 Revenue & Invoices
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="p-4 space-y-4 flex-1">
          {notification && (
            <div className="bg-blue-500/20 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg text-xs flex items-center space-x-2 animate-bounce">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>{notification}</span>
            </div>
          )}

          {/* Metric Cards Grid */}
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Total MRR</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-slate-100">$48,290</div>
              <span className="text-[10px] text-emerald-400 font-medium">+14.2% this month</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Active Users</span>
                <Users className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-slate-100">12,450</div>
              <span className="text-[10px] text-blue-400 font-medium">+820 today</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Conversion</span>
                <Activity className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-slate-100">4.82%</div>
              <span className="text-[10px] text-purple-400 font-medium">+0.6% vs avg</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>ARPU</span>
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-slate-100">$64.50</div>
              <span className="text-[10px] text-amber-400 font-medium">Pro tier lead</span>
            </div>
          </div>

          {/* Simulated Live Chart Area */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-200 text-xs md:text-sm">Realtime Revenue Growth</h3>
                <p className="text-[11px] text-slate-400">Synchronized live stream metrics</p>
              </div>
              <button
                onClick={() => triggerAction('Exported CSV metrics')}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200"
              >
                Export CSV
              </button>
            </div>

            {/* Visual SVG Chart */}
            <div className="h-28 w-full relative flex items-end justify-between gap-1 pt-4 px-1 border-b border-slate-700/50 pb-1">
              {[40, 55, 35, 70, 60, 85, 95, 75, 110, 130, 120, 150].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div
                    style={{ height: `${(val / 160) * 100}%` }}
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t transition-all group-hover:from-blue-400 group-hover:to-cyan-300 cursor-pointer"
                    onClick={() => triggerAction(`Inspected Chart Point ${idx + 1} ($${val * 300})`)}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Table */}
          <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden">
            <div className="p-3 border-b border-slate-700/60 flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200">Recent Enterprise Subscribers</span>
              <button
                onClick={() => triggerAction('Added new subscriber entry')}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-medium flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add User</span>
              </button>
            </div>
            <div className="divide-y divide-slate-700/50 text-xs">
              {[
                { name: 'Acme Corp', tier: 'Enterprise', mrr: '$1,200', status: 'Active' },
                { name: 'Starlight Tech', tier: 'Pro Team', mrr: '$450', status: 'Active' },
                { name: 'Hyperion Labs', tier: 'Scale', mrr: '$890', status: 'Pending' },
              ].map((row, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between hover:bg-slate-700/40 transition-colors">
                  <div>
                    <div className="font-medium text-slate-200">{row.name}</div>
                    <div className="text-[10px] text-slate-400">{row.tier}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-400">{row.mrr}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">{row.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render E-Commerce Mockup
  if (siteId === 'ecommerce-store') {
    return (
      <div className={`w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-y-auto ${isMobile ? 'text-xs' : 'text-sm'}`}>
        {/* E-Commerce Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
              A
            </div>
            <span className="font-bold tracking-tight text-emerald-400">AURA MARKET</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => triggerAction(`Opened Cart (${cartCount} items)`)}
              className="p-2 bg-slate-800 rounded-lg relative hover:bg-slate-700 transition-all"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Product Hero Banner */}
        <div className="p-4 bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-950 border-b border-slate-800 space-y-2">
          {notification && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-lg text-xs animate-pulse">
              ✓ {notification}
            </div>
          )}
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Summer Launch</span>
          <h2 className="text-base md:text-lg font-bold text-slate-100">Aura Pro Noise-Canceling Headphones</h2>
          <p className="text-xs text-slate-400">Studio audio precision with 40-hour battery life.</p>
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => {
                setCartCount((c) => c + 1);
                triggerAction('Added Aura Pro Headphones to Cart ($299)');
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs"
            >
              Add to Cart — $299
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-xs text-slate-300">Featured Gear</h3>
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {[
              { name: 'Ultra Minimalist Keychron', price: '$149', rating: '4.9' },
              { name: 'Precision Ergonomic Mouse', price: '$99', rating: '4.8' },
              { name: 'Retina 4K Monitor Stand', price: '$180', rating: '5.0' },
            ].map((p, idx) => (
              <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="w-full h-20 bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 font-bold text-xs">
                  GEAR #{idx + 1}
                </div>
                <div className="font-medium text-xs text-slate-200 truncate">{p.name}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400">{p.price}</span>
                  <button
                    onClick={() => {
                      setCartCount((c) => c + 1);
                      triggerAction(`Added ${p.name} to Cart`);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback Developer Portal Mockup
  return (
    <div className={`w-full h-full bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-y-auto ${isMobile ? 'text-xs' : 'text-sm'}`}>
      <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-purple-300">Nexus Dev API Portal</span>
        </div>
        <button
          onClick={() => triggerAction('Generated New Secret API Key')}
          className="px-2.5 py-1 bg-purple-600 text-white font-medium rounded-lg text-xs hover:bg-purple-500"
        >
          Create Key
        </button>
      </div>

      <div className="p-4 space-y-3">
        {notification && (
          <div className="bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-lg text-xs">
            ✓ {notification}
          </div>
        )}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto">
          <code>
            curl -X POST https://api.nexus.dev/v1/tutorial/record \<br />
            &nbsp;&nbsp;-H "Authorization: Bearer nx_live_9921a" \<br />
            &nbsp;&nbsp;-d '&#123;"resolution": "4K", "fps": 60&#125;'
          </code>
        </div>
        <button
          onClick={() => triggerAction('Copied CURL command to clipboard')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-2"
        >
          <Copy className="w-3.5 h-3.5 text-purple-400" />
          <span>Copy Request Snippet</span>
        </button>
      </div>
    </div>
  );
};
