import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoStar, IoCreate } from "react-icons/io5";

import { Poster, Loader, Error, Section } from "@/common";
import { Casts, Videos, Genre } from "./components";
import { WatchedIcon, ReviewForm, ImageGallery } from "@/features/watchedList/components";

import { useGetShowQuery } from "@/services/TMDB";
import { selectWatchedItem } from "@/features/watchedList/slice/watchedListSlice";
import { useMotion } from "@/hooks/useMotion";
import { mainHeading, maxWidth, paragraph } from "@/styles";
import { cn } from "@/utils/helper";

const Detail = () => {
  const { category, id } = useParams();
  const [show, setShow] = useState<Boolean>(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const { fadeDown, staggerContainer } = useMotion();

  // Get watched item data
  const watchedItem = useSelector(selectWatchedItem(Number(id), category as 'movie' | 'tv'));

  const {
    data: movie,
    isLoading,
    isFetching,
    isError,
  } = useGetShowQuery({
    category: String(category),
    id: Number(id),
  });

  useEffect(() => {
    document.title =
      (movie?.title || movie?.name) && !isLoading
        ? movie.title || movie.name
        : "tMovies";

    return () => {
      document.title = "tMovies";
    };
  }, [movie?.title, isLoading, movie?.name]);

  const toggleShow = () => setShow((prev) => !prev);

  if (isLoading || isFetching) {
    return <Loader />;
  }

  if (isError) {
    return <Error error="Something went wrong!" />;
  }

  const {
    title,
    poster_path: posterPath,
    overview,
    name,
    genres,
    videos,
    credits,
  } = movie;

  const backgroundStyle = {
    backgroundImage: `linear-gradient(to top, rgba(0,0,0), rgba(0,0,0,0.98),rgba(0,0,0,0.8) ,rgba(0,0,0,0.4)),url('https://image.tmdb.org/t/p/original/${posterPath}'`,
    backgroundPosition: "top",
    backgroundSize: "cover",
  };

  return (
    <>
      <section className="w-full" style={backgroundStyle}>
        <div
          className={`${maxWidth} lg:py-36 sm:py-[136px] sm:pb-28 xs:py-28 xs:pb-12 pt-24 pb-8 flex flex-row lg:gap-12 md:gap-10 gap-8 justify-center`}
        >
          <Poster title={title} posterPath={posterPath} />
          <m.div
            variants={staggerContainer(0.2, 0.4)}
            initial="hidden"
            animate="show"
            className="text-gray-300 sm:max-w-[80vw] max-w-[90vw]  md:max-w-[520px] font-nunito flex flex-col lg:gap-5 sm:gap-4 xs:gap-[14px] gap-3 mb-8 flex-1 will-change-transform motion-reduce:transform-none"
          >
            <m.h2
              variants={fadeDown}
              className={cn(mainHeading, " md:max-w-[420px] will-change-transform motion-reduce:transform-none")}
            >
              {title || name}
            </m.h2>

            <m.ul
              variants={fadeDown}
              className="flex flex-row items-center  sm:gap-[14px] xs:gap-3 gap-[6px] flex-wrap will-change-transform motion-reduce:transform-none"
            >
              {genres.map((genre: { name: string; id: number }) => {
                return <Genre key={genre.id} name={genre.name} />;
              })}
            </m.ul>

            <m.p variants={fadeDown} className={`${paragraph} will-change-transform motion-reduce:transform-none`}>
              <span>
                {overview.length > 280
                  ? `${show ? overview : `${overview.slice(0, 280)}...`}`
                  : overview}
              </span>
              <button
                type="button"
                className={cn(
                  `font-bold ml-1 hover:underline transition-all duration-300`,
                  overview.length > 280 ? "inline-block" : "hidden"
                )}
                onClick={toggleShow}
              >
                {!show ? "show more" : "show less"}
              </button>
            </m.p>

            <Casts casts={credits?.cast || []} />

            {/* Watched Status & Review Section */}
            <m.div variants={fadeDown} className="space-y-4 will-change-transform motion-reduce:transform-none">
              <div className="flex items-center gap-4">
                <WatchedIcon 
                  id={Number(id)}
                  type={category as 'movie' | 'tv'}
                  title={title || name || ''}
                  posterPath={posterPath}
                  size="lg"
                />
                <div className="flex items-center gap-3">
                  {watchedItem ? (
                    <>
                      <span className="text-blue-400 font-medium text-sm">
                        Watched {new Date(watchedItem.dateWatched).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => setReviewFormOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                      >
                        <IoCreate size={16} />
                        {watchedItem.review ? 'Edit Review' : 'Add Review'}
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      Click the eye icon to mark as watched
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Rating & Review */}
              {watchedItem && (
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                  <h3 className="text-white font-semibold mb-3">My Review</h3>
                  
                  {watchedItem.rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gray-300 text-sm">My Rating:</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <IoStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < watchedItem.rating! ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-gray-300 text-sm ml-1">
                          ({watchedItem.rating}/5)
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {watchedItem.review ? (
                    <p className="text-gray-300 leading-relaxed">
                      "{watchedItem.review}"
                    </p>
                  ) : (
                    <p className="text-gray-400 italic text-sm">
                      No review written yet. Click "Add Review" to share your thoughts!
                    </p>
                  )}

                  {/* Memory Images */}
                  {watchedItem.images && watchedItem.images.length > 0 && (
                    <div className="mt-4">
                      <ImageGallery 
                        images={watchedItem.images}
                        maxPreviewImages={4}
                      />
                    </div>
                  )}
                </div>
              )}
            </m.div>
          </m.div>
        </div>
      </section>

      <Videos videos={videos.results} />

      <Section
        title={`Similar ${category === "movie" ? "movies" : "series"}`}
        category={String(category)}
        className={`${maxWidth}`}
        id={Number(id)}
        showSimilarShows
      />

      {/* Review Form Modal */}
      <ReviewForm
        id={Number(id)}
        type={category as 'movie' | 'tv'}
        title={title || name || ''}
        posterPath={posterPath}
        currentReview={watchedItem?.review}
        currentRating={watchedItem?.rating}
        isOpen={reviewFormOpen}
        onClose={() => setReviewFormOpen(false)}
      />
    </>
  );
};

export default Detail;
