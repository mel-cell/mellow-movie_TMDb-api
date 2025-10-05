import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './page/HomePage';
import MoviePage from './page/MoviePage';
import TvShowPage from './page/TvShowPage';
import DetailPage from './page/DetailPage';
import ActorsPage from './page/ActorsPage';
import MainPage from './page/MainPage';
import ProfilePage from './page/profilePage';
import FavPage from './page/favPage';
import Login from './Auth/Login/login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="movie" element={<MoviePage />} />
              <Route path="movie/:id" element={<DetailPage />} />
              <Route path="tv" element={<TvShowPage />} />
              <Route path="tv/:id" element={<DetailPage />} />
              <Route path="trending" element={<MainPage />} />
              <Route path="actors" element={<ActorsPage />} />
              <Route path="profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="favorites" element={<PrivateRoute><FavPage /></PrivateRoute>} />
            </Route>
            <Route path="login" element={<Login />} />
          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;
