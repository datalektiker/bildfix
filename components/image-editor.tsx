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
import { CustomDimensions } from "@/components/custom-dimensions";
import { ImagePreview } from "@/components/image-preview";
import { DownloadOptions } from "@/components/download-options";
import { canvasToBlob, generateFilename } from "@/lib/utils";
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO } from "@/lib/constants";
import { Info } from "lucide-react";

export function ImageEditor() {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<PixelCrop | null>(null);
  const [aspect, setAspect] = useState(DEFAULT_ASPECT_RATIO);
  const [loading, setLoading] = useState(false);
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("preset");

  useEffect(() => {
    if (!uploadedFile) return;

    const img = new Image();
    img.onload = () => {
      setImage(img);

      const aspectRatio = ASPECT_RATIOS[aspect].value;
      if (img.width / img.height > aspectRatio) {
        setCustomHeight(Math.round(img.height));
        setCustomWidth(Math.round(img.height * aspectRatio));
      } else {
        setCustomWidth(Math.round(img.width));
        setCustomHeight(Math.round(img.width / aspectRatio));
      }

      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(uploadedFile);
  }, [uploadedFile, aspect]);

  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    setImage(null);
    setCrop(null);
  }, []);

  const handleAspectChange = useCallback(
    (newAspect: string) => {
      setAspect(newAspect);

      if (crop) {
        const aspectRatio = ASPECT_RATIOS[newAspect].value;
        setCustomWidth(Math.round(crop.width));
        setCustomHeight(Math.round(crop.width / aspectRatio));
      }
    },
    [crop]
  );

  const handleDimensionsChange = useCallback(
    (width: number, height: number) => {
      setCustomWidth(width);
      setCustomHeight(height);
    },
    []
  );

  const handleDownload = useCallback(
    async (options: DownloadOptionsType) => {
      if (!image || !crop) {
        toast({
          title: "Fel",
          description: "Välj en bild och beskär den först",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      try {
        // Räkna ut skalan mellan visad bild och originalbild
        const displayedWidth = image.width;
        const displayedHeight = image.height;
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;
        const scaleX = naturalWidth / displayedWidth;
        const scaleY = naturalHeight / displayedHeight;

        // Skala crop-koordinaterna
        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;
        const cropWidth = crop.width * scaleX;
        const cropHeight = crop.height * scaleY;

        const canvas = document.createElement("canvas");
        if (activeTab === "custom" && customWidth && customHeight) {
          canvas.width = customWidth;
          canvas.height = customHeight;
        } else {
          canvas.width = Math.round(cropWidth);
          canvas.height = Math.round(cropHeight);
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Kunde inte få canvas-kontext");
        }

        ctx.drawImage(
          image,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
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
        const link = document.createElement("a");
        link.download = options.useOriginalFilename
          ? uploadedFile?.name ||
            generateFilename({
              width: canvas.width,
              height: canvas.height,
              fileType: options.fileType === "image/jpeg" ? "jpg" : "png",
            })
          : generateFilename({
              width: canvas.width,
              height: canvas.height,
              fileType: options.fileType === "image/jpeg" ? "jpg" : "png",
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
    [image, crop, activeTab, customWidth, customHeight, uploadedFile, toast]
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
                  aspect={aspect}
                  onCropChange={setCrop}
                  className="min-h-[300px] flex items-center justify-center"
                />
              </CardContent>
            </Card>

            <Alert variant="default" className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Dra för att flytta. Ändra storlek från hörn och kanter.
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <Tabs
                    defaultValue="preset"
                    value={activeTab}
                    onValueChange={setActiveTab}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="preset">
                        Förinställda format
                      </TabsTrigger>
                      <TabsTrigger value="custom">Anpassad storlek</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preset" className="space-y-4 pt-4">
                      <AspectRatioSelect
                        value={aspect}
                        onChange={handleAspectChange}
                        disabled={!image || loading}
                      />
                    </TabsContent>
                    <TabsContent value="custom" className="space-y-4 pt-4">
                      <CustomDimensions
                        initialWidth={customWidth}
                        initialHeight={customHeight}
                        onDimensionsChange={handleDimensionsChange}
                        disabled={!image || loading}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ImagePreview image={image} crop={crop} className="pb-4" />

            <Separator />

            <DownloadOptions
              onDownload={handleDownload}
              initialType={
                uploadedFile?.type === "image/png" ? "image/png" : "image/jpeg"
              }
              cropWidth={
                activeTab === "custom" ? customWidth : crop?.width || 0
              }
              cropHeight={
                activeTab === "custom" ? customHeight : crop?.height || 0
              }
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
