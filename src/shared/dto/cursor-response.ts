export class CursorResponse<TItem> {
  items!: TItem[];
  nextCursor!: number | null;
}