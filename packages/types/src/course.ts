export interface Course {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  credits: number;
  description: string;
  faculty: string;
  department: string;
  prerequisites: string[];
  corequisites: string[];
  instructors: CourseInstructor[];
  semester: string;
  academicYear: number;
  maxStudents: number;
  enrolledStudents: number;
  schedule: CourseSchedule[];
  status: CourseStatus;
}

export type CourseStatus = "open" | "closed" | "cancelled";

export interface CourseInstructor {
  id: string;
  name: string;
  title: string;
  email: string;
}

export interface CourseSchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  room?: string;
  building?: string;
}

export interface CourseEnrollment {
  courseId: string;
  studentId: string;
  enrolledAt: Date;
  status: "enrolled" | "dropped" | "completed" | "failed";
  grade?: number;
  letterGrade?: string;
}

export interface CourseResult {
  courseId: string;
  studentId: string;
  midtermGrade?: number;
  finalGrade?: number;
  assignments: AssignmentResult[];
  attendance: number; // percentage
  totalScore?: number;
  letterGrade?: string;
}

export interface AssignmentResult {
  name: string;
  score: number;
  maxScore: number;
  weight: number; // percentage of total grade
}
