"use client"
import { useState, useEffect, FormEvent } from "react"
import { Button } from "@/components/ui/button"

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<
    { id: string; first_name: string; last_name: string }[]
  >([])

  // 1) fetch your current friends
  const loadFriends = async () => {
    const res = await fetch("/api/friends")
    const { friends: list } = await res.json()
    setFriends(list)
  }
  useEffect(() => { loadFriends() }, [])

  // 2) on-submit search handler
  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/friends/search?query=${encodeURIComponent(query)}`);
      if (!res.ok) {
        console.error("Search error:", await res.text());
        return;
      }
      setSearchResults(await res.json());
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  }
  

  // 3) add a friend
  const handleAddFriend = async (friendId: string) => {
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_id: friendId }),
    })
    if (res.ok) {
      loadFriends()
      setSearchResults(sr => sr.filter(u => u.id !== friendId))
    } else {
      console.error("Add friend failed", await res.json())
    }
  }

  return (
    <div className="p-4 space-y-8">
      <h2 className="text-xl font-medium">Friends</h2>

      {/* search form */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for a friend…"
          className="btn-primary
            w-full max-w-md p-2 border rounded
            bg-white text-black
            dark:bg-white dark:text-black
          "
        />
 <button
    type="submit"
    className="px-4 py-2 btn-primary text-white rounded"
  >
    Search
  </button>      </form>





      {/* show search hits */}
      {query.length > 2 && (
  searchResults.length > 0 ? (
    <div className="space-y-2">
      {searchResults.map(u => (
        <div key={u.id} className="flex items-center justify-between p-2 border rounded">
          <span>{u.first_name} {u.last_name}</span>
          <Button size="sm" onClick={() => handleAddFriend(u.id)}>
            Add Friend
          </Button>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">No results found</p>
  )
)}


      {/* your existing friends-list UI */}
      {friends.length > 0 ? (
        <ul className="space-y-2">
          {friends.map(f => (
            <li key={f.friend_id}>
              {f.profiles.first_name} {f.profiles.last_name}
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven’t added any friends yet.</p>
      )}
    </div>
  )
}
