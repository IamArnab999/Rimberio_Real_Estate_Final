import { getAnalytics, isSupported } from "firebase/analytics";
import { app } from "./config";

let analyticsInstance = null;

export async function initAnalytics() {
  if (!analyticsInstance && (await isSupported())) {
    analyticsInstance = getAnalytics(app);
    // Optionally: analyticsInstance.logEvent('page_view');
    console.log("Firebase Analytics enabled");
  }
  return analyticsInstance;
}