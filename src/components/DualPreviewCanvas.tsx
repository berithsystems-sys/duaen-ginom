import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Monitor,
  Smartphone,
  Globe,
  RefreshCw,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  LayoutMode,
  CursorConfig,
  CursorPosition,
  ResolutionPreset,
} from '../types';
import { InteractiveMockup } from './InteractiveMockup';

interface DualPreviewCanvasProps {
  websiteUrl: string;
  useProxy: boolean;
  layoutMode: LayoutMode;
  cursorConfig: CursorConfig;
  cursorPos: CursorPosition;
  onCursorMove: (pos: CursorPosition) => void;
  onCanvasStreamReady?: (stream: MediaStream) => void;
  fps: number;
  resolution: ResolutionPreset;
  activeSiteId: string;
}

export const DualPreviewCanvas: React.FC<DualPreviewCanvasProps> = ({
  websiteUrl,
  useProxy,
  layoutMode,
  cursorConfig,
  cursorPos,
  onCursorMove,
  onCanvasStreamReady,
  fps,
  resolution,
  activeSiteId,
}) => {
  const desktopFrameRef = useRef<HTMLDivElement>(null);
  const mobileFrameRef = useRef<HTMLDivElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  const [clicks, setClicks] = useState<
    { x: number; y: number; viewport: 'desktop' | 'mobile'; id: number }[]
  >([]);

  // Calculate resolution dimensions for canvas recording stream
  const getCanvasDimensions = useCallback(() => {
    switch (resolution) {
      case '4k':
        return { width: 3840, height: 2160 };
      case '1440p':
        return { width: 2560, height: 1440 };
      case '720p':
        return { width: 1280, height: 720 };
      case '1080p':
      default:
        return { width: 1920, height: 1080 };
    }
  }, [resolution]);

  // Handle pointer move over either PC or Mobile frame
  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>,
    viewport: 'desktop' | 'mobile'
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    onCursorMove({
      xPercent,
      yPercent,
      isDown: e.buttons > 0,
      activeViewport: viewport,
    });
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    viewport: 'desktop' | 'mobile'
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    onCursorMove({
      xPercent,
      yPercent,
      isDown: true,
      activeViewport: viewport,
    });

    if (cursorConfig.showRipple) {
      setClicks((prev) => [
        ...prev.slice(-10),
        { x: xPercent, y: yPercent, viewport, id: Date.now() },
      ]);
    }
  };

  const handlePointerUp = (viewport: 'desktop' | 'mobile') => {
    onCursorMove({
      ...cursorPos,
      isDown: false,
      activeViewport: viewport,
    });
  };

  // Refs for animation frame state to prevent re-subscribing stream on state updates
  const cursorPosRef = useRef(cursorPos);
  const cursorConfigRef = useRef(cursorConfig);
  const layoutModeRef = useRef(layoutMode);
  const websiteUrlRef = useRef(websiteUrl);
  const activeSiteIdRef = useRef(activeSiteId);

  useEffect(() => { cursorPosRef.current = cursorPos; }, [cursorPos]);
  useEffect(() => { cursorConfigRef.current = cursorConfig; }, [cursorConfig]);
  useEffect(() => { layoutModeRef.current = layoutMode; }, [layoutMode]);
  useEffect(() => { websiteUrlRef.current = websiteUrl; }, [websiteUrl]);
  useEffect(() => { activeSiteIdRef.current = activeSiteId; }, [activeSiteId]);

  // Initialize stream ONLY when canvas mounts or resolution/fps changes
  useEffect(() => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas || !onCanvasStreamReady) return;
    try {
      const stream = canvas.captureStream(fps);
      onCanvasStreamReady(stream);
    } catch (e) {
      console.warn('captureStream failed:', e);
    }
  }, [fps, resolution, onCanvasStreamReady]);

  // Continuous Offscreen High-Res Canvas Compositor loop (Optimized, lightweight 60fps)
  useEffect(() => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    const { width, height } = getCanvasDimensions();
    canvas.width = width;
    canvas.height = height;

    const renderCanvasFrame = () => {
      const currentCursorPos = cursorPosRef.current;
      const currentCursorConfig = cursorConfigRef.current;
      const currentLayoutMode = layoutModeRef.current;
      const currentWebsiteUrl = websiteUrlRef.current;
      const currentSiteId = activeSiteIdRef.current;
      const frameTime = Date.now() / 1000;

      // 1. Clear background canvas with dark studio fill
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, width, height);

      // Subtle studio grid pattern
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Viewports according to Layout Mode
      let desktopBox = { x: 0, y: 0, w: 0, h: 0 };
      let mobileBox = { x: 0, y: 0, w: 0, h: 0 };

      if (currentLayoutMode === 'side-by-side') {
        desktopBox = {
          x: Math.round(width * 0.05),
          y: Math.round(height * 0.12),
          w: Math.round(width * 0.62),
          h: Math.round(height * 0.78),
        };
        mobileBox = {
          x: Math.round(width * 0.72),
          y: Math.round(height * 0.12),
          w: Math.round(width * 0.23),
          h: Math.round(height * 0.78),
        };
      } else if (currentLayoutMode === 'desktop-only') {
        desktopBox = {
          x: Math.round(width * 0.1),
          y: Math.round(height * 0.08),
          w: Math.round(width * 0.8),
          h: Math.round(height * 0.84),
        };
      } else if (currentLayoutMode === 'mobile-only') {
        mobileBox = {
          x: Math.round(width * 0.35),
          y: Math.round(height * 0.08),
          w: Math.round(width * 0.3),
          h: Math.round(height * 0.84),
        };
      } else if (currentLayoutMode === 'picture-in-picture') {
        desktopBox = {
          x: Math.round(width * 0.05),
          y: Math.round(height * 0.08),
          w: Math.round(width * 0.9),
          h: Math.round(height * 0.84),
        };
        mobileBox = {
          x: Math.round(width * 0.7),
          y: Math.round(height * 0.45),
          w: Math.round(width * 0.22),
          h: Math.round(height * 0.45),
        };
      }

      // Draw Desktop Container Box
      if (desktopBox.w > 0) {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(desktopBox.x, desktopBox.y, desktopBox.w, desktopBox.h, 16);
        ctx.fill();

        // Browser Header Bar
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(desktopBox.x, desktopBox.y, desktopBox.w, 36, [16, 16, 0, 0]);
        ctx.fill();

        // Mac window dots
        const dotY = desktopBox.y + 18;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(desktopBox.x + 20, dotY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(desktopBox.x + 36, dotY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(desktopBox.x + 52, dotY, 5, 0, Math.PI * 2);
        ctx.fill();

        // URL Pill
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(desktopBox.x + 70, desktopBox.y + 8, desktopBox.w - 140, 20, 6);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(currentWebsiteUrl || 'https://duaen.dev/preview', desktopBox.x + 80, desktopBox.y + 22);

        // Screen Inner Area
        const screenY = desktopBox.y + 36;
        const screenH = desktopBox.h - 36;

        // Draw Full High-Resolution Interactive Application UI on Canvas
        drawDesktopAppUI(ctx, desktopBox.x, screenY, desktopBox.w, screenH, currentSiteId, currentWebsiteUrl, frameTime);

        // Draw Synchronized Cursor on Desktop View
        const cursorX = desktopBox.x + (currentCursorPos.xPercent / 100) * desktopBox.w;
        const cursorY = screenY + (currentCursorPos.yPercent / 100) * screenH;

        drawCustomCursor(ctx, cursorX, cursorY, currentCursorConfig, currentCursorPos.isDown);
      }

      // Draw Mobile Container Box
      if (mobileBox.w > 0) {
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.roundRect(mobileBox.x, mobileBox.y, mobileBox.w, mobileBox.h, 32);
        ctx.fill();

        // Mobile Notch
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(mobileBox.x + mobileBox.w / 2 - 35, mobileBox.y + 8, 70, 18, 10);
        ctx.fill();

        // Mobile Inner Screen
        const mScreenY = mobileBox.y + 30;
        const mScreenH = mobileBox.h - 40;

        // Draw Mobile Responsive Application UI on Canvas
        drawMobileAppUI(ctx, mobileBox.x + 8, mScreenY, mobileBox.w - 16, mScreenH, currentSiteId, currentWebsiteUrl, frameTime);

        // Draw Synchronized Cursor on Mobile View
        const mCursorX = mobileBox.x + 8 + (currentCursorPos.xPercent / 100) * (mobileBox.w - 16);
        const mCursorY = mScreenY + (currentCursorPos.yPercent / 100) * mScreenH;

        drawCustomCursor(ctx, mCursorX, mCursorY, currentCursorConfig, currentCursorPos.isDown);
      }

      animId = requestAnimationFrame(renderCanvasFrame);
    };

    renderCanvasFrame();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [resolution, getCanvasDimensions]);

  // Helper to draw realistic high-resolution desktop application UI onto 2D canvas context
  const drawDesktopAppUI = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    siteId: string,
    url: string,
    time: number
  ) => {
    // 1. Dark App Canvas Fill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, w, h);

    // 2. Top App Navigation Bar
    const navH = Math.max(34, Math.round(h * 0.08));
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, w, navH);

    // App Logo Badge
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(x + 16, y + (navH - 22) / 2, 22, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('D', x + 23, y + (navH - 22) / 2 + 15);

    // App Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px sans-serif';
    const appName = siteId.includes('ecommerce')
      ? 'Nexus Store'
      : siteId.includes('docs')
      ? 'DevPortal API'
      : siteId.includes('writer')
      ? 'AI Studio Writer'
      : 'PulseAnalytics';
    ctx.fillText(appName, x + 46, y + (navH - 22) / 2 + 16);

    // Search Pill Input
    const searchW = Math.max(100, Math.round(w * 0.22));
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x + 180, y + (navH - 22) / 2, searchW, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('🔍 Search analytics...', x + 190, y + (navH - 22) / 2 + 15);

    // Profile Avatar
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(x + w - 20, y + navH / 2, 11, 0, Math.PI * 2);
    ctx.fill();

    // Notification Dot
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x + w - 46, y + navH / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Left Sidebar
    const sidebarW = Math.max(120, Math.round(w * 0.17));
    const mainY = y + navH;
    const mainH = h - navH;

    ctx.fillStyle = '#111827';
    ctx.fillRect(x, mainY, sidebarW, mainH);

    // Sidebar Menu Items
    const menuItems = ['📊 Dashboard', '📈 Analytics', '👥 Customers', '💳 Revenue', '⚙️ Settings'];
    let menuY = mainY + 16;
    menuItems.forEach((item, idx) => {
      if (idx === 0) {
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect(x + 8, menuY, sidebarW - 16, 26, 6);
        ctx.fill();
      }
      ctx.fillStyle = idx === 0 ? '#ffffff' : '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(item, x + 14, menuY + 17);
      menuY += 32;
    });

    // 4. Main Content Dashboard Area
    const contentX = x + sidebarW + 16;
    const contentY = mainY + 16;
    const contentW = w - sidebarW - 32;

    // Stat Cards (4 across)
    const cardGap = 12;
    const cardW = Math.max(80, (contentW - cardGap * 3) / 4);
    const cardH = Math.max(54, Math.round(mainH * 0.22));

    const stats = [
      { label: 'Total Revenue', val: '$128,450', growth: '+18.4%', color: '#10b981' },
      { label: 'Active Users', val: '3,842', growth: '+12.3%', color: '#3b82f6' },
      { label: 'Conversion', val: '4.85%', growth: '+2.1%', color: '#8b5cf6' },
      { label: 'API Uptime', val: '99.98%', growth: '18ms', color: '#06b6d4' },
    ];

    stats.forEach((st, i) => {
      const cx = contentX + i * (cardW + cardGap);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(cx, contentY, cardW, cardH, 8);
      ctx.fill();

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(st.label, cx + 10, contentY + 16);

      // Value
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(st.val, cx + 10, contentY + 36);

      // Growth Badge
      ctx.fillStyle = st.color;
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(st.growth, cx + cardW - 42, contentY + 16);
    });

    // 5. Animated Graph / Analytics Chart Box
    const chartY = contentY + cardH + 16;
    const chartW = Math.max(120, contentW * 0.58);
    const chartH = Math.max(80, mainH - cardH - 48);

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(contentX, chartY, chartW, chartH, 10);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Real-Time Performance Analytics', contentX + 14, chartY + 22);

    // Bars
    const numBars = 10;
    const barW = Math.max(6, (chartW - 40) / numBars - 6);
    let barX = contentX + 20;
    const maxBarH = Math.max(20, chartH - 50);

    for (let b = 0; b < numBars; b++) {
      const wave = Math.sin(time * 2.5 + b * 0.6) * 0.25 + 0.6;
      const barHeight = Math.max(10, maxBarH * wave);
      const by = chartY + chartH - 18 - barHeight;

      const grad = ctx.createLinearGradient(0, by, 0, by + barHeight);
      grad.addColorStop(0, '#818cf8');
      grad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.roundRect(barX, by, barW, barHeight, 3);
      ctx.fill();

      barX += barW + 6;
    }

    // 6. Recent Customer Activity Table Box
    const tableX = contentX + chartW + 16;
    const tableW = Math.max(100, contentW - chartW - 16);
    const tableH = chartH;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(tableX, chartY, tableW, tableH, 10);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Recent Activity', tableX + 14, chartY + 22);

    const rows = [
      { name: 'Alex Rivers', status: 'Paid', price: '$1,490' },
      { name: 'Sarah Chen', status: 'Active', price: '$299' },
      { name: 'Elena Rostova', status: 'Active', price: '$299' },
      { name: 'Marcus Vance', status: 'Paid', price: '$49' },
    ];

    let rowY = chartY + 44;
    rows.forEach((r) => {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(tableX + 18, rowY + 8, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px sans-serif';
      ctx.fillText(r.name, tableX + 32, rowY + 12);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(r.status, tableX + tableW - 75, rowY + 12);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(r.price, tableX + tableW - 38, rowY + 12);

      rowY += 28;
    });
  };

  // Helper to draw mobile responsive application UI onto 2D canvas context
  const drawMobileAppUI = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    siteId: string,
    url: string,
    time: number
  ) => {
    // Mobile Screen Background Fill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, w, h);

    // Status Bar (Top time 9:41 & indicator)
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('9:41', x + 12, y + 14);

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(x + w - 16, y + 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // Mobile App Header
    const headerY = y + 20;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, headerY, w, 32);

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(x + 10, headerY + 5, 22, 22, 5);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('DuaEn Mobile', x + 38, headerY + 19);

    // Search Pill
    const bodyY = headerY + 38;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x + 10, bodyY, w - 20, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText('🔍 Search mobile app...', x + 20, bodyY + 16);

    // Stacked Metric Card 1
    const mCardY = bodyY + 32;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x + 10, mCardY, w - 20, 50, 8);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.fillText('Total Revenue Today', x + 18, mCardY + 15);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('$12,480.00', x + 18, mCardY + 36);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('+18.4%', x + w - 48, mCardY + 36);

    // Stacked Metric Card 2
    const mCardY2 = mCardY + 58;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x + 10, mCardY2, w - 20, 50, 8);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.fillText('Active Mobile Users', x + 18, mCardY2 + 15);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('1,842 Live', x + 18, mCardY2 + 36);

    // Mobile Animated Mini Chart
    const mChartY = mCardY2 + 58;
    const mChartH = Math.max(50, h - (mChartY - y) - 40);

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x + 10, mChartY, w - 20, mChartH, 8);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Hourly Traffic', x + 16, mChartY + 16);

    const numMBars = 6;
    const mBarW = Math.max(4, (w - 48) / numMBars - 4);
    let mBarX = x + 16;

    for (let b = 0; b < numMBars; b++) {
      const wave = Math.sin(time * 2.5 + b * 0.7) * 0.25 + 0.55;
      const bh = Math.max(8, (mChartH - 26) * wave);
      const by = mChartY + mChartH - 8 - bh;

      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.roundRect(mBarX, by, mBarW, bh, 2);
      ctx.fill();

      mBarX += mBarW + 4;
    }

    // Mobile Bottom Bar
    const navBarY = y + h - 30;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, navBarY, w, 30);

    const navIcons = ['🏠', '📊', '👥', '⚙️'];
    const stepX = w / 4;
    navIcons.forEach((icon, idx) => {
      ctx.font = '11px sans-serif';
      ctx.fillText(icon, x + idx * stepX + stepX / 2 - 5, navBarY + 18);
    });
  };

  // Helper function to render custom cursor styles on canvas
  const drawCustomCursor = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    config: CursorConfig,
    isDown: boolean
  ) => {
    ctx.save();

    // Down Click Ripple Effect
    if (isDown || config.showRipple) {
      ctx.beginPath();
      ctx.arc(x, y, isDown ? 24 : 16, 0, Math.PI * 2);
      ctx.fillStyle = config.rippleColor || 'rgba(239, 68, 68, 0.3)';
      ctx.fill();
    }

    if (config.style === 'laser-pointer') {
      // Laser Pointer style
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fill();
    } else if (config.style === 'glowing-halo') {
      // Glowing Halo style
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fillStyle = config.color || 'rgba(99, 102, 241, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else {
      // Standard macOS Style Arrow Cursor
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 18);
      ctx.lineTo(4.5, 13.5);
      ctx.lineTo(9.5, 21);
      ctx.lineTo(13, 19.5);
      ctx.lineTo(8, 12);
      ctx.lineTo(15, 12);
      ctx.closePath();

      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }

    ctx.restore();
  };

  // Determine iframe source URL
  const getIframeSrc = (url: string) => {
    if (!url || url.startsWith('demo://')) return null;
    if (useProxy) {
      return `/api/proxy?url=${encodeURIComponent(url)}`;
    }
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const iframeSrc = getIframeSrc(websiteUrl);

  return (
    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Hidden Offscreen High-Res Compositor Canvas */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* Visible Interactive Desktop + Mobile Preview Frames */}
      <div className="w-full h-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
        {/* DESKTOP VIEWPORT FRAME */}
        {(layoutMode === 'side-by-side' || layoutMode === 'desktop-only' || layoutMode === 'picture-in-picture') && (
          <div
            ref={desktopFrameRef}
            onPointerMove={(e) => handlePointerMove(e, 'desktop')}
            onPointerDown={(e) => handlePointerDown(e, 'desktop')}
            onPointerUp={() => handlePointerUp('desktop')}
            className={`relative bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden transition-all flex flex-col ${
              layoutMode === 'side-by-side' ? 'flex-1 h-[82vh]' : layoutMode === 'desktop-only' ? 'w-full h-[84vh]' : 'w-full h-[84vh]'
            }`}
          >
            {/* Mock MacBook / Browser Top Header */}
            <div className="bg-slate-800/90 border-b border-slate-700/80 px-4 py-2 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              </div>

              {/* URL Address Bar */}
              <div className="flex-1 max-w-md mx-4 bg-slate-950/80 border border-slate-700/60 rounded-lg px-3 py-1 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="truncate">{websiteUrl || 'https://autodocrec.dev/preview'}</span>
                <Globe className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 ml-2" />
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Monitor className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-slate-300">16:9 PC</span>
              </div>
            </div>

            {/* Inner Content Area */}
            <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
              {iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  title="PC Viewport Preview"
                  className="w-full h-full border-0 pointer-events-auto"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : (
                <InteractiveMockup siteId={activeSiteId} isMobile={false} />
              )}

              {/* Visible Custom Overlay Cursor on Desktop Frame */}
              {cursorPos.activeViewport === 'desktop' && (
                <div
                  style={{
                    left: `${cursorPos.xPercent}%`,
                    top: `${cursorPos.yPercent}%`,
                  }}
                  className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-30 transition-transform duration-75"
                >
                  {cursorConfig.style === 'laser-pointer' ? (
                    <div className="w-5 h-5 rounded-full bg-red-500 ring-4 ring-red-400/40 shadow-lg shadow-red-500/50 animate-pulse"></div>
                  ) : cursorConfig.style === 'glowing-halo' ? (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/40 ring-2 ring-indigo-400 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-rose-500 ring-2 ring-white shadow-xl"></div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MOBILE VIEWPORT FRAME */}
        {(layoutMode === 'side-by-side' || layoutMode === 'mobile-only' || layoutMode === 'picture-in-picture') && (
          <div
            ref={mobileFrameRef}
            onPointerMove={(e) => handlePointerMove(e, 'mobile')}
            onPointerDown={(e) => handlePointerDown(e, 'mobile')}
            onPointerUp={() => handlePointerUp('mobile')}
            className={`relative bg-slate-950 rounded-[38px] border-[10px] border-slate-900 shadow-2xl overflow-hidden transition-all flex flex-col ${
              layoutMode === 'side-by-side'
                ? 'w-[320px] md:w-[360px] h-[82vh]'
                : layoutMode === 'mobile-only'
                ? 'w-[360px] h-[84vh]'
                : 'absolute bottom-8 right-8 w-[280px] h-[480px] z-30 ring-4 ring-indigo-500/30'
            }`}
          >
            {/* Dynamic Island Notch */}
            <div className="bg-slate-900 h-7 w-full flex items-center justify-center z-10">
              <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-end px-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>

            {/* Inner Mobile Screen */}
            <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
              {iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  title="Mobile Viewport Preview"
                  className="w-full h-full border-0 pointer-events-auto"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : (
                <InteractiveMockup siteId={activeSiteId} isMobile={true} />
              )}

              {/* Synchronized Cursor Indicator on Mobile Screen */}
              <div
                style={{
                  left: `${cursorPos.xPercent}%`,
                  top: `${cursorPos.yPercent}%`,
                }}
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-30 transition-transform duration-75"
              >
                <div className="w-4 h-4 rounded-full bg-indigo-500 ring-2 ring-white shadow-xl animate-ping"></div>
              </div>
            </div>

            {/* Mobile Bottom Home Bar */}
            <div className="bg-slate-900 h-5 w-full flex items-center justify-center">
              <div className="w-24 h-1 bg-slate-600 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
