"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MoveHorizontal } from "lucide-react";
import { PricingCard, PricingPlanItem } from "./PricingCard";

interface PricingSliderProps {
  plans: PricingPlanItem[];
  onSelectPlan: (planId: string) => void;
}

const GAP = 20; // 20px gap between cards

export function PricingSlider({ plans, onSelectPlan }: PricingSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Drag / touch state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const isPointerDown = useRef(false);
  const dragDistance = useRef(0);

  // Calculate visible cards count based on measured container width
  const visibleCount =
    containerWidth >= 1024 ? 3 : containerWidth >= 640 ? 2 : 1;

  // Max index ensuring no partial card or empty overflow
  const maxIndex = Math.max(0, plans.length - visibleCount);

  // Safely derive current clamped index during render without cascading setState effects
  const safeIndex = Math.min(currentIndex, maxIndex);

  // Total reachable dots
  const totalDots = maxIndex + 1;

  // Exact card width so that exactly `visibleCount` cards fit 100% of the container with no partial cutoffs
  const cardWidth =
    containerWidth > 0
      ? (containerWidth - (visibleCount - 1) * GAP) / visibleCount
      : 320;

  // Measure container width accurately using ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      if (el) {
        setContainerWidth(el.clientWidth);
      }
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Handlers for sliding
  const slidePrev = () => {
    setCurrentIndex(Math.max(0, safeIndex - 1));
  };

  const slideNext = () => {
    setCurrentIndex(Math.min(maxIndex, safeIndex + 1));
  };

  // Pointer / Touch drag events
  const handleStart = (clientX: number) => {
    isPointerDown.current = true;
    dragDistance.current = 0;
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isPointerDown.current) return;
      const delta = clientX - startX;
      dragDistance.current = Math.abs(delta);

      if (dragDistance.current > 6) {
        setIsDragging(true);
      }

      // Resist overscroll past boundaries
      if (
        (safeIndex === 0 && delta > 0) ||
        (safeIndex === maxIndex && delta < 0)
      ) {
        setDragOffset(delta * 0.3);
      } else {
        setDragOffset(delta);
      }
    },
    [maxIndex, safeIndex, startX]
  );

  const handleEnd = useCallback(() => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;

    const threshold = Math.min(60, cardWidth * 0.2);

    if (dragOffset < -threshold && safeIndex < maxIndex) {
      setCurrentIndex(Math.min(maxIndex, safeIndex + 1));
    } else if (dragOffset > threshold && safeIndex > 0) {
      setCurrentIndex(Math.max(0, safeIndex - 1));
    }

    setDragOffset(0);
    setTimeout(() => {
      setIsDragging(false);
    }, 50);
  }, [cardWidth, dragOffset, maxIndex, safeIndex]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleStart(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Compute translateX in pixels
  const baseTranslate = -(safeIndex * (cardWidth + GAP));
  const currentTranslate = baseTranslate + dragOffset;

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Slider Controls Bar (only rendered when sliding is needed) */}
      {maxIndex > 0 && (
        <div className="flex items-center justify-between px-1 mb-4">
          {/* Sliding cue */}
          <div className="flex items-center gap-1.5 text-xs text-[#5A6E85] font-medium bg-[#F7F9FB] px-3 py-1 rounded-full border border-[#E2E8F0]">
            <MoveHorizontal className="w-3.5 h-3.5 text-[#4A6FA5]" />
            <span className="hidden sm:inline">Slide or swipe cards to compare</span>
            <span className="sm:hidden">Swipe to compare</span>
          </div>

          {/* Previous / Next Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={slidePrev}
              disabled={safeIndex === 0}
              aria-label="Previous plan"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                safeIndex > 0
                  ? "bg-white text-[#1E2A38] border-[#E2E8F0] hover:bg-[#4A6FA5] hover:text-white hover:border-[#4A6FA5] shadow-xs active:scale-95"
                  : "bg-white/50 text-[#8E9FAA]/40 border-[#E2E8F0]/60 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={slideNext}
              disabled={safeIndex === maxIndex}
              aria-label="Next plan"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                safeIndex < maxIndex
                  ? "bg-white text-[#1E2A38] border-[#E2E8F0] hover:bg-[#4A6FA5] hover:text-white hover:border-[#4A6FA5] shadow-xs active:scale-95"
                  : "bg-white/50 text-[#8E9FAA]/40 border-[#E2E8F0]/60 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Overflow-Hidden Viewport: strictly prevents partial cards from rendering */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full overflow-hidden select-none py-2 cursor-grab ${
          isDragging ? "cursor-grabbing" : ""
        }`}
      >
        {/* Animated Sliding Track */}
        <div
          className="flex items-stretch transition-transform"
          style={{
            gap: `${GAP}px`,
            transform: `translateX(${currentTranslate}px)`,
            transitionDuration: isDragging ? "0ms" : "400ms",
            transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              style={{
                width: `${cardWidth}px`,
                flexShrink: 0,
              }}
              className="flex"
            >
              <PricingCard
                plan={plan}
                isActive={
                  index >= safeIndex && index < safeIndex + visibleCount
                }
                isDragging={isDragging}
                onSelect={() => onSelectPlan(plan.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots (Only exact reachable slide positions are rendered) */}
      {maxIndex > 0 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {Array.from({ length: totalDots }).map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              onClick={() => setCurrentIndex(dotIndex)}
              aria-label={`Slide to view ${dotIndex + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                safeIndex === dotIndex
                  ? "w-7 bg-[#4A6FA5]"
                  : "w-2 bg-[#CBD5E1] hover:bg-[#A8C5DA]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
