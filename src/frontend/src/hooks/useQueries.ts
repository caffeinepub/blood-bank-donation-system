import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  UserProfile, 
  Donor, 
  DonationRecord, 
  Appointment, 
  EmergencyRequest, 
  Notification,
  Statistics,
  UserRole
} from '@/backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Donor Queries
export function useRegisterDonor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      age: bigint;
      bloodType: string;
      location: string;
      weight: bigint;
      healthStatus: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerDonor(
        params.name,
        params.age,
        params.bloodType,
        params.location,
        params.weight,
        params.healthStatus
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['donor'] });
    },
  });
}

export function useCheckDonorEligibility() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkDonorEligibility(principal);
    },
  });
}

export function useGetDonor(principal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Donor | null>({
    queryKey: ['donor', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getDonor(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetTotalDonors() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalDonors'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTotalDonors();
    },
    enabled: !!actor && !isFetching,
  });
}

// Blood Inventory Queries
export function useGetAllBloodInventory() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, bigint]>>({
    queryKey: ['bloodInventory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllBloodInventory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBloodQuantity(bloodType: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['bloodQuantity', bloodType],
    queryFn: async () => {
      if (!actor || !bloodType) return BigInt(0);
      return actor.getBloodQuantity(bloodType);
    },
    enabled: !!actor && !isFetching && !!bloodType,
  });
}

export function useUpdateBloodQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bloodType: string; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBloodQuantity(params.bloodType, params.quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['bloodQuantity'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

export function useIncreaseBloodQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bloodType: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.increaseBloodQuantity(params.bloodType, params.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['bloodQuantity'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

export function useDecreaseBloodQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bloodType: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.decreaseBloodQuantity(params.bloodType, params.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['bloodQuantity'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

export function useAddBloodType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bloodType: string; initialQuantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBloodType(params.bloodType, params.initialQuantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// Donation Queries
export function useGetDonationHistory(donor: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<DonationRecord[]>({
    queryKey: ['donationHistory', donor?.toString()],
    queryFn: async () => {
      if (!actor || !donor) return [];
      return actor.getDonationHistory(donor);
    },
    enabled: !!actor && !isFetching && !!donor,
  });
}

export function useGetAllDonations() {
  const { actor, isFetching } = useActor();

  return useQuery<DonationRecord[]>({
    queryKey: ['allDonations'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllDonations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bloodType: string; quantity: bigint; location: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordDonation(params.bloodType, params.quantity, params.location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['allDonations'] });
      queryClient.invalidateQueries({ queryKey: ['bloodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// Appointment Queries
export function useGetMyAppointments() {
  const { actor, isFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['myAppointments'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyAppointments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAppointments() {
  const { actor, isFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['allAppointments'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAppointments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { timeSlot: bigint; location: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookAppointment(params.timeSlot, params.location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
    },
  });
}

export function useCancelAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelAppointment(appointmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
    },
  });
}

// Emergency Request Queries
export function useGetEmergencyRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<EmergencyRequest[]>({
    queryKey: ['emergencyRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getEmergencyRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingEmergencyRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<EmergencyRequest[]>({
    queryKey: ['pendingEmergencyRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPendingEmergencyRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyEmergencyRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<EmergencyRequest[]>({
    queryKey: ['myEmergencyRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyEmergencyRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitEmergencyRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      patientName: string;
      bloodType: string;
      location: string;
      urgencyLevel: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitEmergencyRequest(
        params.patientName,
        params.bloodType,
        params.location,
        params.urgencyLevel
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyRequests'] });
      queryClient.invalidateQueries({ queryKey: ['pendingEmergencyRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myEmergencyRequests'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

export function useUpdateRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { requestId: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateRequestStatus(params.requestId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyRequests'] });
      queryClient.invalidateQueries({ queryKey: ['pendingEmergencyRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myEmergencyRequests'] });
    },
  });
}

// Notification Queries
export function useGetMyNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['myNotifications'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds for new notifications
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    },
  });
}

export function useSendNotification() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { recipient: Principal; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendNotification(params.recipient, params.message);
    },
  });
}

// Search Queries
export function useSearchBloodByType(bloodType: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['searchBlood', bloodType],
    queryFn: async () => {
      if (!actor || !bloodType) return BigInt(0);
      return actor.searchBloodByType(bloodType);
    },
    enabled: !!actor && !isFetching && !!bloodType,
  });
}

export function useSearchDonorsByBloodType(bloodType: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Donor[]>({
    queryKey: ['searchDonorsByBloodType', bloodType],
    queryFn: async () => {
      if (!actor || !bloodType) return [];
      return actor.searchDonorsByBloodType(bloodType);
    },
    enabled: !!actor && !isFetching && !!bloodType,
  });
}

export function useSearchDonorsByLocation(location: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Donor[]>({
    queryKey: ['searchDonorsByLocation', location],
    queryFn: async () => {
      if (!actor || !location) return [];
      return actor.searchDonorsByLocation(location);
    },
    enabled: !!actor && !isFetching && !!location,
  });
}

// Statistics Queries
export function useGetStatistics() {
  const { actor, isFetching } = useActor();

  return useQuery<Statistics>({
    queryKey: ['statistics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStatistics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBloodStockLevels() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, bigint]>>({
    queryKey: ['bloodStockLevels'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBloodStockLevels();
    },
    enabled: !!actor && !isFetching,
  });
}
