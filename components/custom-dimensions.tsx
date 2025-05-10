"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";

interface CustomDimensionsProps {
  initialWidth?: number;
  initialHeight?: number;
  onDimensionsChange: (width: number, height: number) => void;
  disabled?: boolean;
}

export function CustomDimensions({
  initialWidth = 1200,
  initialHeight = 630,
  onDimensionsChange,
  disabled = false,
}: CustomDimensionsProps) {
  const [width, setWidth] = useState<number>(initialWidth);
  const [height, setHeight] = useState<number>(initialHeight);
  const [aspectLocked, setAspectLocked] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(initialWidth / initialHeight);

  useEffect(() => {
    if (initialWidth && initialHeight) {
      setWidth(initialWidth);
      setHeight(initialHeight);
      setAspectRatio(initialWidth / initialHeight);
    }
  }, [initialWidth, initialHeight]);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (aspectLocked) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (aspectLocked) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const toggleAspectLock = () => {
    if (!aspectLocked) {
      // When re-locking, update the aspect ratio to match current dimensions
      setAspectRatio(width / height);
    }
    setAspectLocked(!aspectLocked);
  };

  useEffect(() => {
    if (width > 0 && height > 0) {
      onDimensionsChange(width, height);
    }
  }, [width, height, onDimensionsChange]);

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-2">
        <Label htmlFor="width">Width (px)</Label>
        <Input
          id="width"
          type="number"
          value={width}
          onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
          min={10}
          max={10000}
          disabled={disabled}
          className="w-24"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="height">Height (px)</Label>
        <Input
          id="height"
          type="number"
          value={height}
          onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
          min={10}
          max={10000}
          disabled={disabled}
          className="w-24"
        />
      </div>

      <Button
        variant="outline"
        size="icon"
        type="button"
        onClick={toggleAspectLock}
        disabled={disabled}
        className="h-10 w-10"
        title={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
      >
        {aspectLocked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Unlock className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}