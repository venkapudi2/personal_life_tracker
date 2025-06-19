import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image, Video, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

export default function MediaUpload({
  value = [],
  onChange,
  maxFiles = 5,
  acceptedTypes = ["image/*", "video/*"],
  className,
}: MediaUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: string[] = [];
    const remainingSlots = maxFiles - value.length;

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newFiles.push(result);
        
        if (newFiles.length === Math.min(files.length, remainingSlots)) {
          onChange([...value, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const getFileIcon = (dataUrl: string) => {
    if (dataUrl.startsWith("data:image/")) {
      return <Image className="w-4 h-4" />;
    } else if (dataUrl.startsWith("data:video/")) {
      return <Video className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const getFileName = (dataUrl: string, index: number) => {
    if (dataUrl.startsWith("data:image/")) {
      return `Image ${index + 1}`;
    } else if (dataUrl.startsWith("data:video/")) {
      return `Video ${index + 1}`;
    }
    return `File ${index + 1}`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-gray-300",
          value.length >= maxFiles ? "opacity-50 pointer-events-none" : "cursor-pointer hover:border-primary"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">
            {value.length >= maxFiles 
              ? `Maximum ${maxFiles} files reached` 
              : "Drop files here or click to upload"
            }
          </p>
          <p className="text-xs text-gray-500">
            Supports images and videos up to 10MB
          </p>
          <p className="text-xs text-gray-500">
            {value.length}/{maxFiles} files uploaded
          </p>
        </div>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Media</h4>
          <div className="grid grid-cols-1 gap-2">
            {value.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <span className="text-sm text-gray-900">
                    {getFileName(file, index)}
                  </span>
                  {file.startsWith("data:image/") && (
                    <Badge variant="secondary" className="text-xs">
                      Image
                    </Badge>
                  )}
                  {file.startsWith("data:video/") && (
                    <Badge variant="secondary" className="text-xs">
                      Video
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.startsWith("data:image/") && (
                    <img
                      src={file}
                      alt={`Preview ${index + 1}`}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Preview Grid */}
      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {value.map((file, index) => (
              <div key={index} className="relative group">
                {file.startsWith("data:image/") ? (
                  <img
                    src={file}
                    alt={`Motivation image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ) : file.startsWith("data:video/") ? (
                  <video
                    src={file}
                    className="w-full h-24 object-cover rounded-lg"
                    controls={false}
                    muted
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}