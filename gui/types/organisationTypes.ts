export interface InviteUserPayload {
  email: string;
}

export interface RemoveUserPayload {
  user_id: number;
}

export interface UserTeamDetails {
  id: number;
  name: string;
  email: string;
  organisation_id: number;
}
