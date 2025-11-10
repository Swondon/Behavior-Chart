export interface Person {
  id: string; // Changed to string to store Firebase UID
  name: string;
  username: string;
  level: number;
}

export interface BehaviorChart {
  name: string;
  shareCode: string;
  ownerId: string;
  people: Person[];
  memberIds: string[];
  approvalMode: 'none' | 'user' | 'owner' | 'any_user';
}

export interface ClipRequest {
  id: string; // Firestore document ID
  chartShareCode: string;
  requesterId: string;
  requesterName: string;
  targetPersonId: string;
  targetPersonName: string;
  direction: 'up' | 'down';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any; // Firestore timestamp
}

export const behaviorLevels = [
  { name: "Super Student", color: "#FF69B4" },    // Pink
  { name: "Excellent Job", color: "#9370DB" },    // Purple
  { name: "Good Choices", color: "#1E90FF" },     // Blue
  { name: "Ready to Learn", color: "#32CD32" },   // Green
  { name: "Reminder", color: "#FFD700" },         // Yellow
  { name: "Think About It", color: "#FF9800" },    // Orange
  { name: "Parent Contact", color: "#F44336" }     // Red
];