import React, { useEffect, useState, Suspense, lazy } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
const Button = lazy(() => import("@/components/ui/button").then(mod => ({ default: mod.Button })));
const Badge = lazy(() => import("@/components/ui/badge").then(mod => ({ default: mod.Badge })));
const Card = lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.Card })));
const CardContent = lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent })));
import { tmdbService } from "@/lib/api/TMDbServices";
import type { Movie, TVShow, Credit } from "@/lib/api/TMDbServices";

const DetailPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const [item, setItem] = useState<Movie | TVShow | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Determine if id is movie or tv show and call appropriate API
        let data: Movie | TVShow;
        let creditsData: { cast: Credit[] };

        if (id.startsWith("tv-")) {
          const tvId = Number(id.replace("tv-", ""));
          data = await tmdbService.getTVDetails(tvId);
          creditsData = await tmdbService.getTVCredits(tvId);
        } else {
          const movieId = Number(id);
          data = await tmdbService.getMovieDetails(movieId);
          creditsData = await tmdbService.getMovieCredits(movieId);
        }

        setItem(data);
        setCredits(creditsData.cast || []);
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  if (!item) {
    return <div className="min-h-screen flex items-center justify-center text-white">Item not found</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <Suspense fallback={<div>Loading card...</div>}>
        <Card>
          <CardContent>
            <h1 className="text-3xl font-bold mb-4">{'title' in item ? item.title : item.name}</h1>
            <p>{item.overview}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {credits.map((credit) => (
                <Badge key={credit.id}>{credit.name}</Badge>
              ))}
            </div>
            <Link to={location.state?.from || "/"} className="mt-4 inline-block text-blue-400 hover:underline">
              {t("back")}
            </Link>
            <Suspense fallback={<div>Loading button...</div>}>
              <Button>{t("someAction")}</Button>
            </Suspense>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
};

export default DetailPage;
