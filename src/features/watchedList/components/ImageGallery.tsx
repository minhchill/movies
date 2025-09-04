import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoChevronBack, IoChevronForward, IoImage } from 'react-icons/io5';
import { cn } from '@/utils/helper';

export interface GalleryImage {
  id: string;
  file: string; // base64 encoded
  caption?: string;
  dateAdded: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  className?: string;
  maxPreviewImages?: number;
}

const ImageGallery = ({ 
  images, 
  className = '', 
  maxPreviewImages = 4 
}: ImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(
        selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1
      );
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(
        selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  const visibleImages = images.slice(0, maxPreviewImages);
  const remainingCount = images.length - maxPreviewImages;

  return (
    <>
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <IoImage size={16} className="text-gray-400" />
          <span className="text-gray-300 text-sm font-medium">
            Memory Images ({images.length})
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {visibleImages.map((image, index) => (
            <motion.div
              key={image.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.file}
                alt={image.caption || `Memory ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-sm font-medium">View</div>
                  {image.caption && (
                    <div className="text-xs text-gray-300 mt-1 line-clamp-2 px-2">
                      {image.caption}
                    </div>
                  )}
                </div>
              </div>

              {/* Show remaining count on last image */}
              {index === maxPreviewImages - 1 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-lg font-bold">+{remainingCount}</div>
                    <div className="text-xs">more</div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Navigation Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200 z-10"
                  aria-label="Previous image"
                >
                  <IoChevronBack size={24} />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200 z-10"
                  aria-label="Next image"
                >
                  <IoChevronForward size={24} />
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200 z-10"
              aria-label="Close gallery"
            >
              <IoClose size={24} />
            </button>

            {/* Image Container */}
            <motion.div
              key={selectedImageIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[selectedImageIndex].file}
                alt={images[selectedImageIndex].caption || `Memory ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                <div className="text-white">
                  {images[selectedImageIndex].caption && (
                    <p className="font-medium mb-1">
                      {images[selectedImageIndex].caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>
                      {selectedImageIndex + 1} of {images.length}
                    </span>
                    <span>
                      {new Date(images[selectedImageIndex].dateAdded).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-md overflow-x-auto px-4">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                    }}
                    className={cn(
                      'flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all duration-200',
                      index === selectedImageIndex
                        ? 'border-blue-500 opacity-100'
                        : 'border-white/30 opacity-60 hover:opacity-80'
                    )}
                  >
                    <img
                      src={image.file}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;