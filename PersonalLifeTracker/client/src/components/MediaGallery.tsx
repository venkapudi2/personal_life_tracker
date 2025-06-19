import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Image, Video, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaGalleryProps {
  media: string[];
  className?: string;
}

export default function MediaGallery({ media, className }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  if (!media || media.length === 0) {
    return null;
  }

  const renderMediaPreview = (mediaUrl: string, index: number) => {
    const isImage = mediaUrl.startsWith("data:image/");
    const isVideo = mediaUrl.startsWith("data:video/");

    return (
      <div
        key={index}
        className="relative group cursor-pointer"
        onClick={() => setSelectedMedia(mediaUrl)}
      >
        {isImage ? (
          <img
            src={mediaUrl}
            alt={`Motivation ${index + 1}`}
            className="w-full h-20 object-cover rounded-lg transition-transform group-hover:scale-105"
          />
        ) : isVideo ? (
          <div className="relative">
            <video
              src={mediaUrl}
              className="w-full h-20 object-cover rounded-lg"
              muted
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
              <Play className="w-6 h-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center">
            <Image className="w-6 h-6 text-gray-400" />
          </div>
        )}

        {/* Media type indicator */}
        <div className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded">
          {isImage ? (
            <Image className="w-3 h-3 text-white" />
          ) : isVideo ? (
            <Video className="w-3 h-3 text-white" />
          ) : null}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200" />
      </div>
    );
  };

  const renderFullMedia = (mediaUrl: string) => {
    const isImage = mediaUrl.startsWith("data:image/");
    const isVideo = mediaUrl.startsWith("data:video/");

    return (
      <div className="relative max-w-4xl max-h-[80vh]">
        {isImage ? (
          <img
            src={mediaUrl}
            alt="Motivation media"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : isVideo ? (
          <video
            src={mediaUrl}
            controls
            className="max-w-full max-h-full rounded-lg"
            autoPlay
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <Image className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <Image className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          Motivation Media ({media.length})
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {media.slice(0, 3).map((mediaUrl, index) => renderMediaPreview(mediaUrl, index))}
        
        {media.length > 3 && (
          <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors">
            +{media.length - 3} more
          </div>
        )}
      </div>

      {/* Full screen dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-5xl p-4 bg-black bg-opacity-90">
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMedia(null)}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {selectedMedia && renderFullMedia(selectedMedia)}
        </DialogContent>
      </Dialog>
    </div>
  );
}