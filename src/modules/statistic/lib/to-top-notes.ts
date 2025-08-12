type GroupByNoteRow = { note: string | null; _count: { note: number } };

export function toTopNotes(rows: GroupByNoteRow[], limit = 3) {
  return rows
    .filter(r => typeof r.note === 'string' && r.note.trim() !== '')
    .map(r => ({ note: (r.note as string).trim(), count: r._count.note }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}