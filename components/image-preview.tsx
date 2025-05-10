"use client";

import { useRef, useEffect } from "react";
import { PixelCrop } from "react-image-crop";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  image: HTMLImageElement | null;
  crop: PixelCrop | null;
  displayedSize?: { width: number; height: number } | null;
  className?: string;
}

export function ImagePreview({
  image,
  crop,
  displayedSize,
  className,
}: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!image || !crop || !canvasRef.current || !displayedSize) {
      return;
    }

    // Logga dimensioner och crop för felsökning
    console.log("ImagePreview:", {
      imageWidth: image.width,
      imageHeight: image.height,
      imageNaturalWidth: image.naturalWidth,
      imageNaturalHeight: image.naturalHeight,
      displayedSize,
      crop,
    });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Skala crop-koordinaterna till originalbildens koordinater
    const scaleX = image.naturalWidth / displayedSize.width;
    const scaleY = image.naturalHeight / displayedSize.height;
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    // Beräkna förhandsvisningens storlek (max 300x300 px, bibehåll förhållande)
    const maxPreviewSize = 300;
    let previewWidth = crop.width;
    let previewHeight = crop.height;
    if (crop.width > crop.height) {
      if (crop.width > maxPreviewSize) {
        previewWidth = maxPreviewSize;
        previewHeight = Math.round((crop.height / crop.width) * maxPreviewSize);
      }
    } else {
      if (crop.height > maxPreviewSize) {
        previewHeight = maxPreviewSize;
        previewWidth = Math.round((crop.width / crop.height) * maxPreviewSize);
      }
    }

    canvas.width = previewWidth;
    canvas.height = previewHeight;

    // Rita den beskurna delen nedskalat till preview-storlek
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      previewWidth,
      previewHeight
    );
  }, [image, crop, displayedSize]);

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
