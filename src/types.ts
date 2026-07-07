export interface ExerciseTemplate {
  id: string;
  name: string;
  sets: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: ExerciseTemplate[];
}

export interface LoggedSet {
  id: string;
  weight: number | '';
  reps: number | '';
  completed: boolean;
}

export interface LoggedExercise {
  id: string;
  exerciseId: string;
  name: string;
  weight?: number; // legacy
  reps?: number; // legacy
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  templateId: string;
  name: string;
  date: string;
  exercises: LoggedExercise[];
}

export interface UserProfile {
  name: string;
  weight: number;
  height: number;
  age: number;
  gender: 'M' | 'F';
  activityLevel: number;
}

export interface ActiveWorkoutState {
  templateId: string;
  exercises: LoggedExercise[];
}

export interface AppState {
  templates: WorkoutTemplate[];
  logs: WorkoutLog[];
  profile?: UserProfile;
  activeWorkout?: ActiveWorkoutState;
}
