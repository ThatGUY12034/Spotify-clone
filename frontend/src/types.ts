export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  playlist: string[];
  createdAt?: string;
}

export interface Album {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  created_at?: string;
}

export interface Song {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  audio: string;
  album_id: number | null;
  created_at?: string;
}
