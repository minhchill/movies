import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { IoStar, IoClose, IoCheckmark, IoImages } from 'react-icons/io5';

import { updateReview, updateRating, addImageToItem, addToWatchedList } from '../slice/watchedListSlice';
import ImageUpload, { ImageFile } from './ImageUpload';
import { cn } from '@/utils/helper';

interface ReviewFormProps {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  currentReview?: string;
  currentRating?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ReviewForm = ({
  id,
  type,
  title,
  posterPath,
  currentReview = '',
  currentRating = 0,
  isOpen,
  onClose
}: ReviewFormProps) => {
  const dispatch = useDispatch();
  const [review, setReview] = useState(currentReview);
  const [rating, setRating] = useState(currentRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure item is in watched list first (needed for images)
    if (review.trim() || rating > 0 || images.length > 0) {
      dispatch(addToWatchedList({ id, type, title, posterPath }));
    }
    
    if (review.trim()) {
      dispatch(updateReview({ id, type, review: review.trim() }));
    }
    
    if (rating > 0) {
      dispatch(updateRating({ id, type, rating }));
    }

    // Save images via Redux (which also updates localStorage)
    for (const image of images) {
      dispatch(addImageToItem({ 
        id, 
        type, 
        imageFile: image.file 
      }));
    }
    
    onClose();
  };

  const handleCancel = () => {
    setReview(currentReview);
    setRating(currentRating);
    setImages([]);
    setShowImageUpload(false);
    onClose();
  };

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  Review & Rate
                </h2>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Section */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Your Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform duration-200 hover:scale-110"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <IoStar
                        size={32}
                        className={cn(
                          "transition-colors duration-200",
                          star <= (hoveredRating || rating)
                            ? "text-yellow-400"
                            : "text-gray-600"
                        )}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    {rating} out of 5 stars
                  </p>
                )}
              </div>

              {/* Review Section */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Your Review
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="What did you think about this movie? Share your thoughts..."
                  className={cn(
                    "w-full h-24 p-3 bg-gray-800 border border-gray-600 rounded-lg",
                    "text-white placeholder-gray-400 resize-none",
                    "focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                    "transition-colors duration-200"
                  )}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {review.length}/500 characters
                </p>
              </div>

              {/* Memory Images Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white font-medium flex items-center gap-2">
                    <IoImages size={18} />
                    Memory Images
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                  >
                    {showImageUpload ? 'Hide Upload' : 'Add Images'}
                  </button>
                </div>
                
                <p className="text-gray-400 text-xs mb-3">
                  Upload images to remember your watching experience (screenshots, theater photos, etc.)
                </p>

                <AnimatePresence>
                  {showImageUpload && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <ImageUpload
                        images={images}
                        onImagesChange={setImages}
                        maxImages={5}
                        maxFileSize={5}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {images.length > 0 && !showImageUpload && (
                  <div className="text-sm text-gray-300">
                    {images.length} {images.length === 1 ? 'image' : 'images'} ready to upload
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className={cn(
                    "flex-1 px-4 py-2.5 border border-gray-600 text-gray-300",
                    "rounded-lg font-medium transition-colors duration-200",
                    "hover:bg-gray-800 hover:border-gray-500"
                  )}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!review.trim() && rating === 0 && images.length === 0}
                  className={cn(
                    "flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg",
                    "font-medium transition-all duration-200 flex items-center justify-center gap-2",
                    "hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400",
                    "disabled:cursor-not-allowed"
                  )}
                >
                  <IoCheckmark size={18} />
                  Save Review {images.length > 0 && `& ${images.length} Images`}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewForm;