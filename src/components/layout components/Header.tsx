import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ReactDOM from "react-dom";
import { Button } from "../ui/button";
import {
  Home,
  Film,
  Tv,
  TrendingUp,
  Users,
  Search,
  User,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { tmdbService } from "../../lib/api/TMDbServices";
import type { Movie, TVShow } from "../../lib/api/TMDbServices";
import { useAuth } from "../../contexts/AuthContext";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const [openSearch, setOpenSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [refresh, setRefresh] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const [movieResults, tvResults] = await Promise.all([
        tmdbService.searchMovies(query),
        tmdbService.searchTVShows(query),
      ]);
      setSearchResults([
        ...movieResults.results.slice(0, 5),
        ...tvResults.results.slice(0, 5),
      ]);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const dialog = (
    <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
      <CommandInput
        placeholder="Search movies, TV shows..."
        value={searchQuery}
        onValueChange={(value) => {
          setSearchQuery(value);
          handleSearch(value);
        }}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Results">
          {searchResults.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => {
                const type = "title" in item ? "movie" : "tv";
                window.location.href = `/${type}/${item.id}`;
                setOpenSearch(false);
              }}
            >
              <div className="flex items-center gap-2">
                {item.poster_path && (
                  <img
                    src={item.poster_path}
                    alt={"title" in item ? item.title : item.name}
                    className="w-8 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium text-white">
                    {"title" in item ? item.title : item.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {"title" in item ? "Movie" : "TV Show"} •{" "}
                    {item.vote_average?.toFixed(1)} ⭐
                  </p>
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 text-white py-4 px-6 transition-all duration-300 ${
          isScrolled
            ? "bg-black/80 backdrop-blur-md shadow-lg"
            : "bg-black/40 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold text-red-600">
            Mellow
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center gap-1 text-white hover:text-gray-300"
            >
              <Home className="h-5 w-5" />
              Home
            </Link>
            <Link
              to="/movie"
              className="flex items-center gap-1 text-white hover:text-gray-300"
            >
              <Film className="h-5 w-5" />
              Movies
            </Link>
            <Link
              to="/tv"
              className="flex items-center gap-1 text-white hover:text-gray-300"
            >
              <Tv className="h-5 w-5" />
              TV Shows
            </Link>
            <Link
              to="/trending"
              className="flex items-center gap-1 text-white hover:text-gray-300"
            >
              <TrendingUp className="h-5 w-5" />
              Trending
            </Link>
            <Link
              to="/actors"
              className="flex items-center gap-1 text-white hover:text-gray-300"
            >
              <Users className="h-5 w-5" />
              Actors
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white bg-transparent hover:bg-white/10"
              onClick={() => setOpenSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            {!isLoggedIn ? (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="outline" className="text-white border-white">
                    Login
                  </Button>
                </Link>
                <Link to="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Signup
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <span className="text-white font-semibold">{user?.username}</span>
                <Button
                  variant="outline"
                  className="text-white"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-black/90 text-white border-none"
            >
              <div className="flex flex-col space-y-4 mt-8">
                <Link to="/">Home</Link>
                <Link to="/movie">Movies</Link>
                <Link to="/tv">TV Shows</Link>
                <Link to="/trending">Trending</Link>
                <Link to="/actors">Actors</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Render search dialog */}
      {ReactDOM.createPortal(dialog, document.body)}
    </>
  );
};

export default Header;
