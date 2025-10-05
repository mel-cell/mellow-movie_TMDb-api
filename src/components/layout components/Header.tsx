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
  Heart,
  Settings,
  LogOut,
  Sun,
  Moon,
  Languages,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { tmdbService } from "../../lib/api/TMDbServices";
import type { Movie, TVShow } from "../../lib/api/TMDbServices";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const [openSearch, setOpenSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [refresh, setRefresh] = useState(0);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔍 Realtime search dengan debounce
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const [movieResults, tvResults] = await Promise.all([
          tmdbService.searchMovies(searchQuery),
          tmdbService.searchTVShows(searchQuery),
        ]);
        const combined = [
          ...movieResults.results.slice(0, 5),
          ...tvResults.results.slice(0, 5),
        ];
        setSearchResults(combined);
        setSearchParams({ q: searchQuery });
        setRefresh((r) => r + 1); // 🔁 force rerender modal content
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, setSearchParams]);

  const dialog = (
      <div className="bg-black/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-xl w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden">
        <CommandDialog key={refresh} open={openSearch} onOpenChange={setOpenSearch}>
          <CommandInput
            placeholder={t('nav.search')}
            value={searchQuery}
            onValueChange={(value) => setSearchQuery(value)}
            className="border-gray-600 bg-gray-800/50 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20 h-12"
          />
          <CommandList className="max-h-80">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <span className="ml-2 text-gray-400">{t('nav.searching')}</span>
              </div>
            ) : searchResults.length === 0 && searchQuery.trim() ? (
              <CommandEmpty className="text-gray-400 py-8 text-center">
                {t('nav.noResults')} "{searchQuery}"
              </CommandEmpty>
            ) : (
              <CommandGroup heading="Search Results" className="text-gray-300">
                {searchResults.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      const type = "title" in item ? "movie" : "tv";
                      window.location.href = `/${type}/${item.id}`;
                      setOpenSearch(false);
                    }}
                    className="hover:bg-gray-800/50 cursor-pointer rounded-lg p-2"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative">
                        {item.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                            alt={"title" in item ? item.title : item.name}
                            className="w-12 h-16 object-cover rounded-md shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gray-700 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-400">No Image</span>
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          {"title" in item ? "M" : "TV"}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate text-sm">
                          {"title" in item ? item.title : item.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            {item.vote_average?.toFixed(1)}
                          </span>
                          <span>•</span>
                          <span>
                            {"title" in item
                              ? (item.release_date ? new Date(item.release_date).getFullYear() : "N/A")
                              : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : "N/A")
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </CommandDialog>
      </div>
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
              {t('nav.home')}
            </Link>
            <Link
              to="/movie"
              className="flex items-center gap-1 text-white hover:text-gray-300"
            >
              <Film className="h-5 w-5" />
              {t('nav.movies')}
            </Link>
            <Link
              to="/tv"
              className="flex items-center gap-1 text-white hover:text-gray-300"
            >
              <Tv className="h-5 w-5" />
              {t('nav.tvShows')}
            </Link>
            <Link
              to="/trending"
              className="flex items-center gap-1 text-white hover:text-gray-300"
            >
              <TrendingUp className="h-5 w-5" />
              {t('nav.trending')}
            </Link>
            <Link
              to="/actors"
              className="flex items-center gap-1 text-white hover:text-gray-300"
            >
              <Users className="h-5 w-5" />
              {t('nav.actors')}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white bg-transparent hover:bg-white/10">
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/90 text-white border-gray-700">
                <DropdownMenuItem onClick={() => changeLanguage('en')} className="flex items-center">
                  {t('language.english')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('id')} className="flex items-center">
                  {t('language.indonesian')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white bg-transparent ">
                    <User className="w-4 h-4 mr-2" />
                    {user?.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 text-white border-gray-700">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center text-white">
                      <Settings className="w-4 h-4 mr-2" />
                      {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="flex items-center text-white">
                      <Heart className="w-4 h-4 mr-2" />
                      {t('nav.favorites')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()} className="flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                <Link to="/">{t('nav.home')}</Link>
                <Link to="/movie">{t('nav.movies')}</Link>
                <Link to="/tv">{t('nav.tvShows')}</Link>
                <Link to="/trending">{t('nav.trending')}</Link>
                <Link to="/actors">{t('nav.actors')}</Link>
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
