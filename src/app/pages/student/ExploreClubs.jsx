import { useState } from "react";
import { StudentLayout } from "../../components/layout/StudentLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Link } from "react-router-dom";
import { Search, Settings, Calendar, Heart, Users, Rss, } from "lucide-react";
import { mockClubs } from "../../data/mockData";
import { toast } from "sonner";
const navItems = [
    { label: "Feed", path: "/student/dashboard", icon: <Rss className="w-4 h-4"/> },
    { label: "Explore Clubs", path: "/student/explore", icon: <Search className="w-4 h-4"/> },
    { label: "My Events", path: "/student/my-events", icon: <Calendar className="w-4 h-4"/> },
    { label: "Settings", path: "/student/settings", icon: <Settings className="w-4 h-4"/> },
];
export default function ExploreClubs() {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [followedClubs, setFollowedClubs] = useState(["1", "2", "3"]);
    const filteredClubs = mockClubs.filter((club) => {
        const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "all" || club.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    const handleToggleFollow = (clubId) => {
        if (followedClubs.includes(clubId)) {
            setFollowedClubs(followedClubs.filter((id) => id !== clubId));
            toast.success("Unfollowed club");
        }
        else {
            setFollowedClubs([...followedClubs, clubId]);
            toast.success("Following club");
        }
    };
    return (<StudentLayout userName="Ahmed Al-Qahtani" navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explore Clubs</h1>
          <p className="text-muted-foreground">
            Discover and follow clubs that match your interests
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
              <Input placeholder="Search clubs by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10"/>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Arts & Media">Arts & Media</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Recreation">Recreation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (<Card key={club.id} className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-4xl mb-4">
                  {club.logo}
                </div>
                <h3 className="font-semibold text-lg mb-1">{club.name}</h3>
                <Badge variant="outline" className="mb-3">
                  {club.category}
                </Badge>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {club.bio}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Users className="w-4 h-4"/>
                  <span>{club.followers} followers</span>
                </div>
                <div className="flex gap-2 w-full">
                  <Link to={`/student/club/${club.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                  <Button variant={followedClubs.includes(club.id) ? "secondary" : "default"} className="flex-1" onClick={() => handleToggleFollow(club.id)}>
                    {followedClubs.includes(club.id) ? (<>
                        <Heart className="w-4 h-4 mr-1 fill-current"/>
                        Following
                      </>) : (<>
                        <Heart className="w-4 h-4 mr-1"/>
                        Follow
                      </>)}
                  </Button>
                </div>
              </div>
            </Card>))}
        </div>

        {filteredClubs.length === 0 && (<Card className="p-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
            <h3 className="text-xl font-semibold mb-2">No clubs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </Card>)}
      </div>
    </StudentLayout>);
}