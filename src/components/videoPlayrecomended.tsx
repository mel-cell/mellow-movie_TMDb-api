'use client';

import React, { useEffect, useState } from 'react';
import type { Video } from '../lib/api/TMDbServices';
import { tmdbService } from '../lib/api/TMDbServices';
import { Button } from './ui/button';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

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
        // Filter for trailers and teasers only
        const filteredVideos = videoResults.filter(video =>
          video.type === 'Trailer' || video.type === 'Teaser'
        );
        setVideos(filteredVideos);
        if (filteredVideos.length > 0) {
          setSelectedVideo(filteredVideos[0]);
        }
      } catch (err) {
        setError('Failed to load videos.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [movieId, isTVShow]);

  const nextVideo = () => {
    if (videos.length > 1) {
      const currentIndex = videos.findIndex(v => v.id === selectedVideo?.id);
      const nextIndex = (currentIndex + 1) % videos.length;
      setSelectedVideo(videos[nextIndex]);
    }
  };

  const prevVideo = () => {
    if (videos.length > 1) {
      const currentIndex = videos.findIndex(v => v.id === selectedVideo?.id);
      const prevIndex = currentIndex === 0 ? videos.length - 1 : currentIndex - 1;
      setSelectedVideo(videos[prevIndex]);
    }
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="max-w-screen-2xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-white mb-6">Videos</h2>
          <div className="aspect-video bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </section>
    );
  }

  if (error || !selectedVideo) {
    return null; // Don't show anything if no videos
  }

  const videoUrl = `https://www.youtube.com/embed/${selectedVideo.key}?rel=0`;

  return (
    <section className="py-8 bg-black">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Videos</h2>
          {videos.length > 1 && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevVideo}
                className="text-white border-gray-600 hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextVideo}
                className="text-white border-gray-600 hover:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
          <iframe
            src={videoUrl}
            title={selectedVideo.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </section>
  );
};

export default VideoPlayRecommended;
