import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Donor {
    age: bigint;
    weight: bigint;
    principal: Principal;
    bloodType: string;
    isEligible: boolean;
    name: string;
    healthStatus: string;
    location: string;
}
export type Time = bigint;
export interface Statistics {
    bloodStockLevels: Array<[string, bigint]>;
    totalDonations: bigint;
    emergencyRequests: bigint;
    totalDonors: bigint;
}
export interface EmergencyRequest {
    id: bigint;
    status: string;
    urgencyLevel: string;
    requester: Principal;
    bloodType: string;
    patientName: string;
    requestDate: Time;
    location: string;
}
export interface Notification {
    id: bigint;
    recipient: Principal;
    isRead: boolean;
    message: string;
    timestamp: Time;
}
export interface DonationRecord {
    id: bigint;
    bloodType: string;
    date: Time;
    quantity: bigint;
    donor: Principal;
    location: string;
}
export interface Appointment {
    id: bigint;
    status: string;
    donor: Principal;
    location: string;
    timeSlot: Time;
}
export interface UserProfile {
    age: bigint;
    weight?: bigint;
    contact: string;
    name: string;
    role: string;
    healthStatus?: string;
    bloodGroup: string;
    location: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBloodType(bloodType: string, initialQuantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(timeSlot: Time, location: string): Promise<bigint>;
    cancelAppointment(appointmentId: bigint): Promise<void>;
    checkDonorEligibility(principal: Principal): Promise<boolean>;
    decreaseBloodQuantity(bloodType: string, amount: bigint): Promise<void>;
    getAllBloodInventory(): Promise<Array<[string, bigint]>>;
    getAllDonations(): Promise<Array<DonationRecord>>;
    getAppointments(): Promise<Array<Appointment>>;
    getBloodQuantity(bloodType: string): Promise<bigint>;
    getBloodStockLevels(): Promise<Array<[string, bigint]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDonationHistory(donor: Principal): Promise<Array<DonationRecord>>;
    getDonor(principal: Principal): Promise<Donor>;
    getEmergencyRequestCount(): Promise<bigint>;
    getEmergencyRequests(): Promise<Array<EmergencyRequest>>;
    getMyAppointments(): Promise<Array<Appointment>>;
    getMyEmergencyRequests(): Promise<Array<EmergencyRequest>>;
    getMyNotifications(): Promise<Array<Notification>>;
    getPendingEmergencyRequests(): Promise<Array<EmergencyRequest>>;
    getStatistics(): Promise<Statistics>;
    getTotalDonors(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    increaseBloodQuantity(bloodType: string, amount: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationAsRead(notificationId: bigint): Promise<void>;
    recordDonation(bloodType: string, quantity: bigint, location: string): Promise<bigint>;
    registerDonor(name: string, age: bigint, bloodType: string, location: string, weight: bigint, healthStatus: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchBloodByType(bloodType: string): Promise<bigint>;
    searchDonorsByBloodType(bloodType: string): Promise<Array<Donor>>;
    searchDonorsByLocation(location: string): Promise<Array<Donor>>;
    sendNotification(recipient: Principal, message: string): Promise<void>;
    submitEmergencyRequest(patientName: string, bloodType: string, location: string, urgencyLevel: string): Promise<bigint>;
    updateBloodQuantity(bloodType: string, quantity: bigint): Promise<void>;
    updateRequestStatus(requestId: bigint, status: string): Promise<void>;
}
