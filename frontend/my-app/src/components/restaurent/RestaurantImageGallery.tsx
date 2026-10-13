"use client";

import Image from "next/image";

import {
  ImageIcon,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

import {
  Badge,
} from "@/components/ui/badge";

interface RestaurantImage {
  url: string;
  publicId: string;
}

interface RestaurantImageGalleryProps {
  images?: RestaurantImage[];
  className?: string;
}

export default function RestaurantImageGallery({
  images = [],
  className,
}: RestaurantImageGalleryProps) {
  if (!images.length) {
    return (
      <div
        className={cn(
          "flex h-56 items-center justify-center rounded-xl border bg-muted/30",
          className
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-10 w-10" />
          <p className="text-sm">
            No restaurant images
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("max-h-[400px] overflow-y-auto", className)}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={
              image.publicId ||
              `${image.url}-${index}`
            }
            className="group relative overflow-hidden rounded-xl border bg-muted"
          >
            <div className="relative aspect-video">
              <Image
                src={image.url}
                alt={`Restaurant image ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {index === 0 && (
              <Badge
                className="absolute left-2 top-2"
              >
                Primary
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}