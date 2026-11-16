// Offline-tolerant session logging.
//
// When the venue wifi drops, sessions are saved on the phone (localStorage)
// and sent when the connection comes back. Every session gets its id on the
// phone, so sending the same one twice is recognised as a duplicate and never
// counted twice.
//
// Sessions are always filed under the day they reach the server (the database
// sets the date), so anything still waiting from a previous day is not sent:
// staff are told to report it to an admin instead.

import { ref } from 'vue'
import { insertSession, isNetworkError, isDuplicateError } from './sessionService'
import { todayEAT } from '@/utils/date'

const STORAGE_KEY = 'vrspace.pendingSessions'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

/** Sessions waiting to be sent, oldest first. Shared by every component. */
export const pendingSessions = ref(load())

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingSessions.value))
}

function remove(id) {
  pendingSessions.value = pendingSessions.value.filter((s) => s.id !== id)
  save()
}

/**
 * Logs a session, or queues it on the phone if there's no connection.
 * Returns { queued: boolean }. Throws for real errors (e.g. machine inactive).
 */
export async function logSessionOrQueue(session) {
  const entry = { id: crypto.randomUUID(), queuedOn: todayEAT(), ...session }
  try {
    await insertSession(entry)
    return { queued: false }
  } catch (e) {
    if (isDuplicateError(e)) return { queued: false }
    if (!isNetworkError(e)) throw e
    pendingSessions.value = [...pendingSessions.value, entry]
    save()
    return { queued: true }
  }
}

/** Removes a waiting session (an "undo" before it was ever sent). */
export function discardPending(id) {
  remove(id)
}

let flushing = null

/**
 * Sends waiting sessions. Returns { sent, stale, rejected } where `stale` are
 * sessions from a previous day (not sent) and `rejected` the server refused.
 */
export function flushPending() {
  flushing ||= (async () => {
    const result = { sent: 0, stale: [], rejected: [] }
    const today = todayEAT()
    for (const entry of [...pendingSessions.value]) {
      if (entry.queuedOn !== today) {
        result.stale.push(entry)
        remove(entry.id)
        continue
      }
      try {
        await insertSession(entry)
        result.sent++
        remove(entry.id)
      } catch (e) {
        if (isDuplicateError(e)) {
          result.sent++ // it had already arrived
          remove(entry.id)
        } else if (isNetworkError(e)) {
          break // still offline: try again later
        } else {
          result.rejected.push({ entry, message: e.message })
          remove(entry.id)
        }
      }
    }
    return result
  })().finally(() => {
    flushing = null
  })
  return flushing
}
