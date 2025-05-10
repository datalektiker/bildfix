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

      const file = acceptedFiles[0];
      setUploading(true);

      try {
        // Kontrollera miljövariabler
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          throw new Error("Cloudinary-konfiguration saknas");
        }

        console.log("Laddar upp till Cloudinary...");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append(
          "api_key",
          process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ""
        );

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        console.log("Upload URL:", uploadUrl);

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("Cloudinary svar:", errorData);
          throw new Error(
            `Uppladdningen misslyckades: ${response.statusText}. ${
              errorData?.error?.message || ""
            }`
          );
        }

        const data = await response.json();
        console.log("Cloudinary svar:", data);

        if (!data.secure_url) {
          throw new Error("Ingen bild-URL returnerades från Cloudinary");
        }

        // Hämta den optimerade bilden
        const imageResponse = await fetch(data.secure_url);
        if (!imageResponse.ok) {
          throw new Error("Kunde inte hämta den uppladdade bilden");
        }

        const blob = await imageResponse.blob();
        const newFile = new File([blob], file.name, { type: blob.type });

        onFileSelect(newFile);

        toast({
          title: "Bild uppladdad",
          description: "Bilden är nu redo för redigering",
        });
      } catch (error) {
        console.error("Fel vid uppladdning:", error);
        toast({
          title: "Fel vid uppladdning",
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
                {uploading ? "Laddar upp..." : "Dra och släpp din bild här"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                eller klicka för att bläddra (PNG, JPG, WebP)
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
