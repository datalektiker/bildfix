"use client";

import { useState, useCallback, useEffect } from "react";
import { PixelCrop } from "react-image-crop";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/file-upload";
import { CropTool } from "@/components/crop-tool";
import { AspectRatioSelect } from "@/components/aspect-ratio-select";
import { ImagePreview } from "@/components/image-preview";
import { DownloadOptions } from "@/components/download-options";
import { canvasToBlob, generateFilename, stripExtension } from "@/lib/utils";
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO } from "@/lib/constants";
import { Info, AlertTriangle } from "lucide-react";

export type AspectRatioKey = keyof typeof ASPECT_RATIOS;

export function ImageEditor() {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<PixelCrop | null>(null);
  const [aspect, setAspect] = useState(DEFAULT_ASPECT_RATIO);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("preset");
  const [displayedSize, setDisplayedSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!uploadedFile) return;

    const objectUrl = URL.createObjectURL(uploadedFile);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      console.log("Image loaded", {
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        src: img.src,
      });
    };
    img.src = objectUrl;

    // Rensa blob-URL när komponenten unmountas eller när en ny fil laddas
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [uploadedFile, aspect]);

  useEffect(() => {
    console.log("ImageEditor state", { uploadedFile, image, crop });
  }, [uploadedFile, image, crop]);

  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    setImage(null);
    setCrop(null);
  }, []);

  const handleAspectChange = useCallback((newAspect: string) => {
    setAspect(newAspect);
  }, []);

  const handleCropChange = useCallback(
    (crop: PixelCrop, displayed: { width: number; height: number }) => {
      setCrop(crop);
      setDisplayedSize(displayed);
    },
    []
  );

  const handleDownload = useCallback(
    async (options: DownloadOptions) => {
      if (!image || !crop || !displayedSize) {
        toast({
          title: "Fel",
          description: "Välj en bild och beskär den först",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      try {
        // crop är redan i originalbildens koordinater
        let outWidth = crop.width;
        let outHeight = crop.height;
        // Om preset-format har width/height, använd dem
        const preset = ASPECT_RATIOS[aspect as AspectRatioKey] as any;
        if (
          typeof preset.width === "number" &&
          typeof preset.height === "number"
        ) {
          outWidth = preset.width;
          outHeight = preset.height;
        }

        const canvas = document.createElement("canvas");
        canvas.width = outWidth;
        canvas.height = outHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Kunde inte få canvas-kontext");
        }

        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const blob = await canvasToBlob(
          canvas,
          options.fileType,
          options.quality / 100
        );
        const fileExt =
          options.fileType === "image/jpeg"
            ? "jpg"
            : options.fileType === "image/png"
            ? "png"
            : "webp";
        const link = document.createElement("a");
        const originalName = uploadedFile?.name
          ? stripExtension(uploadedFile.name)
          : undefined;
        link.download = generateFilename({
          width: canvas.width,
          height: canvas.height,
          fileType: fileExt,
          prefix: originalName,
        });
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);

        toast({
          title: "Klart",
          description: "Bilden har laddats ner",
        });
      } catch (error) {
        console.error("Fel vid nedladdning av bild:", error);
        toast({
          title: "Fel",
          description: "Kunde inte ladda ner bilden",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [image, crop, displayedSize, activeTab, uploadedFile, toast, aspect]
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      {!uploadedFile ? (
        <Card className="w-full mb-8">
          <CardContent className="pt-6">
            <FileUpload onFileSelect={handleFileSelect} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <CropTool
                  image={image}
                  aspect={aspect as AspectRatioKey}
                  onCropChange={handleCropChange}
                  className="min-h-[300px] flex items-center justify-center"
                />
              </CardContent>
            </Card>

            {image && aspect && (
              <>
                <Alert variant="default" className="bg-primary/5 border-primary/20">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Dra för att flytta. Ändra storlek från hörn och kanter.
                  </AlertDescription>
                </Alert>

                {(() => {
                  const preset = ASPECT_RATIOS[aspect as AspectRatioKey];
                  if (preset.width && preset.height) {
                    const isTooSmall = image.naturalWidth < preset.width || image.naturalHeight < preset.height;
                    if (isTooSmall) {
                      return (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Varning: Din bild ({image.naturalWidth}×{image.naturalHeight}px) är mindre än det rekommenderade formatet ({preset.width}×{preset.height}px). 
                            Bilden kommer att skalas upp vilket kan påverka kvaliteten.
                          </AlertDescription>
                        </Alert>
                      );
                    }
                  }
                  return null;
                })()}
              </>
            )}

            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <AspectRatioSelect
                    value={aspect}
                    onChange={handleAspectChange}
                    disabled={!image || loading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ImagePreview
              image={image}
              crop={crop}
              displayedSize={displayedSize}
              className="pb-4"
            />

            <DownloadOptions
              onDownload={handleDownload}
              initialType={"image/webp"}
              cropWidth={crop?.width || 0}
              cropHeight={crop?.height || 0}
              image={image}
              crop={crop}
              disabled={!image || !crop || loading}
            />

            <Separator />

            <div className="pt-2">
              <FileUpload onFileSelect={handleFileSelect} isLoading={loading} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
