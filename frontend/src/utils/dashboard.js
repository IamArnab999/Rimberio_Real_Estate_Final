// Utility to check if dashboard should be enabled for team members
export async function shouldEnableDashboard() {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/enable-dashboard-inactive`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.dashboardEnabled === true;
  } catch (e) {
    return false;
  }
}
