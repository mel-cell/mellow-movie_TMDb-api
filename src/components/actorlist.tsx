import React from 'react';
import type { Credit } from '../lib/api/TMDbServices';
import { tmdbService } from '../lib/api/TMDbServices';

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
    if (prevProps.movieId !== this.props.movieId || prevProps.isTVShow !== this.props.isTVShow) {
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
      this.setState({ actors: credits.cast, loading: false });
    } catch (err) {
      this.setState({ error: 'Failed to load actors.', loading: false });
    }
  }

  render() {
    const { actors, loading, error } = this.state;

    if (loading) {
      return <div>Loading actors...</div>;
    }

    if (error) {
      return <div>{error}</div>;
    }

    if (actors.length === 0) {
      return <div>No actors found.</div>;
    }

    return (
      <div className="actor-list overflow-x-auto whitespace-nowrap py-2">
        {actors.map((actor) => (
          <div
            key={actor.id}
            className="actor-card inline-block bg-gray text-white rounded shadow p-2 m-1 cursor-pointer hover:shadow-lg transition-shadow duration-300"
            style={{ width: '200px' }}
            title={`${actor.name} as ${actor.character}`}
          >
            {actor.profile_path ? (
              <img
                src={actor.profile_path}
                alt={actor.name}
                className="w-full h-auto object-cover rounded mb-2"
              />
            ) : (
              <div className="w-full h-32 bg-gray-300 flex items-center justify-center rounded mb-2">
                No Image
              </div>
            )}
            <h3 className="text-sm font-semibold text-center truncate">{actor.name}</h3>
            <p className="text-xs text-center truncate">{actor.character}</p>
          </div>
        ))}
      </div>
    );
  }
}

export default ActorList;
