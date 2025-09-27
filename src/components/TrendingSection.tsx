import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Movie, TVShow, Person } from '../lib/api/TMDbServices';

interface TrendingSectionProps {
  title: string;
  items: (Movie | TVShow | Person)[];
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ title, items }) => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4">
        {items.map((item) => {
          const isMovie = 'title' in item;
          const isTVShow = 'name' in item && 'first_air_date' in item;
          const isPerson = 'known_for_department' in item;
          const imagePath = isMovie || isTVShow ? (item as Movie | TVShow).poster_path : (item as Person).profile_path;
          const titleText = isMovie ? (item as Movie).title : (item as TVShow | Person).name;
          const subtitle = isMovie || isTVShow ? `Rating: ${(item as Movie | TVShow).vote_average}/10` : (item as Person).known_for_department;

          return (
            <Card key={item.id} className="min-w-48">
              {imagePath && (
                <img src={imagePath} alt={titleText} className="w-full h-64 object-cover" />
              )}
              <CardHeader>
                <CardTitle className="text-sm">{titleText}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default TrendingSection;
