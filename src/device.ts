/** Identita zariadenia — per-osobná izolácia konverzácií.
 *
 * Tím zdieľa jeden účet pre 3 osoby; každý prehliadač (profil) si vygeneruje
 * UUID, ktoré sa posiela pri loginu a putuje do session cookie ("d").
 * Pretrváva v localStorage — kým ho používateľ nevymaže, je to "jeho osoba".
 */
const STORAGE_KEY = 'esetko_device_id'

function generateId(): string {
  // randomUUID vyžaduje secure context (localhost / HTTPS) — fallback pre
  // napr. workshopovské LAN cez http: getRandomValues funguje všade.
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return crypto.getRandomValues(new Uint32Array(4)).join('-')
}

export function getDeviceId(): string {
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = generateId()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
