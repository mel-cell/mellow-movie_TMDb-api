import React from "react";
import type { Credit } from "../lib/api/TMDbServices";
import { tmdbService } from "../lib/api/TMDbServices";

interface ActorListProps {
  movieId: number; // ID of the movie or TV show to fetch actors for
  isTVShow?: boolean; // Flag to indicate if the ID is for a TV show
}

interface ActorListState {
  actors: Credit[];
  loading: boolean;
  error: string | null;
}

class ActorList extends React.Component<ActorListProps, ActorListState> {
  constructor(props: ActorListProps) {
    super(props);
    this.state = {
      actors: [],
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchActors();
  }

  componentDidUpdate(prevProps: ActorListProps) {
    if (
      prevProps.movieId !== this.props.movieId ||
      prevProps.isTVShow !== this.props.isTVShow
    ) {
      this.fetchActors();
    }
  }

  async fetchActors() {
    this.setState({ loading: true, error: null });
    try {
      let credits;
      if (this.props.isTVShow) {
        credits = await tmdbService.getTVCredits(this.props.movieId);
      } else {
        credits = await tmdbService.getMovieCredits(this.props.movieId);
      }
      this.setState({ actors: credits.cast.slice(0, 10), loading: false }); // Limit to 10 actors
    } catch (err) {
      this.setState({ error: "Failed to load actors.", loading: false });
    }
  }

  render() {
    const { actors, loading, error } = this.state;

    if (loading) {
      return (
        <section className="py-8">
          <div className="max-w-screen-2xl mx-auto px-4">
            <h2 className="text-2xl font-semibold text-white mb-6">Cast</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32">
                  <div className="w-32 h-48 bg-gray-700 rounded-lg animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (error || actors.length === 0) {
      return null; // Don't show anything if no actors
    }

    return (
      <section className="py-8 bg-black">
        <div className="max-w-screen-2xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-white mb-6">Cast</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {actors.map((actor) => (
              <div
                key={actor.id}
                className="flex-shrink-0 w-32 group cursor-pointer"
                title={`${actor.name} as ${actor.character}`}
              >
                <div className="relative overflow-hidden rounded-lg mb-3 transition-transform duration-300 group-hover:scale-105">
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${actor.profile_path}`}
                      alt={actor.name}
                      className="w-32 h-48 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-32 h-48 bg-gray-700 flex items-center justify-center rounded-lg">
                      <span className="text-gray-400 text-sm text-center px-2">
                        No Image
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                </div>
                <h3 className="text-white text-sm font-semibold truncate mb-1">
                  {actor.name}
                </h3>
                <p className="text-muted-foreground text-xs truncate">
                  {actor.character}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
}

export default ActorList;
