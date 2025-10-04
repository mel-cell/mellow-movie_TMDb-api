import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './page/HomePage';
import MoviePage from './page/MoviePage';
import TvShowPage from './page/TvShowPage';
import DetailPage from './page/DetailPage';
import ActorsPage from './page/ActorsPage';
import SettingPage from './page/SettingPage';
import MainPage from './page/MainPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="movie" element={<MoviePage />} />
          <Route path="movie/:id" element={<DetailPage />} />
          <Route path="tv" element={<TvShowPage />} />
          <Route path="tv/:id" element={<DetailPage />} />
          <Route path="trending" element={<MainPage />} /> {/* Reuse Home for trending or create separate */}
          <Route path="actors" element={<ActorsPage />} />
          <Route path="profile" element={<SettingPage />} /> {/* Assuming profile is in settings */}
          <Route path="login" element={<SettingPage />} /> {/* Placeholder for auth pages */}
          <Route path="signup" element={<SettingPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
