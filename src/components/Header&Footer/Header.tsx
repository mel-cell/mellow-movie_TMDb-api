import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { 
  Home, 
  Film, 
  Tv, 
  TrendingUp, 
  Users, 
  Search, 
  User, 
  Menu, 
  X 
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Placeholder; integrate with actual auth

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 text-white py-4 px-6 transition-all duration-300 ${
      isScrolled ? 'bg-black/80 backdrop-blur-md shadow-lg' : 'bg-black/40 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-red-600">Mellow</Link>
        
        {/* Desktop Nav - Right side */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-1 hover:text-gray-300 transition-colors">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link to="/movie" className="flex items-center space-x-1 hover:text-gray-300 transition-colors">
            <Film className="h-5 w-5" />
            <span>Movies</span>
          </Link>
          <Link to="/tv" className="flex items-center space-x-1 hover:text-gray-300 transition-colors">
            <Tv className="h-5 w-5" />
            <span>TV Shows</span>
          </Link>
          <Link to="/trending" className="flex items-center space-x-1 hover:text-gray-300 transition-colors">
            <TrendingUp className="h-5 w-5" />
            <span>Trending</span>
          </Link>
          <Link to="/actors" className="flex items-center space-x-1 hover:text-gray-300 transition-colors">
            <Users className="h-5 w-5" />
            <span>Actors</span>
          </Link>
        </nav>

        {/* Right Side: Search, Auth, Profile */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
            <Search className="h-5 w-5" />
          </Button>
          
          {!isLoggedIn ? (
            <div className="flex space-x-2">
              <Link to="/login">
                <Button variant="outline" className="text-white border-white hover:bg-white/20 rounded-full px-4">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4">Signup</Button>
              </Link>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-white rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-black/90 text-white border-none">
            <div className="flex flex-col space-y-4 mt-8">
              <Link to="/" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link to="/movie" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                <Film className="h-5 w-5" />
                <span>Movies</span>
              </Link>
              <Link to="/tv" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                <Tv className="h-5 w-5" />
                <span>TV Shows</span>
              </Link>
              <Link to="/trending" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                <TrendingUp className="h-5 w-5" />
                <span>Trending</span>
              </Link>
              <Link to="/actors" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                <Users className="h-5 w-5" />
                <span>Actors</span>
              </Link>
              <div className="flex space-x-2 pt-4 border-t border-gray-700">
                {!isLoggedIn ? (
                  <>
                    <Link to="/login">
                      <Button variant="outline" className="text-white border-white rounded-full">Login</Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full">Signup</Button>
                    </Link>
                  </>
                ) : (
                  <Button variant="ghost" className="text-white rounded-full">
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
