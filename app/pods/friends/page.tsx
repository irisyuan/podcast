"use client";
// import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryStyles } from "@/utils/categoryStyles";
import { useState, useEffect } from "react";

// Format date to a readable string
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export default function FriendsPage() {
  // Get current user
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();

  // Temporarily bypass user check for rendering
  // if (!user) {
  //   return redirect("/sign-in");
  // }

  const [friends, setFriends] = useState<any[]>([]);
  const [userInteractions, setUserInteractions] = useState<any[]>([]);

  // Fetch friends using API route
  useEffect(() => {
    const fetchFriends = async () => {
      const response = await fetch('/api/friends/list');
      const data = await response.json();
      setFriends(data);
    };
    fetchFriends();
  }, []);

  // Fetch user interactions using API route
  useEffect(() => {
    const fetchUserInteractions = async () => {
      const response = await fetch('/api/friends/interactions');
      const data = await response.json();
      setUserInteractions(data);
    };
    fetchUserInteractions();
  }, []);
  
  // Get all podcast episode IDs from the favorites
  const episodeIds = friends?.map(friend => {
    const episode = Array.isArray(friend.podcast_episodes) 
      ? friend.podcast_episodes[0] 
      : friend.podcast_episodes;
    return episode?.id;
  }).filter(Boolean) || [];
  
  // Create a map of friend_id to user interaction for easy lookups
  const userInteractionsMap = userInteractions.reduce((map: Record<string, any>, interaction) => {
    map[interaction.friend_id] = interaction;
    return map;
  }, {});

  // Add the search logic
  const [searchResults, setSearchResults] = useState<{ id: string; first_name: string; last_name: string; }[]>([]);

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    if (query.length > 2) {
      const response = await fetch(`/api/friends/search?query=${query}`);
      const users = await response.json();
      setSearchResults(users);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 text-center px-4">
      <div className="flex justify-between items-center w-full">
        <h2 className="font-medium text-xl">Friends</h2>
        <input
          type="text"
          placeholder="Search for a friend"
          className="w-full max-w-xl p-2 border rounded-md bg-white"
          onChange={handleSearchChange}
        />
      </div>

      {friends.length > 0 ? (
          <div className="w-full mt-4 space-y-4">
          {friends.map((friend: any) => {
              // In Supabase's nested queries, the related data comes as the first item of an array
            const episode = Array.isArray(friend.podcast_episodes) 
              ? friend.podcast_episodes[0] 
              : friend.podcast_episodes;
              
              // Get user interaction if available
            const userInteraction = userInteractionsMap[friend.id];
              
              if (!episode) return null;
              
              const { emoji, color } = categoryStyles[episode.category] || { emoji: "❓", color: "#808080" };
              
              return (
              <div key={friend.id} className="border rounded-lg p-4 bg-card text-left text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </div>
                    <div className="space-y-3 w-full">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-base">{episode.title}</h3>
                          <span className="text-[10px] text-muted-foreground">
                          {formatDate(friend.created_at)}
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
        <p className="text-muted-foreground mt-4">You haven't added any friends yet.</p>
        )}
    </div>
  );
} 