// Live Colleges Data Provider (Pure API - No static dummy data)
export const collegesData = [];

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api';

export async function syncLiveCollegesFromApi() {
  try {
    const res = await fetch(`${API_BASE}/college?limit=100`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        collegesData.length = 0;
        collegesData.push(...json.data);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('colleges-data-updated'));
        }
      }
    }
  } catch (e) {
    console.warn('Backend API connection check for collegesData failed:', e.message);
  }
}

// Auto-trigger sync on module load
if (typeof window !== 'undefined') {
  syncLiveCollegesFromApi();
}
