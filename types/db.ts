export type CreatePlacementData = {
  attacheId: string;
  supervisorId: string;
  departmentId: string;
  startDate: Date;
  endDate: Date;
};

export type CreateTaskData = {
  supervisorId: string;
  attacheId: string;
  placementId: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | null;
};

export type CreateTaskUpdateData = {
  taskId: string;
  attacheId: string;
  progressNote: string;
  challengeBlocker?: string | null;
};

export type CreateTaskReviewData = {
  taskId: string;
  supervisorId: string;
  decision: "APPROVED" | "RETURNED";
  feedback?: string | null;
};

export type CreateUserData = {
  email: string;
  passwordHash: string;
  fullName: string;
  role: "SUPERVISOR" | "ATTACHE";
  departmentId?: string | null;
};

export type UpdateUserCredentialsData = {
  fullName?: string;
  email?: string;
  passwordHash?: string;
};

export type UserDTOInput = {
  id: string;
  email: string;
  fullName: string;
  role: "SUPERVISOR" | "ATTACHE";
  departmentId: string | null;
  createdAt: Date;
};