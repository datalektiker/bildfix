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
