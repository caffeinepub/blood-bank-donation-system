import DonorLayout from "@/components/layouts/DonorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBookAppointment,
  useCancelAppointment,
  useGetMyAppointments,
} from "@/hooks/useQueries";
import { formatDateTime, getStatusColor } from "@/lib/bloodbank-utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Building2,
  Calendar,
  CalendarCheck,
  Clock,
  Loader2,
  MapPin,
  Moon,
  Sun,
  Sunset,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const BLOOD_BANKS = [
  "City Blood Bank",
  "Regional Blood Centre",
  "District Hospital Blood Bank",
  "Red Cross Blood Bank",
  "Government Medical College Blood Bank",
  "Private Hospital Blood Bank",
];

type TimeSlotKey = "morning" | "afternoon" | "evening";

interface TimeSlotOption {
  key: TimeSlotKey;
  label: string;
  time: string;
  hour: number;
  minute: number;
  Icon: React.ElementType;
  description: string;
}

const TIME_SLOTS: TimeSlotOption[] = [
  {
    key: "morning",
    label: "Morning",
    time: "9:00 AM",
    hour: 9,
    minute: 0,
    Icon: Sun,
    description: "Fresh start to the day",
  },
  {
    key: "afternoon",
    label: "Afternoon",
    time: "1:00 PM",
    hour: 13,
    minute: 0,
    Icon: Sunset,
    description: "Midday donation slot",
  },
  {
    key: "evening",
    label: "Evening",
    time: "5:00 PM",
    hour: 17,
    minute: 0,
    Icon: Moon,
    description: "End of the day",
  },
];

