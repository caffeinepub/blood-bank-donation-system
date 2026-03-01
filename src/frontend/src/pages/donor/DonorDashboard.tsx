import DonorLayout from "@/components/layouts/DonorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetDonationHistory,
  useGetDonor,
  useGetMyAppointments,
  useGetMyNotifications,
} from "@/hooks/useQueries";
import {
  formatDateTime,
  getBloodTypeColor,
  getStatusColor,
} from "@/lib/bloodbank-utils";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Droplet,
  Heart,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function DonorDashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: donor, isLoading: donorLoading } = useGetDonor(
    identity?.getPrincipal() || null,
  );
  const { data: appointments, isLoading: appointmentsLoading } =
    useGetMyAppointments();
  const { data: donationHistory, isLoading: historyLoading } =
    useGetDonationHistory(identity?.getPrincipal() || null);
  const { data: notifications } = useGetMyNotifications();

  const upcomingAppointments =
    appointments?.filter((a) => a.status === "Scheduled") || [];
  const recentDonations = donationHistory?.slice(0, 3) || [];
  const unreadNotifications =
    notifications?.filter((n) => !n.isRead).slice(0, 3) || [];

  return (
    <DonorLayout currentPage="home">
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-1">
                  Welcome back, {profileLoading ? "..." : userProfile?.name}!
                </h2>
                <p className="text-muted-foreground">
                  Thank you for being a life-saver
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-12 w-12 text-primary fill-primary/20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Blood Type
                  </p>
                  {profileLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-display font-bold text-foreground">
                      {userProfile?.bloodGroup || "N/A"}
                    </p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Droplet className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Donations
                  </p>
                  {historyLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <p className="text-2xl font-display font-bold text-foreground">
                      {donationHistory?.length || 0}
                    </p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Eligibility
                  </p>
                  {donorLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="flex items-center gap-2">
                      {donor?.isEligible ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-success" />
                          <span className="text-lg font-semibold text-success">
                            Eligible
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-destructive" />
                          <span className="text-lg font-semibold text-destructive">
                            Ineligible
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Appointments
                  </p>
                  {appointmentsLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <p className="text-2xl font-display font-bold text-foreground">
                      {upcomingAppointments.length}
                    </p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Appointments
                  </CardTitle>
                  <CardDescription>
                    Your scheduled donation appointments
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.info("Coming soon!")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No upcoming appointments
                  </p>
                  <Button size="sm" onClick={() => toast.info("Coming soon!")}>
                    Book Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 2).map((apt) => (
                    <div
                      key={Number(apt.id)}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{apt.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(apt.timeSlot)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Donations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Recent Donations
                  </CardTitle>
                  <CardDescription>Your donation history</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.info("Coming soon!")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : recentDonations.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No donations yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDonations.map((donation) => (
                    <div
                      key={Number(donation.id)}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={getBloodTypeColor(donation.bloodType)}
                            variant="outline"
                          >
                            {donation.bloodType}
                          </Badge>
                          <span className="text-sm font-medium">
                            {Number(donation.quantity)} units
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(donation.date)} • {donation.location}
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        {unreadNotifications.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Notifications
                  </CardTitle>
                  <CardDescription>
                    {unreadNotifications.length} unread
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.info("Coming soon!")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {unreadNotifications.map((notification) => (
                  <div
                    key={Number(notification.id)}
                    className="p-3 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(notification.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DonorLayout>
  );
}
