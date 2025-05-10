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
        // Använd filen direkt lokalt
        onFileSelect(file);
        toast({
          title: "Bild vald",
          description: "Bilden är nu redo för redigering",
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