function dateTimeToNanoseconds(
  dateStr: string,
  hour: number,
  minute: number,
): bigint {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  return BigInt(d.getTime()) * 1_000_000n;
}

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const { data: appointments, isLoading: appointmentsLoading } =
    useGetMyAppointments();
  const bookMutation = useBookAppointment();
  const cancelMutation = useCancelAppointment();

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotKey | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [customLocation, setCustomLocation] = useState<string>("");
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [cancellingId, setCancellingId] = useState<bigint | null>(null);

  const locationValue = useCustomLocation
    ? customLocation.trim()
    : selectedBank;

  const handleBook = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    if (!locationValue) {
      toast.error("Please select or enter a blood bank location");
      return;
    }

    const slot = TIME_SLOTS.find((s) => s.key === selectedSlot)!;
    const timeSlot = dateTimeToNanoseconds(
      selectedDate,
      slot.hour,
      slot.minute,
    );

    try {
      await bookMutation.mutateAsync({ timeSlot, location: locationValue });
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
      toast.success("Appointment booked successfully!");
      setSelectedDate("");
      setSelectedSlot(null);
      setSelectedBank("");
      setCustomLocation("");
      setUseCustomLocation(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to book appointment. Please try again.");
    }
  };

  const handleCancel = async (id: bigint) => {
    setCancellingId(id);
    try {
      await cancelMutation.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
      toast.success("Appointment cancelled.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const scheduledAppointments =
    appointments?.filter((a) => a.status === "Scheduled") || [];
  const pastAppointments =
    appointments?.filter((a) => a.status !== "Scheduled") || [];

  const isBooking = bookMutation.isPending;
  const canSubmit =
    !!selectedDate && !!selectedSlot && !!locationValue && !isBooking;

  return (
    <DonorLayout currentPage="appointments">
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Book Appointment Online
              </h1>
              <p className="text-sm text-muted-foreground">
                Schedule your blood donation appointment at a blood bank near
                you
              </p>
            </div>
          </div>
        </motion.div>

        {/* Book New Appointment Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        >
          <Card className="border-primary/15 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                New Appointment
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1 - Date */}
              <div className="space-y-2">
                <Label
                  htmlFor="apt-date"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Choose Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="apt-date"
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 focus-visible:ring-primary/40"
                  />
                </div>
              </div>

              {/* Step 2 - Time Slot */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Choose Time Slot
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const Icon = slot.Icon;
                    const isSelected = selectedSlot === slot.key;
                    return (
                      <button
                        key={slot.key}
                        type="button"
                        onClick={() => setSelectedSlot(slot.key)}
                        className={[
                          "relative flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          isSelected
                            ? "border-primary bg-primary/8 shadow-sm"
                            : "border-border bg-card hover:border-primary/40 hover:bg-primary/4",
                        ].join(" ")}
                        aria-pressed={isSelected}
                      >
                        <div
                          className={[
                            "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p
                            className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}
                          >
                            {slot.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {slot.time}
                          </p>
                        </div>
                        {isSelected && (
                          <motion.div
                            layoutId="slot-indicator"
                            className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3 - Blood Bank */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Select Blood Bank / Donation Centre
                </Label>

                {!useCustomLocation ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {BLOOD_BANKS.map((bank) => {
                        const isSelected = selectedBank === bank;
                        return (
                          <button
                            key={bank}
                            type="button"
                            onClick={() =>
                              setSelectedBank(isSelected ? "" : bank)
                            }
                            className={[
                              "flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isSelected
                                ? "border-primary bg-primary/8 text-primary font-medium shadow-sm"
                                : "border-border bg-card hover:border-primary/40 text-foreground",
                            ].join(" ")}
                          >
                            <Building2
                              className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                            />
                            {bank}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomLocation(true);
                        setSelectedBank("");
                      }}
                      className="text-xs text-primary underline-offset-2 hover:underline"
                    >
                      Enter a different location
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="text"
                        placeholder="e.g. Apollo Hospital Blood Bank, Mumbai"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="pl-10 focus-visible:ring-primary/40"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleBook()}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomLocation(false);
                        setCustomLocation("");
                      }}
                      className="text-xs text-primary underline-offset-2 hover:underline"
                    >
                      Choose from list instead
                    </button>
                  </>
                )}
              </div>

              {/* Summary */}
              {selectedDate && selectedSlot && locationValue && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl bg-primary/5 border border-primary/15 p-4 space-y-1"
                >
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                    Appointment Summary
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date:</span>{" "}
                      <span className="font-medium text-foreground">
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>{" "}
                      <span className="font-medium text-foreground">
                        {TIME_SLOTS.find((s) => s.key === selectedSlot)?.time}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Location:</span>{" "}
                      <span className="font-medium text-foreground">
                        {locationValue}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit */}
              <div className="pt-1">
                <Button
                  onClick={handleBook}
                  disabled={!canSubmit}
                  className="w-full sm:w-auto min-w-[200px]"
                  size="lg"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      Confirm Appointment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scheduled Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-secondary" />
                Upcoming Appointments
                {scheduledAppointments.length > 0 && (
                  <Badge className="ml-1 bg-secondary/15 text-secondary border-secondary/30">
                    {scheduledAppointments.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              ) : scheduledAppointments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10"
                >
                  <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                    <CalendarCheck className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    No upcoming appointments
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use the form above to book your first slot.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="space-y-3">
                    {scheduledAppointments.map((apt, idx) => (
                      <motion.div
                        key={String(apt.id)}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{
                          duration: 0.3,
                          delay: idx * 0.06,
                          ease: "easeOut",
                        }}
                        className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border hover:border-primary/30 bg-card transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5 text-secondary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {apt.location}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(apt.timeSlot)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={getStatusColor(apt.status)}>
                            {apt.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(apt.id)}
                            disabled={cancellingId === apt.id}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                            title="Cancel appointment"
                          >
                            {cancellingId === apt.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Past Appointments */}
        {(appointmentsLoading || pastAppointments.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  Past Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastAppointments.map((apt) => (
                      <div
                        key={String(apt.id)}
                        className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-muted/30"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {apt.location}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(apt.timeSlot)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${getStatusColor(apt.status)} shrink-0`}
                        >
                          {apt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DonorLayout>
  );
}
