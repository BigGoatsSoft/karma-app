/** Typical backend error JSON (NestJS validation returns message as string[]) */
export interface ApiErrorBody {
  message?: string | string[];
}
