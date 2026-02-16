// Dummy API layer – replace with real HTTP calls later.

export function fetchEvents() {
  // Imagine this coming from backend
  return Promise.resolve([]);
}

export function createEventApi(payload) {
  console.log('Mock createEventApi', payload);
  return Promise.resolve({ success: true });
}

