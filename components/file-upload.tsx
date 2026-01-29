"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload as UploadIcon,
  File as FileIcon,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUpload({
  onFileSelect,
  isLoading = false,
}: FileUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      let file = acceptedFiles[0];
      setUploading(true);
      try {
        // Konvertera HEIC/HEIF till JPEG
        const isHeic = file.type === "image/heic" ||
                       file.type === "image/heif" ||
                       file.name.toLowerCase().endsWith(".heic") ||
                       file.name.toLowerCase().endsWith(".heif");

        if (isHeic) {
          toast({
            title: "Konverterar HEIC...",
            description: "Vänta medan bilden konverteras",
          });

          const heic2any = (await import("heic2any")).default;
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.92,
          });

          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          const newFileName = file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
          file = new File([blob], newFileName, { type: "image/jpeg" });
        }

        onFileSelect(file);
        toast({
          title: "Bild vald",
          description: isHeic
            ? "HEIC-bilden konverterades och är redo för redigering"
            : "Bilden är nu redo för redigering",
        });
      } catch (error) {
        console.error("Fel vid filval:", error);
        toast({
          title: "Fel vid filval",
          description:
            error instanceof Error ? error.message : "Ett oväntat fel uppstod",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
    [onFileSelect, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
    },
    maxFiles: 1,
    disabled: isLoading || uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30",
        (isLoading || uploading) && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} disabled={isLoading || uploading} />

      <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
        {isDragActive ? (
          <div className="animate-bounce">
            <FileIcon className="w-10 h-10 text-primary mb-2" />
            <p className="text-lg font-medium">Släpp bilden här</p>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-full bg-primary/10">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">
                {uploading ? "Bearbetar..." : "Dra och släpp din bild här"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                eller klicka för att bläddra (PNG, JPG, WebP, HEIC)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={isLoading || uploading}
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              Välj fil
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
