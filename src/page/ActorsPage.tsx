import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CrewMember {
  id: number;
  name: string;
  original_name: string;
  department: string;
  job: string;
  profile_path: string | null;
  credit_id: string;
  popularity: number;
}

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const MOVIE_ID = 603692; // contoh: John Wick 4, bisa diganti

const ActorsPage: React.FC = () => {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${MOVIE_ID}/credits?api_key=${API_KEY}&language=en-US`
        );
        const data = await res.json();

        if (data.crew) {
          // Urutkan: yang punya foto di atas, tanpa foto di bawah
          const withPhoto = data.crew.filter((c: CrewMember) => c.profile_path);
          const noPhoto = data.crew.filter((c: CrewMember) => !c.profile_path);
          setCrew([...withPhoto, ...noPhoto]);
        } else {
          setCrew([]);
        }
      } catch (error) {
        console.error("Error fetching crew:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrew();
  }, []);

  return (
    <section className="py-16 mb-12 bg-gradient-to-b from-black via-zinc-900 to-black min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 px-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">
         
        </h2>
        <Button
          variant="ghost"
          className="text-gray-400 hover:text-white hover:bg-red-600/10 transition-colors"
        >
          View All
        </Button>
      </div>

      {/* Crew grid */}
      <div className="px-8">
        {loading ? (
          <p className="text-gray-400 text-center text-lg animate-pulse">
            Loading crew data...
          </p>
        ) : crew.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10 place-items-center">
            {crew.map((person) => (
              <Link
                key={person.credit_id}
                to="#"
                className="group w-48 transform transition-all duration-300 hover:scale-105"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg bg-zinc-900 border border-zinc-800 group-hover:border-red-600 transition-all duration-300">
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                      alt={person.name}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/vite.svg";
                        target.classList.add("opacity-50");
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 bg-zinc-800 flex items-center justify-center rounded-2xl">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                    <p className="center text-red-500 font-semibold text-base tracking-wide">
                      {person.job}
                    </p>
                  </div>
                </div>

                {/* Text info */}
                <div className="mt-4 text-center">
                  <p className="text-white text-lg font-medium line-clamp-1">
                    {person.name}
                  </p>
                  <p className="text-gray-400 text-sm line-clamp-1">
                    {person.department}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center text-lg">
            No crew data found.
          </p>
        )}
      </div>
    </section>
  );
};

export default ActorsPage;
