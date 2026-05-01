import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Toolbar, ToolbarGroup } from "../../components/layout/Toolbar";
import { EmptyState } from "../../components/layout/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Link } from "react-router-dom";
import { Search, Heart, Users } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/apiClient";
import { followStudentClub, getStudentClubs, unfollowStudentClub } from "../../api/studentApi";

const MIN_QUERY_LENGTH = 2;
const CATEGORIES = [
  "academic",
  "technical",
  "sports",
  "volunteering",
  "cultural",
  "social",
  "other",
];

function ClubAvatar({ logoUrl, name }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="w-20 h-20 rounded-full object-cover mb-4 bg-[var(--card)]"
      />
    );
  }

  return (
    <div className="w-20 h-20 bg-[var(--card)] text-[var(--primary)] rounded-full flex items-center justify-center text-2xl font-semibold mb-4">
      {name?.charAt(0)?.toUpperCase() || "C"}
    </div>
  );
}

export default function ExploreClubs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingClubId, setUpdatingClubId] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const shouldSearch = normalizedQuery.length === 0 || normalizedQuery.length >= MIN_QUERY_LENGTH;

  const loadClubs = async () => {
    if (!shouldSearch) {
      setClubs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await getStudentClubs({
        search: normalizedQuery,
        category: categoryFilter,
      });
      setClubs(data.clubs ?? []);
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not load clubs.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, [categoryFilter, normalizedQuery, shouldSearch]);

  const filteredClubs = useMemo(() => clubs, [clubs]);

  const handleToggleFollow = async (club) => {
    setUpdatingClubId(club.id);

    try {
      const { data } = club.isFollowing
        ? await unfollowStudentClub(club.id)
        : await followStudentClub(club.id);

      setClubs((currentClubs) =>
        currentClubs.map((currentClub) =>
          currentClub.id === club.id
            ? {
                ...currentClub,
                isFollowing: !club.isFollowing,
                followers: Math.max(0, currentClub.followers + (club.isFollowing ? -1 : 1)),
              }
            : currentClub
        )
      );
      toast.success(data.message || (club.isFollowing ? "Unfollowed club" : "Following club"));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update follow status."));
    } finally {
      setUpdatingClubId("");
    }
  };

  return (
    <PageContainer>
        <PageHeader
          eyebrow="Discover"
          title="Explore Clubs"
          subtitle="Discover and follow clubs that match your interests"
        />

        <Toolbar>
          <ToolbarGroup className="flex-1">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Search clubs by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </ToolbarGroup>
          <ToolbarGroup>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ToolbarGroup>
        </Toolbar>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <span>Search rule: minimum {MIN_QUERY_LENGTH} characters.</span>
          <span>Results are filtered by name and shown alphabetically.</span>
        </div>

        {!shouldSearch && (
          <Card className="p-6 text-sm bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20">
            Enter at least {MIN_QUERY_LENGTH} characters to search by name.
          </Card>
        )}

        <Section>
          {isLoading ? (
            <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
              Loading clubs...
            </Card>
          ) : loadError ? (
            <EmptyState
              icon={<Search className="w-6 h-6" />}
              title="Could not load clubs"
              description={loadError}
              action={<Button onClick={loadClubs}>Try Again</Button>}
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <Card key={club.id} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <ClubAvatar logoUrl={club.logoUrl} name={club.clubName} />
                  <h3 className="font-semibold text-lg mb-1">{club.clubName}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{club.category}</Badge>
                    <Badge variant={club.status === "active" ? "success" : "secondary"}>{club.status}</Badge>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">{club.description}</p>
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-4">
                    <Users className="w-4 h-4" />
                    <span>{club.followers} followers</span>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Link to={`/student/club/${club.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">View Profile</Button>
                    </Link>
                    <Button
                      variant={club.isFollowing ? "secondary" : "default"}
                      className="flex-1"
                      onClick={() => handleToggleFollow(club)}
                      disabled={updatingClubId === club.id}
                    >
                      {club.isFollowing ? (
                        <>
                          <Heart className="w-4 h-4 mr-1 fill-current" />
                          Following
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          )}

          {shouldSearch && !isLoading && !loadError && filteredClubs.length === 0 && (
            <EmptyState
              icon={<Search className="w-6 h-6" />}
              title="No clubs found"
              description="Try adjusting your search or filters"
            />
          )}
        </Section>
    </PageContainer>
  );
}
