"use client";

import { useState, useRef, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { cn } from "@/lib/utils";
import { ASPECT_RATIOS } from "@/lib/constants";

interface CropToolProps {
  image: HTMLImageElement | null;
  aspect: string;
  onCropChange: (crop: PixelCrop) => void;
  cropConfig?: Partial<Crop>;
  className?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function CropTool({ 
  image, 
  aspect, 
  onCropChange,
  cropConfig = {},
  className
}: CropToolProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement | null>(null);

  // When the aspect ratio changes, update the crop
  useEffect(() => {
    if (imgRef.current && aspect) {
      const { width, height } = imgRef.current;
      const aspectValue = ASPECT_RATIOS[aspect]?.value || 1;
      const newCrop = centerAspectCrop(width, height, aspectValue);
      setCrop(newCrop);
      setCompletedCrop({
        ...newCrop,
        x: Math.round(newCrop.x * width / 100),
        y: Math.round(newCrop.y * height / 100),
        width: Math.round(newCrop.width * width / 100),
        height: Math.round(newCrop.height * height / 100),
        unit: 'px',
      });
    }
  }, [aspect, image]);

  useEffect(() => {
    if (completedCrop) {
      onCropChange(completedCrop);
    }
  }, [completedCrop, onCropChange]);

  if (!image) return null;

  return (
    <div className={cn("relative overflow-auto", className)}>
      <ReactCrop
        crop={crop}
        onChange={(_, percentCrop) => setCrop(percentCrop)}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={ASPECT_RATIOS[aspect]?.value}
        minWidth={50}
        minHeight={50}
        circularCrop={aspect === 'circle'}
        {...cropConfig}
      >
        <img
          ref={imgRef}
          alt="Crop preview"
          src={image.src}
          className="max-w-full"
          style={{ maxHeight: '70vh' }}
          onLoad={(e) => {
            const target = e.currentTarget;
            imgRef.current = target;
            
            // Set initial crop immediately after image loads
            const aspectValue = ASPECT_RATIOS[aspect]?.value || 1;
            const initialCrop = centerAspectCrop(
              target.width,
              target.height,
              aspectValue
            );
            setCrop(initialCrop);
            setCompletedCrop({
              ...initialCrop,
              x: Math.round(initialCrop.x * target.width / 100),
              y: Math.round(initialCrop.y * target.height / 100),
              width: Math.round(initialCrop.width * target.width / 100),
              height: Math.round(initialCrop.height * target.height / 100),
              unit: 'px',
            });
          }}
        />
      </ReactCrop>
    </div>
  );
}