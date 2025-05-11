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
import type { AspectRatioKey } from "./image-editor";

interface CropToolProps {
  image: HTMLImageElement | null;
  aspect?: AspectRatioKey;
  onCropChange: (
    crop: PixelCrop,
    displayedSize: { width: number; height: number }
  ) => void;
  cropConfig?: Partial<Crop>;
  className?: string;
  initialCropWidth?: number;
  initialCropHeight?: number;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect?: number,
  preferredWidth?: number,
  preferredHeight?: number
): Crop {
  // Om preferredWidth/preferredHeight finns och aspect är undefined, prioritera dem och ignorera aspect
  if (!aspect && preferredWidth && preferredHeight) {
    let width = Math.min(preferredWidth, mediaWidth);
    let height = Math.min(preferredHeight, mediaHeight);
    width = Math.max(1, width);
    height = Math.max(1, height);
    return {
      unit: "px",
      x: Math.round((mediaWidth - width) / 2),
      y: Math.round((mediaHeight - height) / 2),
      width,
      height,
    };
  }
  // Annars, använd aspect
  let width = mediaWidth;
  let height = aspect ? Math.round(width / aspect) : mediaHeight;
  if (aspect && height > mediaHeight) {
    height = mediaHeight;
    width = Math.round(height * aspect);
  }
  width = Math.max(1, width);
  height = Math.max(1, height);
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
  initialCropWidth,
  initialCropHeight,
}: CropToolProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Initiera crop endast när bild eller initialCropWidth/Height ändras (inte varje gång aspect ändras)
  useEffect(() => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      let aspectValue = 1;
      if (aspect) {
        aspectValue =
          ASPECT_RATIOS[aspect as keyof typeof ASPECT_RATIOS]?.value || 1;
      }
      const newCrop = centerAspectCrop(
        width,
        height,
        aspect ? aspectValue : undefined,
        initialCropWidth,
        initialCropHeight
      );
      console.log("CropTool: Ny crop vid aspect- eller måttändring", {
        width,
        height,
        aspectValue: aspect ? aspectValue : undefined,
        initialCropWidth,
        initialCropHeight,
        newCrop,
      });
      setCrop(newCrop);
      setCompletedCrop({ ...newCrop, unit: "px" as const });
    }
  }, [image, initialCropWidth, initialCropHeight]);

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
        unit: "px" as const,
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
    <div className={cn("relative overflow-hidden", className)}>
      <ReactCrop
        crop={crop}
        onChange={(_, percentCrop) => setCrop(percentCrop)}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={aspect ? ASPECT_RATIOS[aspect]?.value : undefined}
        minWidth={1}
        minHeight={1}
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
            let aspectValue = 1;
            if (aspect) {
              aspectValue =
                ASPECT_RATIOS[aspect as keyof typeof ASPECT_RATIOS]?.value || 1;
            }
            const initialCrop = centerAspectCrop(
              target.width,
              target.height,
              aspect ? aspectValue : undefined,
              initialCropWidth,
              initialCropHeight
            );
            setCrop(initialCrop);
            setCompletedCrop({ ...initialCrop, unit: "px" as const });
          }}
        />
      </ReactCrop>
    </div>
  );
}
