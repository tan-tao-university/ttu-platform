export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  studentId?: string;
  employeeId?: string;
  department?: string;
  faculty?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole =
  "admin" | "faculty_admin" | "teacher" | "student" | "staff";

export interface Student extends User {
  role: "student";
  studentId: string;
  faculty: string;
  major: string;
  year: number;
  enrollmentYear: number;
  gpa?: number;
  status: "active" | "graduated" | "suspended" | "withdrawn";
}

export interface Teacher extends User {
  role: "teacher";
  employeeId: string;
  faculty: string;
  title: string;
  degrees: string[];
  specialization: string[];
}

export interface AuthUser extends User {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
