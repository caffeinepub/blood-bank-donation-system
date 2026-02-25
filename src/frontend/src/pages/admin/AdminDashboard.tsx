import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Droplet, 
  AlertCircle, 
  Calendar, 
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { 
  useGetStatistics,
  useGetPendingEmergencyRequests,
  useGetAppointments,
  useGetTotalDonors
} from '@/hooks/useQueries';
import { getBloodTypeColor, getUrgencyColor, getStockLevelPercentage, formatDateTime } from '@/lib/bloodbank-utils';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { data: statistics, isLoading: statsLoading } = useGetStatistics();
  const { data: pendingRequests, isLoading: requestsLoading } = useGetPendingEmergencyRequests();
  const { data: appointments, isLoading: appointmentsLoading } = useGetAppointments();
  const { data: totalDonors, isLoading: donorsLoading } = useGetTotalDonors();

  const todayAppointments = appointments?.filter(a => {
    const aptDate = new Date(Number(a.timeSlot) / 1000000);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString() && a.status === 'Scheduled';
  }) || [];

  const criticalRequests = pendingRequests?.filter(r => r.urgencyLevel === 'Critical') || [];

  return (
    <AdminLayout currentPage="home">
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-1">
                  Admin Dashboard
                </h2>
                <p className="text-muted-foreground">
                  Overview of blood bank operations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-12 w-12 text-primary" />
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
                  <p className="text-sm text-muted-foreground mb-1">Total Donors</p>
                  {donorsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-display font-bold text-foreground">
                      {Number(totalDonors || 0)}
                    </p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Donations</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-display font-bold text-foreground">
                      {Number(statistics?.totalDonations || 0)}
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
                  <p className="text-sm text-muted-foreground mb-1">Emergency Requests</p>
                  {requestsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-display font-bold text-foreground">
                      {pendingRequests?.length || 0}
                    </p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Today's Appointments</p>
                  {appointmentsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-display font-bold text-foreground">
                      {todayAppointments.length}
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

        {/* Critical Alerts */}
        {criticalRequests.length > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5 animate-pulse-glow" />
                    Critical Emergency Requests
                  </CardTitle>
                  <CardDescription>Immediate attention required</CardDescription>
                </div>
                <Button variant="destructive" size="sm" onClick={() => toast.info('Coming soon!')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalRequests.slice(0, 3).map((request) => (
                  <div
                    key={Number(request.id)}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-destructive/20"
                  >
                    <div>
                      <p className="font-medium text-sm">{request.patientName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getBloodTypeColor(request.bloodType)} variant="outline">
                          {request.bloodType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{request.location}</span>
                      </div>
                    </div>
                    <Badge className={getUrgencyColor(request.urgencyLevel)}>
                      {request.urgencyLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Blood Inventory */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className="h-5 w-5" />
                    Blood Inventory
                  </CardTitle>
                  <CardDescription>Current stock levels</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info('Coming soon!')}>
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {statistics?.bloodStockLevels.map(([bloodType, quantity]) => (
                    <div key={bloodType}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getBloodTypeColor(bloodType)} variant="outline">
                            {bloodType}
                          </Badge>
                          <span className="text-sm font-medium">
                            {Number(quantity)} units
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={getStockLevelPercentage(quantity)} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Appointments
                  </CardTitle>
                  <CardDescription>Scheduled donations for today</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info('Coming soon!')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No appointments today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 5).map((apt) => (
                    <div
                      key={Number(apt.id)}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-medium text-sm">{apt.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(apt.timeSlot)}
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
      </div>
    </AdminLayout>
  );
}
