"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUpload({ onFileSelect, isLoading = false }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} disabled={isLoading} />
      
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
        {isDragActive ? (
          <div className="animate-bounce">
            <File className="w-10 h-10 text-primary mb-2" />
            <p className="text-lg font-medium">Släpp bilden här</p>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-full bg-primary/10">
              <Image className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Dra och släpp din bild här</p>
              <p className="text-sm text-muted-foreground mt-1">
                eller klicka för att bläddra (PNG, JPG)
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              disabled={isLoading}
            >
              <Upload className="mr-2 h-4 w-4" /> 
              Välj fil
            </Button>
          </>
        )}
      </div>
    </div>
  );
}