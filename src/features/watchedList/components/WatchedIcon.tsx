import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { cn } from '@/utils/helper';
import { 
  addToWatchedList, 
  removeFromWatchedList, 
  selectIsWatched 
} from '../slice/watchedListSlice';

interface WatchedIconProps {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10'
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24
};

const WatchedIcon = ({ 
  id, 
  type, 
  title, 
  posterPath, 
  className = '', 
  size = 'md' 
}: WatchedIconProps) => {
  const dispatch = useDispatch();
  const isWatched = useSelector(selectIsWatched(id, type));

  const handleToggleWatched = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWatched) {
      dispatch(removeFromWatchedList({ id, type }));
    } else {
      dispatch(addToWatchedList({ id, type, title, posterPath }));
    }
  };

  return (
    <motion.button
      onClick={handleToggleWatched}
      className={cn(
        'flex items-center justify-center rounded-full',
        'backdrop-blur-sm border transition-all duration-200',
        'hover:scale-110 active:scale-95',
        isWatched 
          ? 'bg-blue-600/80 border-blue-500 text-white hover:bg-blue-700/80' 
          : 'bg-black/40 border-white/20 text-white hover:bg-black/60 hover:border-white/40',
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      title={isWatched ? 'Remove from watched list' : 'Add to watched list'}
      aria-label={isWatched ? 'Remove from watched list' : 'Add to watched list'}
    >
      <motion.div
        initial={false}
        animate={{ 
          scale: isWatched ? 1 : 0.8,
          opacity: isWatched ? 1 : 0.8
        }}
        transition={{ duration: 0.2 }}
      >
        {isWatched ? (
          <IoEye size={iconSizes[size]} />
        ) : (
          <IoEyeOff size={iconSizes[size]} />
        )}
      </motion.div>
    </motion.button>
  );
};

export default WatchedIcon;