'use client';

import React, { useEffect, useState } from 'react';
import type { Video } from '../lib/api/TMDbServices';
import { tmdbService } from '../lib/api/TMDbServices';

interface VideoPlayRecommendedProps {
  movieId: number; // ID of the movie or TV show to fetch videos for
  isTVShow?: boolean; // Flag to indicate if the ID is for a TV show
}

const VideoPlayRecommended: React.FC<VideoPlayRecommendedProps> = ({ movieId, isTVShow = false }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        let videoResults: Video[] = [];
        if (isTVShow) {
          videoResults = await tmdbService.getTVVideos(movieId);
        } else {
          videoResults = await tmdbService.getMovieVideos(movieId);
        }
        setVideos(videoResults);
        if (videoResults.length > 0) {
          setSelectedVideo(videoResults[0]);
        }
      } catch (err) {
        setError('Failed to load videos.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [movieId, isTVShow]);

  if (loading) {
    return <div>Loading video...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!selectedVideo) {
    return <div>No videos available.</div>;
  }

  const videoUrl = `https://www.youtube.com/embed/${selectedVideo.key}`;

  return (
    <div className="video-play-recommended">
      <div className="video-player-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        <iframe
          src={videoUrl}
          title={selectedVideo.name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'  }}
        />
      </div>
    </div>
  );
};

export default VideoPlayRecommended;
