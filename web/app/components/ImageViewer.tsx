"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  fileUrl: string;
  alt?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNavigation?: boolean;
  maxWidth?: string | number;
  maxHeight?: string | number;
  containerClassName?: string;
}

export default function ImageViewer({
  fileUrl,
  alt = "Imagen",
  onNext,
  onPrevious,
  hasNavigation = false,
  maxWidth = "600px",
  maxHeight = "400px",
  containerClassName,
}: ImageViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <Card className="w-full overflow-hidden bg-background/50 backdrop-blur-sm border-muted">
      <CardContent className="p-1 sm:p-2">
        <div className="relative flex flex-col items-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <div
            className={cn(
              "relative overflow-hidden transition-all duration-300 ease-in-out rounded-lg mx-auto",
              isZoomed ? "cursor-zoom-out" : "cursor-zoom-in",
              containerClassName,
            )}
            style={{
              maxHeight: maxHeight,
              maxWidth: maxWidth,
              width: "100%",
            }}
          >
            <div
              className={cn(
                "transition-transform duration-300 ease-in-out",
                isZoomed ? "scale-150 origin-center" : "scale-100",
              )}
              onClick={toggleZoom}
            >
              <Image
                src={fileUrl || "/placeholder.svg"}
                alt={alt}
                width={1200}
                height={800}
                className="object-contain w-full h-auto rounded-lg items-center"
                style={{
                  maxHeight:
                    typeof maxHeight === "number"
                      ? `${maxHeight}px`
                      : maxHeight,
                  width: "auto",
                }}
                onLoadingComplete={() => setIsLoading(false)}
                priority
              />
            </div>
          </div>

          <div className="flex items-center justify-between w-full mt-2 px-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleZoom}
                className="rounded-full"
              >
                {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => window.open(fileUrl, "_blank")}
              >
                <Download size={18} />
              </Button>
            </div>

            {hasNavigation && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={onPrevious}
                  disabled={!onPrevious}
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={onNext}
                  disabled={!onNext}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
