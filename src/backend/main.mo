import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type (required by frontend)
  public type UserProfile = {
    name : Text;
    age : Nat;
    bloodGroup : Text;
    contact : Text;
    location : Text;
    role : Text; // "donor" or "admin"
    weight : ?Nat;
    healthStatus : ?Text;
  };

  // Data Types
  public type Donor = {
    principal : Principal;
    name : Text;
    age : Nat;
    bloodType : Text;
    location : Text;
    weight : Nat;
    healthStatus : Text;
    isEligible : Bool;
  };

  public type BloodInventory = {
    bloodType : Text;
    quantity : Nat;
  };

  public type DonationRecord = {
    id : Nat;
    donor : Principal;
    date : Time.Time;
    bloodType : Text;
    quantity : Nat;
    location : Text;
  };

  public type EmergencyRequest = {
    id : Nat;
    requester : Principal;
    patientName : Text;
    bloodType : Text;
    location : Text;
    urgencyLevel : Text; // "critical", "high", "medium", "low"
    status : Text; // "pending", "fulfilled", "cancelled"
    requestDate : Time.Time;
  };

  public type Appointment = {
    id : Nat;
    donor : Principal;
    timeSlot : Time.Time;
    location : Text;
    status : Text; // "scheduled", "completed", "cancelled"
  };

  public type Notification = {
    id : Nat;
    recipient : Principal;
    message : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  public type Statistics = {
    totalDonors : Nat;
    totalDonations : Nat;
    emergencyRequests : Nat;
    bloodStockLevels : [(Text, Nat)];
  };

  module Donor {
    public func compare(donor1 : Donor, donor2 : Donor) : Order.Order {
      Text.compare(donor1.name, donor2.name);
    };
  };

  module Appointment {
    public func compare(appointment1 : Appointment, appointment2 : Appointment) : Order.Order {
      Int.compare(appointment1.timeSlot, appointment2.timeSlot);
    };
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let donors = Map.empty<Principal, Donor>();
  let bloodInventory = Map.empty<Text, Nat>();
  var donations = List.empty<DonationRecord>();
  var emergencyRequests = List.empty<EmergencyRequest>();
  var appointments = List.empty<Appointment>();
  var notifications = List.empty<Notification>();
  var nextDonationId : Nat = 0;
  var nextRequestId : Nat = 0;
  var nextAppointmentId : Nat = 0;
  var nextNotificationId : Nat = 0;

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      return null;
    } else {
      return userProfiles.get(caller);
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot view profiles");
    } else if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    } else {
      userProfiles.add(caller, profile);
    };
  };

  // Donor Management
  public shared ({ caller }) func registerDonor(
    name : Text,
    age : Nat,
    bloodType : Text,
    location : Text,
    weight : Nat,
    healthStatus : Text
  ) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Only authenticated users can register as donors");
    };

    if (donors.containsKey(caller)) {
      Runtime.trap("Donor already registered");
    };

    // Check eligibility: age 18-65, weight >= 50kg, healthy status
    let isEligible = (age >= 18 and age <= 65 and weight >= 50 and healthStatus == "healthy");

    let donor : Donor = {
      principal = caller;
      name;
      age;
      bloodType;
      location;
      weight;
      healthStatus;
      isEligible;
    };

    donors.add(caller, donor);

    // Also update user profile
    let profile : UserProfile = {
      name;
      age;
      bloodGroup = bloodType;
      contact = "";
      location;
      role = "donor";
      weight = ?weight;
      healthStatus = ?healthStatus;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getDonor(principal : Principal) : async Donor {
    // Users can view their own donor profile, admins can view any
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own donor profile");
    };

    switch (donors.get(principal)) {
      case (null) { Runtime.trap("Donor not found") };
      case (?donor) { donor };
    };
  };

  public query ({ caller }) func checkDonorEligibility(principal : Principal) : async Bool {
    // Users can check their own eligibility, admins can check any
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own eligibility");
    };

    switch (donors.get(principal)) {
      case (null) { Runtime.trap("Donor not found") };
      case (?donor) { donor.isEligible };
    };
  };

  // Blood Inventory Management
  public shared ({ caller }) func addBloodType(bloodType : Text, initialQuantity : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add blood types");
    };

    if (bloodInventory.containsKey(bloodType)) {
      Runtime.trap("Blood type already exists");
    };

    bloodInventory.add(bloodType, initialQuantity);
  };

  public shared ({ caller }) func updateBloodQuantity(bloodType : Text, quantity : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update blood quantity");
    };

    bloodInventory.add(bloodType, quantity);
  };

  public shared ({ caller }) func increaseBloodQuantity(bloodType : Text, amount : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can increase blood quantity");
    };

    let currentQuantity = switch (bloodInventory.get(bloodType)) {
      case (null) { 0 };
      case (?q) { q };
    };
    bloodInventory.add(bloodType, currentQuantity + amount);
  };

  public shared ({ caller }) func decreaseBloodQuantity(bloodType : Text, amount : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can decrease blood quantity");
    };

    let currentQuantity = switch (bloodInventory.get(bloodType)) {
      case (null) { Runtime.trap("Blood type not found") };
      case (?q) { q };
    };

    if (currentQuantity < amount) {
      Runtime.trap("Insufficient blood quantity");
    };

    bloodInventory.add(bloodType, currentQuantity - amount);
  };

  public query ({ caller }) func getBloodQuantity(bloodType : Text) : async Nat {
    // Anyone can view blood inventory (including guests for emergency situations)
    switch (bloodInventory.get(bloodType)) {
      case (null) { 0 };
      case (?q) { q };
    };
  };

  public query ({ caller }) func getAllBloodInventory() : async [(Text, Nat)] {
    // Anyone can view blood inventory
    bloodInventory.entries().toArray();
  };

  // Donation History
  public shared ({ caller }) func recordDonation(
    bloodType : Text,
    quantity : Nat,
    location : Text
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can record donations");
    };

    let donationId = nextDonationId;
    nextDonationId += 1;

    let record : DonationRecord = {
      id = donationId;
      donor = caller;
      date = Time.now();
      bloodType;
      quantity;
      location;
    };

    donations.add(record);
    donationId;
  };

  public query ({ caller }) func getDonationHistory(donor : Principal) : async [DonationRecord] {
    // Users can view their own history, admins can view any
    if (caller != donor and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own donation history");
    };

    donations.toArray().filter(func(record) { record.donor == donor });
  };

  public query ({ caller }) func getAllDonations() : async [DonationRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all donations");
    };

    donations.toArray();
  };

  // Search Functionality
  public query ({ caller }) func searchDonorsByLocation(location : Text) : async [Donor] {
    // Anyone can search donors (for emergency situations)
    donors.values().toArray().filter(func(donor) { donor.location == location });
  };

  public query ({ caller }) func searchDonorsByBloodType(bloodType : Text) : async [Donor] {
    // Anyone can search donors (for emergency situations)
    donors.values().toArray().filter(func(donor) { donor.bloodType == bloodType });
  };

  public query ({ caller }) func searchBloodByType(bloodType : Text) : async Nat {
    // Anyone can search blood inventory
    switch (bloodInventory.get(bloodType)) {
      case (null) { 0 };
      case (?q) { q };
    };
  };

  // Emergency Blood Request System
  public shared ({ caller }) func submitEmergencyRequest(
    patientName : Text,
    bloodType : Text,
    location : Text,
    urgencyLevel : Text
  ) : async Nat {
    // Anyone can submit emergency requests (including guests)
    let requestId = nextRequestId;
    nextRequestId += 1;

    let request : EmergencyRequest = {
      id = requestId;
      requester = caller;
      patientName;
      bloodType;
      location;
      urgencyLevel;
      status = "pending";
      requestDate = Time.now();
    };

    emergencyRequests.add(request);
    requestId;
  };

  public shared ({ caller }) func updateRequestStatus(requestId : Nat, status : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update request status");
    };

    let updatedRequests = emergencyRequests.map<EmergencyRequest, EmergencyRequest>(
      func(req) {
        if (req.id == requestId) {
          {
            id = req.id;
            requester = req.requester;
            patientName = req.patientName;
            bloodType = req.bloodType;
            location = req.location;
            urgencyLevel = req.urgencyLevel;
            status;
            requestDate = req.requestDate;
          };
        } else {
          req;
        };
      }
    );

    emergencyRequests := updatedRequests;
  };

  public query ({ caller }) func getEmergencyRequests() : async [EmergencyRequest] {
    // Anyone can view emergency requests
    emergencyRequests.toArray();
  };

  public query ({ caller }) func getMyEmergencyRequests() : async [EmergencyRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their requests");
    };

    emergencyRequests.toArray().filter(func(req) { req.requester == caller });
  };

  // Appointment Booking System
  public shared ({ caller }) func bookAppointment(timeSlot : Time.Time, location : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can book appointments");
    };

    if (not donors.containsKey(caller)) {
      Runtime.trap("Only registered donors can book appointments. Please register as a donor first.");
    };

    let appointmentId = nextAppointmentId;
    nextAppointmentId += 1;

    let appointment : Appointment = {
      id = appointmentId;
      donor = caller;
      timeSlot;
      location;
      status = "scheduled";
    };

    appointments.add(appointment);
    appointmentId;
  };

  public shared ({ caller }) func cancelAppointment(appointmentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can cancel appointments");
    };

    let updatedAppointments = appointments.map<Appointment, Appointment>(
      func(apt) {
        if (apt.id == appointmentId) {
          // Users can only cancel their own appointments, admins can cancel any
          if (apt.donor != caller and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Can only cancel your own appointments");
          };

          {
            id = apt.id;
            donor = apt.donor;
            timeSlot = apt.timeSlot;
            location = apt.location;
            status = "cancelled";
          };
        } else {
          apt;
        };
      }
    );

    appointments := updatedAppointments;
  };

  public query ({ caller }) func getAppointments() : async [Appointment] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all appointments");
    };

    appointments.toArray().sort();
  };

  public query ({ caller }) func getMyAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view appointments");
    };

    appointments.toArray().filter(func(apt) { apt.donor == caller }).sort();
  };

  // Notification System
  public shared ({ caller }) func sendNotification(recipient : Principal, message : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can send notifications");
    };

    let notificationId = nextNotificationId;
    nextNotificationId += 1;

    let notification : Notification = {
      id = notificationId;
      recipient;
      message;
      timestamp = Time.now();
      isRead = false;
    };

    notifications.add(notification);
  };

  public query ({ caller }) func getMyNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view notifications");
    };

    notifications.toArray().filter(func(notif) { notif.recipient == caller });
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark notifications");
    };

    let updatedNotifications = notifications.map<Notification, Notification>(
      func(notif) {
        if (notif.id == notificationId and notif.recipient == caller) {
          {
            id = notif.id;
            recipient = notif.recipient;
            message = notif.message;
            timestamp = notif.timestamp;
            isRead = true;
          };
        } else {
          notif;
        };
      }
    );

    notifications := updatedNotifications;
  };

  // Statistics and Reporting
  public query ({ caller }) func getStatistics() : async Statistics {
    // Anyone can view statistics (for transparency)
    {
      totalDonors = donors.size();
      totalDonations = donations.toArray().size();
      emergencyRequests = emergencyRequests.toArray().size();
      bloodStockLevels = bloodInventory.entries().toArray();
    };
  };

  public query ({ caller }) func getTotalDonors() : async Nat {
    // Anyone can view total donors
    donors.size();
  };

  public query ({ caller }) func getBloodStockLevels() : async [(Text, Nat)] {
    // Anyone can view blood stock levels
    bloodInventory.entries().toArray();
  };

  public query ({ caller }) func getEmergencyRequestCount() : async Nat {
    // Anyone can view emergency request count
    emergencyRequests.toArray().size();
  };

  public query ({ caller }) func getPendingEmergencyRequests() : async [EmergencyRequest] {
    // Anyone can view pending emergency requests
    emergencyRequests.toArray().filter(func(req) { req.status == "pending" });
  };
};
