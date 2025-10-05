import React, { useState, useEffect } from "react";
import { getPopularTVShows } from "../lib/api/TMDbServices";
import MediaCard from "../components/MediaCard";
import { useAuth } from "../contexts/AuthContext";
import SimplePagination from "../components/ui/SimplePagination";

import type { TVShow } from "../lib/api/TMDbServices";

const TvShowPage: React.FC = () => {
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTVShows = async () => {
      const data = await getPopularTVShows(page);
      setTvShows(data.results);
      setTotalPages(data.total_pages);
    };
    fetchTVShows();
  }, [page]);

  return (
    <div className="p-4 bg-black text-white min-h-screen w-screen">
      <div className="max-w-7xl mx-auto mt-20">

      <h1 className="text-3xl font-bold mb-4">Popular TV Shows</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tvShows.map((tvShow, index) => (
          <MediaCard
          key={tvShow.id}
          item={tvShow}
         
          />
        ))}
      </div>
      <SimplePagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        />
    </div>
  </div>
  );
};

export default TvShowPage;
