import DonorLayout from "@/components/layouts/DonorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSearchDonorsByBloodType,
  useSearchDonorsByLocation,
} from "@/hooks/useQueries";
import { BLOOD_TYPES, getBloodTypeColor } from "@/lib/bloodbank-utils";
import {
  CheckCircle2,
  Droplet,
  MapPin,
  Search,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type SearchMode = "bloodType" | "location";

export default function FindDonorsPage() {
  const [mode, setMode] = useState<SearchMode>("bloodType");
  const [selectedBloodType, setSelectedBloodType] = useState<string | null>(
    null,
  );
  const [locationQuery, setLocationQuery] = useState("");
  const [submittedLocation, setSubmittedLocation] = useState<string | null>(
    null,
  );

  const { data: donorsByBloodType, isLoading: loadingByBlood } =
    useSearchDonorsByBloodType(mode === "bloodType" ? selectedBloodType : null);

  const { data: donorsByLocation, isLoading: loadingByLocation } =
    useSearchDonorsByLocation(mode === "location" ? submittedLocation : null);

  const donors = mode === "bloodType" ? donorsByBloodType : donorsByLocation;
  const isLoading = mode === "bloodType" ? loadingByBlood : loadingByLocation;
  const hasSearched =
    mode === "bloodType" ? !!selectedBloodType : !!submittedLocation;

  const handleLocationSearch = () => {
    const trimmed = locationQuery.trim();
    if (trimmed) setSubmittedLocation(trimmed);
  };

  return (
    <DonorLayout currentPage="findDonors">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Find Donors
              </h1>
              <p className="text-sm text-muted-foreground">
                Search registered donors by blood type or location
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
        >
          <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setMode("bloodType")}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                mode === "bloodType"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Droplet className="h-4 w-4" />
              By Blood Type
            </button>
            <button
              type="button"
              onClick={() => setMode("location")}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                mode === "location"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <MapPin className="h-4 w-4" />
              By Location
            </button>
          </div>
        </motion.div>

        {/* Search Controls */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Card className="border-primary/15 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {mode === "bloodType" ? (
                  <>
                    <Droplet className="h-5 w-5 text-primary" />
                    Select Blood Type
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 text-primary" />
                    Search by Location
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mode === "bloodType" ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">
                    Choose a blood type to find matching donors
                  </Label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {BLOOD_TYPES.map((bt) => {
                      const isSelected = selectedBloodType === bt;
                      return (
                        <button
                          key={bt}
                          type="button"
                          onClick={() =>
                            setSelectedBloodType(isSelected ? null : bt)
                          }
                          className={[
                            "relative flex items-center justify-center h-14 rounded-xl border-2 font-display font-bold text-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-sm scale-105"
                              : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5",
                          ].join(" ")}
                          aria-pressed={isSelected}
                        >
                          {bt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label
                    htmlFor="location-search"
                    className="text-sm font-medium text-foreground"
                  >
                    Enter city or area to find nearby donors
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="location-search"
                        type="text"
                        placeholder="e.g. Mumbai, Delhi, Bangalore..."
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleLocationSearch()
                        }
                        className="pl-10 focus-visible:ring-primary/40"
                      />
                    </div>
                    <Button
                      onClick={handleLocationSearch}
                      disabled={!locationQuery.trim()}
                      className="shrink-0"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div
              key={`${mode}-${selectedBloodType}-${submittedLocation}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-secondary" />
                    Donors Found
                    {!isLoading && donors && donors.length > 0 && (
                      <Badge className="ml-1 bg-secondary/15 text-secondary border-secondary/30">
                        {donors.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : !donors || donors.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                        <Users className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        No donors found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {mode === "bloodType"
                          ? `No registered donors with blood type ${selectedBloodType} yet.`
                          : `No registered donors in "${submittedLocation}" yet.`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {donors.map((donor, idx) => (
                        <motion.div
                          key={donor.principal.toString()}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: idx * 0.05,
                            ease: "easeOut",
                          }}
                          className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border hover:border-primary/30 bg-card transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-foreground truncate">
                                {donor.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {donor.location}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Age {Number(donor.age)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {Number(donor.weight)} kg
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant="outline"
                              className={getBloodTypeColor(donor.bloodType)}
                            >
                              {donor.bloodType}
                            </Badge>
                            {donor.isEligible ? (
                              <div className="flex items-center gap-1 text-success text-xs font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                Eligible
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                                <XCircle className="h-4 w-4" />
                                Not eligible
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info card when nothing is searched */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-dashed">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                    <Search className="h-8 w-8 text-primary/60" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Search for donors
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Select a blood type above or switch to location search to
                    find registered donors in the system.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DonorLayout>
  );
}
