export type ApiOk<T> = { status: "success"; message: string; data: T };
export type ApiErr = { status?: string; message?: string } & Record<string, unknown>;

export type ProfileData = {
  user: { id: string; name: string; email: string; team?: { id: string; name: string; code: string; users: { name: string; email: string }[] } };
  team_members: string[];
  correct_responses_count: number;
  team_rank: number;
  points: number;
};

export type MainPhaseActive = {
  status: "success";
  message: "PHASE_ACTIVE";
  data: {
    active_phase: number;
    questions: Array<{ id: string; name: string; difficulty?: { level?: string } }>;
    solved_questions?: Array<{ id: string; name: string; difficulty?: { level?: string } }>;
  };
};

export type MainGeneric = { status: string; message: string; data?: any };

export type GetQuestionRes = ApiOk<{
  question_name: string;
  question_parts: Array<{ id: string; content: any[] }>;
  question_parts_count: number;
  difficulty: string;
}>;

export type SubmitResponseRes = ApiOk<{ response: any; points: number }>;
