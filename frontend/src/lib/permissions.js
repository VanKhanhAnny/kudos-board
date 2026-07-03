/*
 * Client-side permission helpers. Backend is the source of truth — these
 * are used purely to hide UI affordances so users don't see delete buttons
 * they can't actually use.
 *
 * Rules (mirrors backend enforcement):
 *   - Not logged in: cannot delete anything.
 *   - Logged in + row has no owner (orphan / anonymous): can delete.
 *   - Logged in + row owned by this user: can delete.
 *   - Logged in + row owned by someone else: cannot delete.
 */
export function canDeleteRow(user, row) {
  if (!user || !row) return false
  return !row.authorId || row.authorId === user.id
}
