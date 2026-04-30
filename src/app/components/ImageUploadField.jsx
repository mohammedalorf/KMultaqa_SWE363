import { ImageIcon, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "../api/uploadApi";
import { getApiErrorMessage } from "../api/apiClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxImageBytes = 5 * 1024 * 1024;
const maxZoom = 3;
const minZoom = 1;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getCroppedImageFile(image, frame, offset, zoom, aspectRatio, sourceFile) {
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;
  const frameWidth = frame.clientWidth;
  const frameHeight = frame.clientHeight;
  const imageAspectRatio = naturalWidth / naturalHeight;
  const frameAspectRatio = frameWidth / frameHeight;

  const baseWidth =
    imageAspectRatio > frameAspectRatio ? frameHeight * imageAspectRatio : frameWidth;
  const baseHeight =
    imageAspectRatio > frameAspectRatio ? frameHeight : frameWidth / imageAspectRatio;
  const scaledWidth = baseWidth * zoom;
  const scaledHeight = baseHeight * zoom;
  const imageLeft = frameWidth / 2 - scaledWidth / 2 + offset.x;
  const imageTop = frameHeight / 2 - scaledHeight / 2 + offset.y;
  const sourceX = clamp((-imageLeft / scaledWidth) * naturalWidth, 0, naturalWidth);
  const sourceY = clamp((-imageTop / scaledHeight) * naturalHeight, 0, naturalHeight);
  const sourceWidth = clamp((frameWidth / scaledWidth) * naturalWidth, 1, naturalWidth - sourceX);
  const sourceHeight = clamp((frameHeight / scaledHeight) * naturalHeight, 1, naturalHeight - sourceY);
  const outputWidth = aspectRatio >= 2.5 ? 1600 : aspectRatio === 1 ? 800 : 1280;
  const outputHeight = Math.round(outputWidth / aspectRatio);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return Promise.reject(new Error("Could not crop image"));
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const outputMimeType = sourceFile.type === "image/png" ? "image/png" : "image/jpeg";
  const outputExtension = outputMimeType === "image/png" ? "png" : "jpg";
  const baseName = sourceFile.name.replace(/\.[^.]+$/, "") || "image";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not crop image"));
          return;
        }

        resolve(
          new File([blob], `${baseName}-cropped.${outputExtension}`, {
            type: outputMimeType,
          })
        );
      },
      outputMimeType,
      0.9
    );
  });
}

export function ImageUploadField({
  id,
  label,
  value,
  onChange,
  folder,
  disabled = false,
  previewClassName = "h-40",
  aspectRatio = 16 / 9,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [cropSource, setCropSource] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const imageRef = useRef(null);
  const frameRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cropSource) {
        URL.revokeObjectURL(cropSource);
      }
    };
  }, [cropSource]);

  const clampOffset = (nextOffset, nextZoom = zoom) => {
    const frame = frameRef.current;

    if (!frame || !naturalSize.width || !naturalSize.height) {
      return nextOffset;
    }

    const frameWidth = frame.clientWidth;
    const frameHeight = frame.clientHeight;
    const imageAspectRatio = naturalSize.width / naturalSize.height;
    const frameAspectRatio = frameWidth / frameHeight;
    const baseWidth =
      imageAspectRatio > frameAspectRatio ? frameHeight * imageAspectRatio : frameWidth;
    const baseHeight =
      imageAspectRatio > frameAspectRatio ? frameHeight : frameWidth / imageAspectRatio;
    const maxX = Math.max(0, (baseWidth * nextZoom - frameWidth) / 2);
    const maxY = Math.max(0, (baseHeight * nextZoom - frameHeight) / 2);

    return {
      x: clamp(nextOffset.x, -maxX, maxX),
      y: clamp(nextOffset.y, -maxY, maxY),
    };
  };

  const closeCropper = () => {
    setCropSource("");
    setSelectedFile(null);
    setNaturalSize({ width: 0, height: 0 });
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    dragRef.current = null;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!allowedImageTypes.has(file.type)) {
      toast.error("Only JPG, PNG, WebP, and GIF images are allowed.");
      return;
    }

    if (file.size > maxImageBytes) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }

    setSelectedFile(file);
    setCropSource(URL.createObjectURL(file));
    setNaturalSize({ width: 0, height: 0 });
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleImageLoad = (event) => {
    setNaturalSize({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    });
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event) => {
    if (disabled || isUploading) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offset,
    };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;

    const nextOffset = {
      x: dragRef.current.offset.x + event.clientX - dragRef.current.startX,
      y: dragRef.current.offset.y + event.clientY - dragRef.current.startY,
    };

    setOffset(clampOffset(nextOffset));
  };

  const handlePointerUp = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const handleZoomChange = (event) => {
    const nextZoom = Number(event.target.value);
    setZoom(nextZoom);
    setOffset((current) => clampOffset(current, nextZoom));
  };

  const handleCropAndUpload = async () => {
    if (!selectedFile || !imageRef.current || !frameRef.current) {
      return;
    }

    setIsUploading(true);

    try {
      const croppedFile = await getCroppedImageFile(
        imageRef.current,
        frameRef.current,
        offset,
        zoom,
        aspectRatio,
        selectedFile
      );
      const { data } = await uploadImage(croppedFile, folder);
      onChange(data.imageUrl ?? "");
      toast.success("Image uploaded.");
      closeCropper();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not upload image."));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <Input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="sr-only"
      />

      {value ? (
        <div className={`relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--accent)] ${previewClassName}`}>
          <img src={value} alt="" className="h-full w-full object-cover" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute right-2 top-2 bg-[var(--card)]/95"
            onClick={() => onChange("")}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        </div>
      ) : (
        <label
          htmlFor={disabled || isUploading ? undefined : id}
          className={`flex items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--accent)]/35 text-[var(--muted-foreground)] transition-colors ${disabled || isUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-[var(--primary)] hover:text-[var(--primary)]"} ${previewClassName}`}
          aria-label={`Upload ${label}`}
        >
          <ImageIcon className="h-8 w-8" />
        </label>
      )}

      <div className="flex items-center gap-2">
        <label
          htmlFor={disabled || isUploading ? undefined : id}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-xs)] transition-all ${disabled || isUploading ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent-foreground)]/20"}`}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {value ? "Replace Image" : "Choose Image"}
        </label>
      </div>

      {isUploading && <p className="text-sm text-[var(--muted-foreground)]">Uploading...</p>}

      <Dialog open={Boolean(cropSource)} onOpenChange={(open) => !open && closeCropper()}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>

          <div
            ref={frameRef}
            className="relative w-full touch-none cursor-grab overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--accent)] active:cursor-grabbing"
            style={{ aspectRatio: String(aspectRatio) }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {cropSource && (
              <img
                ref={imageRef}
                src={cropSource}
                alt=""
                className="absolute left-1/2 top-1/2 max-w-none select-none"
                draggable={false}
                onLoad={handleImageLoad}
                style={{
                  width:
                    naturalSize.width && naturalSize.width / naturalSize.height > aspectRatio
                      ? "auto"
                      : "100%",
                  height:
                    naturalSize.width && naturalSize.width / naturalSize.height > aspectRatio
                      ? "100%"
                      : "auto",
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                  transformOrigin: "center",
                }}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-zoom`}>Zoom</Label>
            <input
              id={`${id}-zoom`}
              type="range"
              min={minZoom}
              max={maxZoom}
              step="0.01"
              value={zoom}
              onChange={handleZoomChange}
              disabled={isUploading}
              className="w-full accent-[var(--primary)]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeCropper} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCropAndUpload} disabled={isUploading || !naturalSize.width}>
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
