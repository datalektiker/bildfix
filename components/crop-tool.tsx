"use client";

import { useState, useRef, useEffect } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { cn } from "@/lib/utils";
import { ASPECT_RATIOS } from "@/lib/constants";

interface CropToolProps {
  image: HTMLImageElement | null;
  aspect: string;
  onCropChange: (
    crop: PixelCrop,
    displayedSize: { width: number; height: number }
  ) => void;
  cropConfig?: Partial<Crop>;
  className?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  let width = mediaWidth;
  let height = Math.round(width / aspect);

  // Säkerställ att vi inte överskrider bildens höjd
  if (height > mediaHeight) {
    height = mediaHeight;
    width = Math.round(height * aspect);
  }

  // Säkerställ att vi inte får för små värden
  if (width < 50 || height < 50) {
    width = Math.max(50, width);
    height = Math.max(50, height);
  }

  return {
    unit: "px",
    x: Math.round((mediaWidth - width) / 2),
    y: Math.round((mediaHeight - height) / 2),
    width,
    height,
  };
}

export function CropTool({
  image,
  aspect,
  onCropChange,
  cropConfig = {},
  className,
}: CropToolProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement | null>(null);

  // When the aspect ratio changes, update the crop
  useEffect(() => {
    if (imgRef.current && aspect) {
      const { width, height } = imgRef.current;
      const aspectValue =
        ASPECT_RATIOS[aspect as keyof typeof ASPECT_RATIOS]?.value || 1;
      const newCrop = centerAspectCrop(width, height, aspectValue);
      console.log("CropTool: Ny crop vid aspect-ändring", {
        width,
        height,
        aspectValue,
        newCrop,
      });
      setCrop(newCrop);
      setCompletedCrop(newCrop);
    }
  }, [aspect, image]);

  useEffect(() => {
    if (completedCrop && imgRef.current && image) {
      // Skala crop från DOM till originalbild
      const domWidth = imgRef.current.width;
      const domHeight = imgRef.current.height;
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;

      const scaleX = naturalWidth / domWidth;
      const scaleY = naturalHeight / domHeight;

      const scaledCrop = {
        ...completedCrop,
        x: Math.round(completedCrop.x * scaleX),
        y: Math.round(completedCrop.y * scaleY),
        width: Math.round(completedCrop.width * scaleX),
        height: Math.round(completedCrop.height * scaleY),
        unit: "px",
      };

      console.log("CropTool: Skickar SKALADE crop till parent", {
        completedCrop,
        scaledCrop,
        domSize: { domWidth, domHeight },
        naturalSize: { naturalWidth, naturalHeight },
      });

      onCropChange(scaledCrop, {
        width: naturalWidth,
        height: naturalHeight,
      });
    }
  }, [completedCrop, onCropChange, image]);

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
        circularCrop={aspect === "circle"}
        {...cropConfig}
      >
        <img
          ref={imgRef}
          alt="Crop preview"
          src={image.src}
          className="max-w-full"
          style={{ maxHeight: "70vh" }}
          onLoad={(e) => {
            const target = e.currentTarget;
            imgRef.current = target;
            const aspectValue =
              ASPECT_RATIOS[aspect as keyof typeof ASPECT_RATIOS]?.value || 1;
            const initialCrop = centerAspectCrop(
              target.width,
              target.height,
              aspectValue
            );
            setCrop(initialCrop);
            setCompletedCrop(initialCrop);
          }}
        />
      </ReactCrop>
    </div>
  );
}
