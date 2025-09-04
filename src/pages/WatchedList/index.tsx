import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoEye, IoCalendar, IoStar, IoCreate } from 'react-icons/io5';

import { selectWatchedItems } from '@/features/watchedList/slice/watchedListSlice';
import { WatchedIcon, ImageGallery } from '@/features/watchedList/components';
import ReviewForm from '@/features/watchedList/components/ReviewForm';
import { maxWidth } from '@/styles';
import { cn } from '@/utils/helper';
import Image from '@/common/Image';

const WatchedList = () => {
  const watchedItems = useSelector(selectWatchedItems);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof watchedItems[0] | null>(null);

  const handleOpenReview = (item: typeof watchedItems[0]) => {
    setSelectedItem(item);
    setReviewFormOpen(true);
  };

  const handleCloseReview = () => {
    setReviewFormOpen(false);
    setSelectedItem(null);
  };

  if (watchedItems.length === 0) {
    return (
      <div className={cn(maxWidth, "min-h-[60vh] flex flex-col items-center justify-center")}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <IoEye className="mx-auto text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">No Watched Movies Yet</h2>
          <p className="text-gray-400 mb-6">
            Start building your watched list by clicking the eye icon on any movie or show
          </p>
          <Link 
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Browse Movies
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(maxWidth, "py-8")}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Watched List</h1>
        <p className="text-gray-400">
          {watchedItems.length} {watchedItems.length === 1 ? 'movie' : 'movies'} watched
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {watchedItems.map((item) => (
          <motion.div
            key={`${item.type}-${item.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group"
          >
            <div className="relative">
              <Link
                to={`/${item.type}/${item.id}`}
                className="block relative rounded-lg overflow-hidden bg-gray-800 aspect-[2/3]"
              >
                <Image
                  src={item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : ''}
                  alt={item.title}
                  width={200}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  effect="zoomIn"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <h3 className="font-semibold text-sm mb-3 line-clamp-2">{item.title}</h3>
                    {item.rating && (
                      <div className="flex items-center justify-center gap-1 text-xs mb-3">
                        <IoStar className="text-yellow-400" />
                        <span>{item.rating}/5</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenReview(item);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1 mx-auto"
                    >
                      <IoCreate size={14} />
                      {item.review ? 'Edit Review' : 'Add Review'}
                    </button>
                  </div>
                </div>
              </Link>

              {/* Watched Icon */}
              <div className="absolute top-2 right-2">
                <WatchedIcon 
                  id={item.id}
                  type={item.type}
                  title={item.title}
                  posterPath={item.posterPath}
                  size="sm"
                />
              </div>
            </div>

            {/* Movie Info */}
            <div className="mt-3 space-y-1">
              <h3 className="text-white font-medium text-sm line-clamp-2 leading-tight">
                {item.title}
              </h3>
              
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <IoCalendar className="w-3 h-3" />
                <span>{new Date(item.dateWatched).toLocaleDateString()}</span>
              </div>

              {item.review && (
                <p className="text-xs text-gray-300 line-clamp-2 mt-1">
                  "{item.review}"
                </p>
              )}

              {item.rating && (
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <IoStar
                      key={i}
                      className={`w-3 h-3 ${
                        i < item.rating! ? 'text-yellow-400' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Image Gallery */}
              {item.images && item.images.length > 0 && (
                <div className="mt-3">
                  <ImageGallery 
                    images={item.images}
                    maxPreviewImages={2}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Review Form Modal */}
      {selectedItem && (
        <ReviewForm
          id={selectedItem.id}
          type={selectedItem.type}
          title={selectedItem.title}
          posterPath={selectedItem.posterPath}
          currentReview={selectedItem.review}
          currentRating={selectedItem.rating}
          isOpen={reviewFormOpen}
          onClose={handleCloseReview}
        />
      )}
    </div>
  );
};

export default WatchedList;