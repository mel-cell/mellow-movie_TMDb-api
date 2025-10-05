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

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [refresh, setRefresh] = useState(0);  
  const [language, setLanguage] = useState<"en-US" | "id-ID">("en-US");
  // New: theme state
  const [theme, setTheme] = useState<"light" | "dark">("dark"); // default dark

  // Sticky header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update bahasa di service setiap kali berubah
  useEffect(() => {
    tmdbService.setLanguage(language);
  }, [language]);

  // Dark/Light mode effect
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme); // simpan theme
    window.dispatchEvent(new Event("themeChange")); // kasih tau halaman lain
  };


  // Realtime search
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
        setRefresh((r) => r + 1);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, language, setSearchParams]);

  const dialog = (
    <CommandDialog key={refresh} open={openSearch} onOpenChange={setOpenSearch}>
      <CommandInput
        placeholder={
          language === "id-ID"
            ? "Cari film, acara TV..."
            : "Search movies, TV shows..."
        }
        value={searchQuery}
        onValueChange={(value) => setSearchQuery(value)}
      />
      <CommandList>
        {isSearching ? (
          <CommandEmpty>
            {language === "id-ID" ? "Memuat..." : "Loading..."}
          </CommandEmpty>
        ) : searchResults.length === 0 ? (
          <CommandEmpty>
            {language === "id-ID"
              ? "Tidak ada hasil ditemukan."
              : "No results found."}
          </CommandEmpty>
        ) : (
          <CommandGroup heading={language === "id-ID" ? "Hasil" : "Results"}>
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
                    <p className="font-medium">
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
        )}
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
          <Link
            to="/"
            className="text-3xl font-bold text-red-600 hover:text-red-600"
          >
            Netflix
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6 text-white">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-100 hover:text-gray-300"
              >
                <Home className="h-5 w-5" />
                {language === "id-ID" ? "Beranda" : "Home"}
              </Link>
              <Link
                to="/movie"
                className="flex items-center gap-2 text-gray-100 hover:text-gray-300"
              >
                <Film className="h-5 w-5" />
                {language === "id-ID" ? "Film" : "Movies"}
              </Link>
              <Link
                to="/tv"
                className="flex items-center gap-2 text-gray-100 hover:text-gray-300"
              >
                <Tv className="h-5 w-5" />
                {language === "id-ID" ? "Acara TV" : "TV Shows"}
              </Link>
              <Link
                to="/trending"
                className="flex items-center gap-2 text-gray-100 hover:text-gray-300"
              >
                <TrendingUp className="h-5 w-5" />
                {language === "id-ID" ? "Trending" : "Trending"}
              </Link>
              <Link
                to="/actors"
                className="flex items-center gap-2 text-gray-100 hover:text-gray-300"
              >
                <Users className="h-5 w-5" />
                {language === "id-ID" ? "Aktor" : "Actors"}
              </Link>
            </nav>
          </div>

          {/* Right side: language + search + login */}
          <div className="flex items-center space-x-3">
            {/* 🌍 Tombol pilihan bahasa EG / ID */}
            <div className="flex border border-gray-700 rounded-full overflow-hidden text-sm">
              <button
                onClick={() => setLanguage("en-US")}
                className={`px-3 py-1 font-medium ${
                  language === "en-US"
                    ? "bg-red-600 text-white"
                    : "text-gray-300"
                } hover:bg-red-600 hover:text-white transition`}
              >
                EG
              </button>
              <button
                onClick={() => setLanguage("id-ID")}
                className={`px-3 py-1 font-medium ${
                  language === "id-ID"
                    ? "bg-red-600 text-white"
                    : "text-gray-300"
                } hover:bg-red-600 hover:text-white transition`}
              >
                ID
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme} // panggil function di atas
              className="px-3 py-1 ml-2 rounded bg-gray-700 text-white dark:bg-gray-200 dark:text-black text-sm transition"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>

            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setOpenSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Login / User */}
            {!isLoggedIn ? (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="outline" className="text-white border-white">
                    {language === "id-ID" ? "Masuk" : "Login"}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    {language === "id-ID" ? "Daftar" : "Signup"}
                  </Button>
                </Link>
              </div>
            ) : (
              <Button variant="ghost" size="icon" className="text-white">
                <User className="h-5 w-5" />
              </Button>
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

      {/* Portal untuk dialog */}
      {ReactDOM.createPortal(dialog, document.body)}
    </>
  );
};

export default Header;
