import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/jpeg',
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas to Blob conversion failed'));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

interface FilenameOptions {
  width: number;
  height: number;
  fileType: string;
  prefix?: string;
}

export function generateFilename({
  width,
  height,
  fileType,
  prefix = 'image',
}: FilenameOptions): string {
  const date = format(new Date(), 'yyyyMMdd');
  const time = format(new Date(), 'HHmmss');
  return `${prefix}_${width}x${height}_${date}_${time}.${fileType}`;
}