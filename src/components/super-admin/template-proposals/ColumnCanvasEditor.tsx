"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Eye,
  EyeOff,
  MoveHorizontal,
  Info,
  Maximize2,
  Minimize2,
  FileText,
} from "lucide-react";
import type { LayoutColumn } from "@/lib/types/templateProposal.types";

interface ColumnCanvasEditorProps {
  columns: LayoutColumn[];
  onChange: (columns: LayoutColumn[]) => void;
  imageUrl?: string | null;
  imageBase64?: string | null;
  sampleText?: string | null;
  bankName?: string | null;
  isRestricted?: boolean;
}

const COLUMN_COLORS = [
  { bg: "bg-[#4A6FA5]/15", border: "border-[#4A6FA5]", badge: "bg-[#4A6FA5] text-white" },
  { bg: "bg-[#3D7A64]/15", border: "border-[#3D7A64]", badge: "bg-[#3D7A64] text-white" },
  { bg: "bg-[#9E6B42]/15", border: "border-[#9E6B42]", badge: "bg-[#9E6B42] text-white" },
  { bg: "bg-[#A8C5DA]/25", border: "border-[#4A6FA5]", badge: "bg-[#1E2A38] text-white" },
  { bg: "bg-[#9E4A4A]/15", border: "border-[#9E4A4A]", badge: "bg-[#9E4A4A] text-white" },
  { bg: "bg-[#5A6E85]/15", border: "border-[#5A6E85]", badge: "bg-[#5A6E85] text-white" },
  { bg: "bg-[#4A6FA5]/20", border: "border-[#4A6FA5]", badge: "bg-[#3D5C8A] text-white" },
];

