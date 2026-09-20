'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  Compass, 
  Layers, 
  Sparkles, 
  Calendar, 
  Clock, 
  Music, 
  ShoppingBag, 
  CreditCard,
  Info,
  ListFilter,
  Maximize2,
  ArrowRight
} from 'lucide-react';
import { 
  AnyReceipt, 
  ConstellationNode, 
  ConstellationLink, 
  ReceiptSource 
} from '@/lib/types';
import { generateConstellationData } from '@/lib/data/data-analyzer';

interface ConstellationViewProps {
  receipts: AnyReceipt[];
  onSelectReceipt: (receipt: AnyReceipt) => void;
  onExploreThread: (receipt: AnyReceipt) => void;
}

export function ConstellationView({
  receipts,
  onSelectReceipt,
  onExploreThread
}: ConstellationViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedSource, setSelectedSource] = useState<ReceiptSource | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas');

  // Canvas viewport transform
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Generate constellation dataset
  const { nodes, links } = useMemo(() => {
    return generateConstellationData(receipts, 220, selectedSource, selectedYear);
  }, [receipts, selectedSource, selectedYear]);

  // Active selected node & connected links
  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const connectedLinks = useMemo(() => {
    if (!selectedNodeId) return [];
    return links.filter(l => l.source === selectedNodeId || l.target === selectedNodeId);
  }, [links, selectedNodeId]);

  const connectedNodeMap = useMemo(() => {
    const map = new Set<string>();
    connectedLinks.forEach(l => {
      map.add(l.source);
      map.add(l.target);
    });
    return map;
  }, [connectedLinks]);

  // Resize canvas according to container
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 900,
          height: Math.max(500, containerRef.current.clientHeight || 600)
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewMode !== 'canvas') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#0a0c13';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    ctx.save();
    // Center point transform
    const centerX = dimensions.width / 2 + pan.x;
    const centerY = dimensions.height / 2 + pan.y;
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);

    // 1. Draw subtle background orbital concentric guide rings
    ctx.strokeStyle = '#181d2a';
    ctx.lineWidth = 1;
    [100, 200, 300, 400].forEach(radius => {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 2. Draw defensible links
    const nodeMap = new Map<string, ConstellationNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    links.forEach(link => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      if (!sourceNode || !targetNode) return;

      const isConnectedToSelected = selectedNodeId && (link.source === selectedNodeId || link.target === selectedNodeId);
      const isConnectedToHovered = hoveredNodeId && (link.source === hoveredNodeId || link.target === hoveredNodeId);

      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);

      if (isConnectedToSelected) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.9;
      } else if (isConnectedToHovered) {
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 0.7;
      } else {
        ctx.strokeStyle = link.relationshipType === 'time_proximity' ? '#334155' : '#1e293b';
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = selectedNodeId ? 0.15 : 0.45;
      }

      ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // 3. Draw nodes
    nodes.forEach(node => {
      const isSelected = node.id === selectedNodeId;
      const isHovered = node.id === hoveredNodeId;
      const isConnected = connectedNodeMap.has(node.id);

      ctx.save();
      ctx.beginPath();
      const radius = isSelected ? node.radius * 1.8 : (isHovered ? node.radius * 1.5 : node.radius);
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

      // Fill color
      ctx.fillStyle = node.color;
      if (selectedNodeId && !isSelected && !isConnected) {
        ctx.globalAlpha = 0.25;
      } else {
        ctx.globalAlpha = 1;
      }
      ctx.fill();

      // Outer glow for selected or hovered
      if (isSelected || isHovered) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Title label for selected/hovered nodes
      if (isSelected || isHovered) {
        ctx.font = '10px monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(node.receipt.primaryTitle.slice(0, 18), node.x, node.y - radius - 6);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [nodes, links, dimensions, zoom, pan, selectedNodeId, hoveredNodeId, connectedNodeMap, viewMode]);

  // Handle Canvas Click & Hover Hit Testing
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    // Hit test node under mouse
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = dimensions.width / 2 + pan.x;
    const centerY = dimensions.height / 2 + pan.y;

    const worldX = (mouseX - centerX) / zoom;
    const worldY = (mouseY - centerY) / zoom;

    let hitNode: ConstellationNode | null = null;
    for (const node of nodes) {
      const dist = Math.hypot(node.x - worldX, node.y - worldY);
      if (dist <= node.radius + 8) {
        hitNode = node;
        break;
      }
    }

    setHoveredNodeId(hitNode ? hitNode.id : null);
    canvas.style.cursor = hitNode ? 'pointer' : (isDragging ? 'grabbing' : 'grab');
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    // If it was a click (not a major drag)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = dimensions.width / 2 + pan.x;
    const centerY = dimensions.height / 2 + pan.y;

    const worldX = (mouseX - centerX) / zoom;
    const worldY = (mouseY - centerY) / zoom;

    for (const node of nodes) {
      const dist = Math.hypot(node.x - worldX, node.y - worldY);
      if (dist <= node.radius + 8) {
        setSelectedNodeId(node.id);
        return;
      }
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      
      {/* Top Header & Constellation Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#10131d] p-4 sm:p-5 rounded-2xl border border-[#212738]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-sky-400" />
              <span>LIFE CONSTELLATION NETWORK</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/40">
              {nodes.length} Nodes • {links.length} Defensible Links
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connections represent observable timestamp proximity, recurring entities, and diurnal cluster synchrony.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Source Selector */}
          <div className="flex items-center space-x-1 bg-[#161a26] p-1 rounded-xl border border-[#242b3d] text-xs font-mono">
            {(['all', 'spotify', 'household', 'india_trans'] as const).map(src => (
              <button
                key={src}
                onClick={() => { setSelectedSource(src); setSelectedNodeId(null); }}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedSource === src
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {src === 'all' ? 'All' : src === 'spotify' ? 'Spotify' : src === 'household' ? 'Household' : 'Commerce'}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-[#161a26] p-1 rounded-xl border border-[#242b3d] text-xs font-mono">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                viewMode === 'canvas' ? 'bg-[#242b3d] text-sky-300' : 'text-slate-400'
              }`}
            >
              Graph
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#242b3d] text-sky-300' : 'text-slate-400'
              }`}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage & Side Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Constellation Canvas Container */}
        <div 
          ref={containerRef}
          className="lg:col-span-2 relative h-[560px] rounded-2xl bg-[#090b12] border border-[#212739] overflow-hidden shadow-2xl flex items-center justify-center"
        >
          {viewMode === 'canvas' ? (
            <>
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className="w-full h-full block"
              />

              {/* Floating Canvas Controls Overlay */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-1.5 bg-[#141724]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#262e42] shadow-xl z-20">
                <button
                  onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-lg hover:bg-[#20273a] text-slate-300 text-xs"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}
                  className="p-1.5 rounded-lg hover:bg-[#20273a] text-slate-300 text-xs"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={resetView}
                  className="p-1.5 rounded-lg hover:bg-[#20273a] text-slate-300 text-xs"
                  title="Reset View"
                  aria-label="Reset View"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Legend overlay */}
              <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-[#11141f]/85 backdrop-blur-md border border-[#21283c] text-[11px] font-mono text-slate-300 space-y-1 z-20 pointer-events-none hidden sm:block">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">NODE CLUSTERS</div>
                <div className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" />
                  <span>Spotify Listening</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
                  <span>Daily Household</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                  <span>Multi-Facet India</span>
                </div>
              </div>

              {/* Instructions hint */}
              {!selectedNodeId && (
                <div className="absolute bottom-4 left-4 p-2 rounded-lg bg-[#11141f]/80 backdrop-blur-md border border-[#21283c] text-[11px] text-slate-400 font-mono pointer-events-none hidden sm:block">
                  Click any node to reveal connected evidence threads
                </div>
              )}
            </>
          ) : (
            /* Accessible Mobile / Desktop List View Fallback */
            <div className="w-full h-full p-4 overflow-y-auto space-y-2">
              <div className="text-xs font-mono font-bold text-slate-400 mb-2 uppercase">
                ACCESSIBLE NODE LIST ({nodes.length} RECORDS)
              </div>
              {nodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between text-xs font-mono ${
                    selectedNodeId === node.id
                      ? 'bg-[#1b2236] border-sky-500 text-white'
                      : 'bg-[#121520] border-[#222738] text-slate-300 hover:bg-[#181d2c]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: node.color }} />
                    <span className="font-semibold truncate">{node.receipt.primaryTitle}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{node.receipt.dateStr}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Node Inspection & Evidence Breakdown Sheet */}
        <div className="p-5 rounded-2xl bg-[#11141d] border border-[#222738] space-y-5 h-full">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#212739] pb-3">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                  SELECTED NODE INSPECTOR
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedNode.receipt.dateStr}
                </span>
              </div>

              {/* Node Summary Card */}
              <div className="p-4 rounded-xl bg-[#151926] border border-[#262f44] space-y-2">
                <div className="text-xs font-mono text-slate-400 uppercase">SUBJECT:</div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {selectedNode.receipt.primaryTitle}
                </h3>
                <p className="text-xs text-slate-300 font-mono">
                  {selectedNode.receipt.secondaryTitle}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-[#1f2638]">
                  <span>CATEGORY: {selectedNode.receipt.category}</span>
                  <span>{selectedNode.receipt.timeStr} UTC</span>
                </div>
              </div>

              {/* Defensible Connections List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
                    DEFENSIBLE LINKS ({connectedLinks.length})
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400">Verifiable Rules</span>
                </div>

                {connectedLinks.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {connectedLinks.map((link, idx) => {
                      return (
                        <div key={idx} className="p-3 rounded-lg bg-[#141824] border border-[#22293b] text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-sky-400 text-[11px]">
                              {link.relationshipType.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Strength: {Math.round(link.strength * 100)}%
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {link.explanation}
                          </p>
                          <div className="text-[10px] text-slate-400 font-mono bg-[#0e1017] p-1.5 rounded">
                            <strong className="text-slate-300">Observed:</strong> {link.observedEvidence}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[#141824] text-xs text-slate-400 font-mono text-center">
                    Isolated temporal cluster point
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  id="constellation-thread-btn"
                  onClick={() => onExploreThread(selectedNode.receipt)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/20 transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>EXPLORE THIS THREAD (NARRATIVE)</span>
                </button>

                <button
                  onClick={() => onSelectReceipt(selectedNode.receipt)}
                  className="w-full py-2 px-3 rounded-xl bg-[#181e2e] hover:bg-[#222a3e] text-slate-200 text-xs font-mono flex items-center justify-center space-x-1.5 border border-[#262f44]"
                >
                  <span>View Thermal Slip Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ) : (
            /* Empty State for Inspector */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
              <div className="p-4 rounded-2xl bg-[#151926] text-sky-400 border border-[#232a3c]">
                <Share2 className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 font-mono">
                NO NODE SELECTED
              </h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Click any node in the constellation graph to inspect its original telemetry and uncover why its connections exist.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
