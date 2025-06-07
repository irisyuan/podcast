import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryStyles } from "@/utils/categoryStyles";

// Format date to a readable string
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export default async function FavoritesPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch favorite podcast episodes with join to get episode details
  const { data: favorites, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      podcast_episodes(
        id,
        title,
        description,
        category,
        date
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
  }
  
  // Get all podcast episode IDs from the favorites
  const episodeIds = favorites?.map(favorite => {
    const episode = Array.isArray(favorite.podcast_episodes) 
      ? favorite.podcast_episodes[0] 
      : favorite.podcast_episodes;
    return episode?.id;
  }).filter(Boolean) || [];
  
  // Fetch all user interactions for these podcast episodes
  const { data: userInteractions } = await supabase
    .from('users_interactions')
    .select('*')
    .eq('user_id', user.id)
    .in('episode_id', episodeIds);
  
  // Create a map of episode_id to user interaction for easy lookups
  const userInteractionsMap = (userInteractions || []).reduce((map: Record<string, any>, interaction) => {
    map[interaction.episode_id] = interaction;
    return map;
  }, {});

  return (
    <div className="flex-1 w-full flex flex-col gap-8 text-center px-4">
      <div className="flex flex-col gap-4 items-center">
        <h2 className="font-medium text-xl">Friends</h2>
        <Button asChild variant="outline" size="sm" className="text-sm">
          <Link href="/pods">Back to Friends</Link>
        </Button>

        {favorites && favorites.length > 0 ? (
          <div className="w-full mt-4 space-y-4">
            {favorites.map((favorite: any) => {
              // In Supabase's nested queries, the related data comes as the first item of an array
              const episode = Array.isArray(favorite.podcast_episodes) 
                ? favorite.podcast_episodes[0] 
                : favorite.podcast_episodes;
              
              // Get user interaction if available
              const userInteraction = userInteractionsMap[episode?.id];
              
              if (!episode) return null;
              
              const { emoji, color } = categoryStyles[episode.category] || { emoji: "❓", color: "#808080" };
              
              return (
                <div key={favorite.id} className="border rounded-lg p-4 bg-card text-left text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </div>
                    <div className="space-y-3 w-full">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-base">{episode.title}</h3>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(favorite.created_at)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 items-center mt-1">
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ 
                              backgroundColor: `${color}20`,
                              borderColor: color
                            }}
                          >
                            {emoji} {episode.category}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-full">Date: {episode.date}</span>
                          {userInteraction && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${userInteraction.is_liked ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                              {userInteraction.is_liked ? 'Liked' : 'Unliked'}
                            </span>
                          )}
                          {!userInteraction && (
                            <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-700 rounded-full">
                              Not Interacted
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {episode.description.split('\n').map((line: string, lineIndex: number) => {
                          // Add classes for styling based on line type
                          let className = "p-2 border rounded-md text-sm text-center";
                          
                          if (line.startsWith('*')) {
                            className += " bg-green-500/10 border-green-500";
                          } else if (line.startsWith('-')) {
                            className += " bg-red-500/10 border-red-500";
                          }
                          
                          return (
                            <div
                              key={lineIndex}
                              className={className}
                            >
                              {line}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full text-center p-8 border rounded-lg text-sm">
            <p className="text-muted-foreground">Your friends haven't shared any podcasts yet.</p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/pods">Go Find Some Podcasts</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 