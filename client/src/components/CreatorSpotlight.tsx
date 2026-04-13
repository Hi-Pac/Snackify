import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BadgeCheck, ChevronLeft, ChevronRight, Heart, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { toast as sonnerToast } from "sonner";

export default function CreatorSpotlight() {
  const { isAuthenticated } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [followedCreators, setFollowedCreators] = useState<Set<number>>(new Set());

  const { data: creators = [] } = trpc.marketplace.creators.topCreators.useQuery({
    limit: 10,
  });

  const followMutation = trpc.marketplace.creators.follow.useMutation();
  const unfollowMutation = trpc.marketplace.creators.unfollow.useMutation();

  const handleFollow = (creatorId: number) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (followedCreators.has(creatorId)) {
      unfollowMutation.mutate(
        { creatorId },
        {
          onSuccess: () => {
            const newFollowed = new Set(followedCreators);
            newFollowed.delete(creatorId);
            setFollowedCreators(newFollowed);
            sonnerToast.success("Creator unfollowed");
          },
        }
      );
    } else {
      followMutation.mutate(
        { creatorId },
        {
          onSuccess: () => {
            const newFollowed = new Set(followedCreators);
            newFollowed.add(creatorId);
            setFollowedCreators(newFollowed);
            sonnerToast.success("Creator followed");
          },
        }
      );
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? creators.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === creators.length - 1 ? 0 : prev + 1));
  };

  if (creators.length === 0) return null;

  const visibleCount =
    typeof window !== "undefined" && window.innerWidth >= 768 ? 3 : 1;
  const visibleCreators = [];
  for (let i = 0; i < visibleCount; i++) {
    visibleCreators.push(creators[(currentIndex + i) % creators.length]);
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Featured Creators
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover talented creators and explore their amazing digital products
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {visibleCreators.map((creator) => (
              <div
                key={creator.id}
                className="group rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 aspect-square">
                  {creator.avatar ? (
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircle2 className="w-16 h-16 text-primary/60" />
                    </div>
                  )}

                  {creator.creator_verified && (
                    <div className="absolute top-3 right-3 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-1">{creator.name}</h3>

                  {creator.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {creator.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-border">
                    <div className="text-center">
                      <p className="font-bold text-foreground">
                        {creator.products?.[0]?.count || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Products</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-foreground">
                        {creator.followers?.[0]?.count || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFollow(creator.id)}
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                    className={`w-full py-2 rounded-lg font-semibold transition-all ${
                      followedCreators.has(creator.id)
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {followedCreators.has(creator.id) ? (
                      <span className="flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4 fill-current" />
                        Following
                      </span>
                    ) : (
                      "Follow"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {creators.length > visibleCount && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-2">
                {creators.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentIndex ? "bg-primary w-6" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
