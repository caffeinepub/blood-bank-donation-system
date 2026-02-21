export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export type BloodType = typeof BLOOD_TYPES[number];

export const URGENCY_LEVELS = ['Critical', 'High', 'Medium'] as const;

export type UrgencyLevel = typeof URGENCY_LEVELS[number];

export const APPOINTMENT_SLOTS = ['Morning', 'Afternoon', 'Evening'] as const;

export type AppointmentSlot = typeof APPOINTMENT_SLOTS[number];

export const REQUEST_STATUS = ['Pending', 'In Progress', 'Fulfilled', 'Cancelled'] as const;

export type RequestStatus = typeof REQUEST_STATUS[number];

export const APPOINTMENT_STATUS = ['Scheduled', 'Completed', 'Cancelled'] as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[number];

export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000); // Convert from nanoseconds
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000); // Convert from nanoseconds
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeSlot(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  const hour = date.getHours();
  
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

export function getBloodTypeColor(bloodType: string): string {
  const colors: Record<string, string> = {
    'A+': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    'A-': 'bg-chart-1/20 text-chart-1 border-chart-1/30',
    'B+': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    'B-': 'bg-chart-2/20 text-chart-2 border-chart-2/30',
    'AB+': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    'AB-': 'bg-chart-3/20 text-chart-3 border-chart-3/30',
    'O+': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    'O-': 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  };
  return colors[bloodType] || 'bg-muted text-muted-foreground';
}

export function getUrgencyColor(level: string): string {
  const colors: Record<string, string> = {
    'Critical': 'bg-destructive/10 text-destructive border-destructive/20',
    'High': 'bg-warning/10 text-warning border-warning/20',
    'Medium': 'bg-secondary/10 text-secondary border-secondary/20',
  };
  return colors[level] || 'bg-muted text-muted-foreground';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Pending': 'bg-warning/10 text-warning border-warning/20',
    'In Progress': 'bg-secondary/10 text-secondary border-secondary/20',
    'Fulfilled': 'bg-success/10 text-success border-success/20',
    'Completed': 'bg-success/10 text-success border-success/20',
    'Scheduled': 'bg-secondary/10 text-secondary border-secondary/20',
    'Cancelled': 'bg-muted text-muted-foreground border-border',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}

export function truncatePrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
}

export function isEligibleAge(age: number): boolean {
  return age >= 18 && age <= 65;
}

export function isEligibleWeight(weight: number): boolean {
  return weight >= 50; // Minimum 50kg
}

export function dateToNanoTimestamp(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1000000);
}

export function getStockLevelStatus(quantity: bigint): {
  label: string;
  color: string;
} {
  const qty = Number(quantity);
  
  if (qty === 0) {
    return { label: 'Out of Stock', color: 'text-destructive' };
  } else if (qty < 10) {
    return { label: 'Critical Low', color: 'text-destructive' };
  } else if (qty < 30) {
    return { label: 'Low Stock', color: 'text-warning' };
  } else if (qty < 50) {
    return { label: 'Adequate', color: 'text-secondary' };
  } else {
    return { label: 'Good Stock', color: 'text-success' };
  }
}

export function getStockLevelPercentage(quantity: bigint, max: number = 100): number {
  const qty = Number(quantity);
  return Math.min((qty / max) * 100, 100);
}
