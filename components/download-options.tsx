"use client";

import { useState } from "react";
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
  SelectValue 
} from "@/components/ui/select";
import { generateFilename } from "@/lib/utils";

interface DownloadOptionsProps {
  onDownload: (options: DownloadOptions) => void;
  initialType: "image/jpeg" | "image/png";
  cropWidth: number;
  cropHeight: number;
  disabled?: boolean;
}

export interface DownloadOptions {
  fileType: "image/jpeg" | "image/png";
  quality: number;
  useOriginalFilename: boolean;
}

export function DownloadOptions({
  onDownload,
  initialType,
  cropWidth,
  cropHeight,
  disabled = false,
}: DownloadOptionsProps) {
  const [fileType, setFileType] = useState<"image/jpeg" | "image/png">(initialType);
  const [quality, setQuality] = useState<number>(90);
  const [useOriginalFilename, setUseOriginalFilename] = useState<boolean>(false);
  
  const previewFilename = generateFilename({
    width: cropWidth,
    height: cropHeight,
    fileType: fileType === "image/jpeg" ? "jpg" : "png",
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="file-type">Filformat</Label>
        <Select
          value={fileType}
          onValueChange={(value) => setFileType(value as "image/jpeg" | "image/png")}
          disabled={disabled}
        >
          <SelectTrigger id="file-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image/jpeg">JPG</SelectItem>
            <SelectItem value="image/png">PNG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {fileType === "image/jpeg" && (
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

      <div className="flex items-center justify-between">
        <Label htmlFor="original-filename">Använd ursprungligt filnamn</Label>
        <Switch
          id="original-filename"
          checked={useOriginalFilename}
          onCheckedChange={setUseOriginalFilename}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>Utdatafilnamn</Label>
        <div className="p-2 bg-muted/50 border rounded text-sm font-mono truncate">
          {useOriginalFilename ? "ursprungligt-filnamn" : previewFilename}
        </div>
      </div>

      <Button 
        className="w-full" 
        onClick={() => onDownload({ fileType, quality, useOriginalFilename })}
        disabled={disabled}
      >
        <Download className="mr-2 h-4 w-4" />
        Ladda ner bild
      </Button>
    </div>
  );
}