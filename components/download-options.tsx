"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateFilename } from "@/lib/utils";

interface DownloadOptionsProps {
  onDownload: (options: DownloadOptions) => void;
  initialType: "image/jpeg" | "image/png" | "image/webp";
  cropWidth: number;
  cropHeight: number;
  image: HTMLImageElement | null;
  crop: { x: number; y: number; width: number; height: number } | null;
  disabled?: boolean;
}

export interface DownloadOptions {
  fileType: "image/jpeg" | "image/png" | "image/webp";
  quality: number;
  useOriginalFilename: boolean;
}

export function DownloadOptions({
  onDownload,
  initialType,
  cropWidth,
  cropHeight,
  image,
  crop,
  disabled = false,
}: DownloadOptionsProps) {
  const [fileType, setFileType] = useState<
    "image/jpeg" | "image/png" | "image/webp"
  >(initialType);
  const [quality, setQuality] = useState<number>(90);
  const [estimatedSize, setEstimatedSize] = useState<string>("");

  const previewFilename = generateFilename({
    width: cropWidth,
    height: cropHeight,
    fileType:
      fileType === "image/jpeg"
        ? "jpg"
        : fileType === "image/png"
        ? "png"
        : "webp",
  });

  useEffect(() => {
    if (!image || !crop || cropWidth < 1 || cropHeight < 1) {
      setEstimatedSize("");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      cropWidth,
      cropHeight
    );
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const sizeKB = blob.size / 1024;
          const sizeMB = sizeKB / 1024;
          setEstimatedSize(
            sizeMB >= 1 ? `${sizeMB.toFixed(2)} MB` : `${Math.round(sizeKB)} kB`
          );
        } else {
          setEstimatedSize("");
        }
      },
      fileType,
      fileType === "image/jpeg" || fileType === "image/webp"
        ? quality / 100
        : undefined
    );
  }, [image, crop, cropWidth, cropHeight, fileType, quality]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="file-type">Filformat</Label>
        <Select
          value={fileType}
          onValueChange={(value) =>
            setFileType(value as "image/jpeg" | "image/png" | "image/webp")
          }
          disabled={disabled}
        >
          <SelectTrigger id="file-type" className="w-full bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image/jpeg">JPG</SelectItem>
            <SelectItem value="image/png">PNG</SelectItem>
            <SelectItem value="image/webp">WebP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(fileType === "image/jpeg" || fileType === "image/webp") && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="quality">Kvalitet: {quality}%</Label>
          </div>
          <Slider
            id="quality"
            min={10}
            max={100}
            step={5}
            value={[quality]}
            onValueChange={(values) => setQuality(values[0])}
            disabled={disabled}
          />
          {estimatedSize && (
            <div className="text-xs text-muted-foreground pt-1 text-right">
              Uppskattad filstorlek: {estimatedSize}
            </div>
          )}
        </div>
      )}

      {fileType === "image/png" && estimatedSize && (
        <div className="text-xs text-muted-foreground pt-1 text-right">
          Uppskattad filstorlek: {estimatedSize}
        </div>
      )}

      <Button
        className="w-full"
        onClick={() =>
          onDownload({ fileType, quality, useOriginalFilename: false })
        }
        disabled={disabled}
      >
        <Download className="mr-2 h-4 w-4" />
        Ladda ner bild
      </Button>
    </div>
  );
}