export default function ColumnCanvasEditor({
  columns,
  onChange,
  imageUrl,
  imageBase64,
  sampleText,
  bankName,
  isRestricted = false,
}: ColumnCanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const [selectedColIndex, setSelectedColIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Derive resolved image source
  const resolvedImageSrc = React.useMemo(() => {
    if (imageBase64) {
      if (imageBase64.startsWith("data:")) return imageBase64;
      return `data:image/png;base64,${imageBase64}`;
    }
    if (imageUrl) {
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
      const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const cleanPath = imageUrl.replace(/\\/g, "/");
      return `${apiHost.replace(/\/api\/v1\/?$/, "")}/${cleanPath.replace(/^\//, "")}`;
    }
    return null;
  }, [imageUrl, imageBase64]);

  // Ensure columns have valid boundary percentages
  const normalizedColumns = React.useMemo(() => {
    if (!columns || columns.length === 0) return [];
    const count = columns.length;

    return columns.map((col, idx) => {
      let xStart = typeof col.xStart === "number" ? col.xStart : idx / count;
      let xEnd = typeof col.xEnd === "number" ? col.xEnd : (idx + 1) / count;

      if (xStart >= xEnd) {
        xStart = idx / count;
        xEnd = (idx + 1) / count;
      }

      return {
        ...col,
        xStart: Math.max(0, Math.min(1, Number(xStart.toFixed(3)))),
        xEnd: Math.max(0, Math.min(1, Number(xEnd.toFixed(3)))),
      };
    });
  }, [columns]);

  // Handle dragging vertical divider between columns
  const handlePointerDown = (dividerIndex: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDragIndex(dividerIndex);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (activeDragIndex === null || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const rawFraction = (clientX - rect.left) / rect.width;
      const clampedFraction = Math.max(0.01, Math.min(0.99, Number(rawFraction.toFixed(3))));

      const updated = [...normalizedColumns];

      if (activeDragIndex === 0) {
        // Dragging leftmost boundary
        const nextStart = updated[1]?.xStart ?? 0.3;
        const bounded = Math.min(clampedFraction, nextStart - 0.02);
        updated[0] = { ...updated[0], xStart: Math.max(0, bounded) };
      } else if (activeDragIndex === updated.length) {
        // Dragging rightmost boundary
        const prevEnd = updated[updated.length - 1]?.xStart ?? 0.7;
        const bounded = Math.max(clampedFraction, prevEnd + 0.02);
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          xEnd: Math.min(1.0, bounded),
        };
      } else {
        // Dragging boundary between column (activeDragIndex - 1) and column (activeDragIndex)
        const leftIdx = activeDragIndex - 1;
        const rightIdx = activeDragIndex;

        const leftMin = (updated[leftIdx]?.xStart ?? 0) + 0.02;
        const rightMax = (updated[rightIdx]?.xEnd ?? 1) - 0.02;

        const safeX = Math.max(leftMin, Math.min(rightMax, clampedFraction));

        updated[leftIdx] = { ...updated[leftIdx], xEnd: safeX };
        updated[rightIdx] = { ...updated[rightIdx], xStart: safeX };
      }

      onChange(updated);
    },
    [activeDragIndex, normalizedColumns, onChange]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (activeDragIndex !== null) {
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        setActiveDragIndex(null);
      }
    },
    [activeDragIndex]
  );

  // Reset columns evenly
  const handleResetEvenly = () => {
    const count = normalizedColumns.length;
    if (count === 0) return;
    const step = 0.94 / count;
    const updated = normalizedColumns.map((col, idx) => ({
      ...col,
      xStart: Number((0.03 + idx * step).toFixed(3)),
      xEnd: Number((0.03 + (idx + 1) * step).toFixed(3)),
    }));
    onChange(updated);
  };

  // Split lines from sampleText for background preview if image is unavailable
  const previewLines = React.useMemo(() => {
    if (!sampleText) return [];
    return sampleText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 15);
  }, [sampleText]);

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col transition-all ${
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "relative"
      }`}
    >
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F7F9FB]/60 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4A6FA5]/10 text-[#4A6FA5] flex items-center justify-center font-bold text-xs">
            {normalizedColumns.length}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E2A38]">
              Interactive Column Boundary Canvas
            </h3>
            <p className="text-xs text-[#5A6E85]">
              Drag the vertical handles to adjust column widths in real-time [0.00 $\rightarrow$ 1.00]
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              showOverlays
                ? "border-[#4A6FA5] text-[#4A6FA5] bg-[#4A6FA5]/10"
                : "border-[#E2E8F0] text-[#5A6E85] hover:bg-slate-100"
            }`}
            title={showOverlays ? "Hide Column Overlays" : "Show Column Overlays"}
          >
            {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showOverlays ? "Overlays On" : "Overlays Off"}</span>
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.7, Number((z - 0.1).toFixed(1))))}
            className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#5A6E85] hover:bg-slate-100 text-xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-mono text-[#5A6E85] px-1 min-w-[42px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.8, Number((z + 0.1).toFixed(1))))}
            className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#5A6E85] hover:bg-slate-100 text-xs"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetEvenly}
            className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#5A6E85] hover:bg-slate-100 text-xs flex items-center gap-1"
            title="Distribute columns evenly"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Distribute Evenly</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#5A6E85] hover:bg-slate-100 text-xs"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="relative flex-1 bg-[#0C131F]/5 min-h-[460px] max-h-[640px] overflow-auto p-4 flex items-center justify-center select-none">
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
          className="relative w-full max-w-4xl h-[520px] bg-white rounded-xl shadow-md border border-[#E2E8F0] overflow-hidden select-none"
        >
          {/* Document Content Layer */}
          {resolvedImageSrc ? (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedImageSrc}
                alt="Statement Sample Page Preview"
                className="w-full h-full object-contain pointer-events-none opacity-85"
              />
            </div>
          ) : (
            /* High-fidelity Simulated Statement Canvas */
            <div className="absolute inset-0 p-6 flex flex-col justify-between font-mono text-xs text-[#1E2A38] pointer-events-none overflow-hidden">
              {/* Simulated Bank Header */}
              <div className="border-b border-[#E2E8F0] pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1E2A38] uppercase tracking-wide">
                    {bankName || "BANK OF INDIA / COMMERCIAL BANK"}
                  </span>
                  <span className="text-[11px] text-[#5A6E85]">Account Statement (Sample Layout)</span>
                </div>
                <div className="text-[10px] text-[#8E9FAA] flex gap-4">
                  <span>Branch: CENTRAL MUMBAI</span>
                  <span>Currency: INR</span>
                  <span>Generated: 2026-10-15</span>
                </div>
              </div>

              {/* Sample Document Text Lines or Placeholders */}
              <div className="my-auto space-y-2 py-4 opacity-75">
                {previewLines.length > 0 ? (
                  previewLines.map((line, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] leading-tight text-[#1E2A38] truncate whitespace-pre font-mono bg-slate-50/60 px-2 py-0.5 rounded"
                    >
                      {line}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="h-3.5 bg-slate-100 rounded w-5/6" />
                    <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                    <div className="h-px bg-slate-200 my-3" />
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-2.5 bg-slate-100 rounded w-16" />
                        <div className="h-2.5 bg-slate-100 rounded flex-1" />
                        <div className="h-2.5 bg-slate-100 rounded w-20" />
                        <div className="h-2.5 bg-slate-100 rounded w-20" />
                        <div className="h-2.5 bg-slate-100 rounded w-24" />
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Simulated Statement Footer */}
              <div className="border-t border-[#E2E8F0] pt-2 text-[10px] text-[#8E9FAA] flex justify-between">
                <span>Page 1 of 1 · Generated by Core Banking System</span>
                <span>End of Transactions</span>
              </div>
            </div>
          )}

          {/* Privacy Access Banner if Samples Restricted */}
          {isRestricted && (
            <div className="absolute top-2 right-2 bg-amber-500/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded shadow-xs flex items-center gap-1 pointer-events-none">
              <Info className="w-3 h-3" /> Raw Sample Image Restricted
            </div>
          )}

          {/* Overlaid Column Boundaries & Drag Handles */}
          {showOverlays && (
            <div className="absolute inset-0 pointer-events-none">
              {normalizedColumns.map((col, index) => {
                const leftPercent = col.xStart! * 100;
                const widthPercent = (col.xEnd! - col.xStart!) * 100;
                const colorSet = COLUMN_COLORS[index % COLUMN_COLORS.length];
                const isSelected = selectedColIndex === index;

                return (
                  <div
                    key={index}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    onClick={() => setSelectedColIndex(index)}
                    className={`absolute top-0 bottom-0 pointer-events-auto border-r-2 ${
                      colorSet.border
                    } ${colorSet.bg} transition-all cursor-pointer ${
                      isSelected ? "ring-2 ring-inset ring-[#4A6FA5] bg-[#4A6FA5]/25" : "hover:opacity-95"
                    }`}
                  >
                    {/* Column Header Tag at Top */}
                    <div className="absolute top-2 left-1.5 right-1.5 flex flex-col gap-0.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold truncate shadow-xs ${colorSet.badge}`}
                        title={col.name}
                      >
                        {col.name.toUpperCase()}
                      </span>
                      <span className="text-[9px] font-mono text-[#1E2A38] bg-white/85 px-1 rounded shadow-xs w-fit">
                        [{(col.xStart ?? 0).toFixed(2)} - {(col.xEnd ?? 0).toFixed(2)}]
                      </span>
                    </div>

                    {/* Column Content Indicator */}
                    <div className="absolute bottom-2 left-1.5 text-[9px] font-mono text-[#5A6E85] bg-white/80 px-1 rounded">
                      {Math.round(widthPercent)}% width
                    </div>
                  </div>
                );
              })}

              {/* Draggable Divider Handles */}
              {/* Boundary 0: Left edge of first column */}
              {normalizedColumns.length > 0 && (
                <div
                  style={{ left: `${(normalizedColumns[0].xStart ?? 0) * 100}%` }}
                  onPointerDown={(e) => handlePointerDown(0, e)}
                  className="absolute top-0 bottom-0 w-3 -ml-1.5 cursor-col-resize pointer-events-auto group z-20 flex items-center justify-center"
                  title="Drag Leftmost Margin"
                >
                  <div className="w-1 h-full bg-[#4A6FA5]/60 group-hover:bg-[#4A6FA5] group-hover:w-1.5 transition-all rounded" />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-white border border-[#4A6FA5] rounded shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoveHorizontal className="w-2.5 h-2.5 text-[#4A6FA5]" />
                  </div>
                </div>
              )}

              {/* Boundaries between columns: 1 to count-1 */}
              {normalizedColumns.slice(0, -1).map((col, idx) => {
                const dividerPos = (col.xEnd ?? 0) * 100;
                const isDraggingThis = activeDragIndex === idx + 1;

                return (
                  <div
                    key={`div-${idx}`}
                    style={{ left: `${dividerPos}%` }}
                    onPointerDown={(e) => handlePointerDown(idx + 1, e)}
                    className="absolute top-0 bottom-0 w-4 -ml-2 cursor-col-resize pointer-events-auto group z-20 flex items-center justify-center"
                    title={`Adjust boundary between ${normalizedColumns[idx]?.name} and ${normalizedColumns[idx + 1]?.name}`}
                  >
                    <div
                      className={`h-full transition-all rounded ${
                        isDraggingThis
                          ? "w-1.5 bg-[#4A6FA5] shadow-lg"
                          : "w-0.5 bg-[#4A6FA5]/70 group-hover:bg-[#4A6FA5] group-hover:w-1.5"
                      }`}
                    />
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-4 h-7 bg-white border border-[#4A6FA5] rounded-md shadow-md flex items-center justify-center transition-all ${
                        isDraggingThis ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <MoveHorizontal className="w-2.5 h-2.5 text-[#4A6FA5]" />
                    </div>
                  </div>
                );
              })}

              {/* Boundary N: Right edge of last column */}
              {normalizedColumns.length > 0 && (
                <div
                  style={{
                    left: `${(normalizedColumns[normalizedColumns.length - 1].xEnd ?? 1) * 100}%`,
                  }}
                  onPointerDown={(e) => handlePointerDown(normalizedColumns.length, e)}
                  className="absolute top-0 bottom-0 w-3 -ml-1.5 cursor-col-resize pointer-events-auto group z-20 flex items-center justify-center"
                  title="Drag Rightmost Margin"
                >
                  <div className="w-1 h-full bg-[#4A6FA5]/60 group-hover:bg-[#4A6FA5] group-hover:w-1.5 transition-all rounded" />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-white border border-[#4A6FA5] rounded shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoveHorizontal className="w-2.5 h-2.5 text-[#4A6FA5]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Coordinate Summary Bar */}
      <div className="px-5 py-3 border-t border-[#E2E8F0] bg-white flex items-center justify-between overflow-x-auto text-xs gap-3">
        <div className="flex items-center gap-2 text-[#5A6E85] shrink-0">
          <Sliders className="w-3.5 h-3.5 text-[#4A6FA5]" />
          <span className="font-semibold text-[#1E2A38]">Column Spans:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {normalizedColumns.map((col, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedColIndex(idx)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs cursor-pointer border transition-colors ${
                selectedColIndex === idx
                  ? "bg-[#4A6FA5]/10 border-[#4A6FA5] text-[#1E2A38] font-bold"
                  : "bg-slate-50 border-[#E2E8F0] text-[#5A6E85] hover:bg-slate-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#4A6FA5]" />
              <span className="capitalize">{col.name}:</span>
              <span className="font-mono text-[11px] text-[#1E2A38]">
                [{(col.xStart ?? 0).toFixed(2)}, {(col.xEnd ?? 0).toFixed(2)}]
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
