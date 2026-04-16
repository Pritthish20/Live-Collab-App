export class Config {
  static readonly apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

  static readonly collabUrl =
    process.env.NEXT_PUBLIC_COLLAB_URL ?? "ws://localhost:1234";
}
