"use client";

import { useRef, useEffect } from "react";
import { PixelCrop } from "react-image-crop";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  image: HTMLImageElement | null;
  crop: PixelCrop | null;
  className?: string;
}

export function ImagePreview({ image, crop, className }: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!image || !crop || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    // Använd crop-koordinaterna direkt
    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
  }, [image, crop]);

  if (!image || !crop) {
    return (
      <div
        className={cn(
          "flex items-center justify-center min-h-[200px] bg-muted/30 rounded-lg",
          className
        )}
      >
        <p className="text-muted-foreground">Förhandsgranskning visas här</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Label className="mb-2 block">Förhandsgranskning</Label>
      <Card>
        <CardContent className="p-4 flex justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[300px] object-contain"
          />
        </CardContent>
      </Card>

      <div className="mt-2 text-xs text-muted-foreground text-center">
        {crop.width} × {crop.height} pixlar
      </div>
    </div>
  );
}
