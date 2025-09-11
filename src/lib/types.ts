export type ApiOk<T> = { status: "success"; message: string; data: T };
export type ApiErr = { status?: string; message?: string } & Record<string, unknown>;

export type ProfileData = {
  user: { id: string; name: string; email: string; team?: { id: string; name: string; code: string; users: { name: string; email: string }[] } };
  team_members: string[];
  correct_responses_count: number;
  team_rank: number;
  points: number;
};

