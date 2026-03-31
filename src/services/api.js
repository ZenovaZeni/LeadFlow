import { SAMPLE_LEADS, DASHBOARD_STATS, INTAKE_QUESTIONS } from '../data/mock'

// Simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * API Service wrapper for backend integration.
 * Replace mock returns with real `fetch` or SDK calls to connect your database.
 */
export const api = {
  // --- Dashboard Data ---

  /**
   * Fetches dashboard statistics summary
   */
  async getDashboardStats() {
    await delay(300); // Simulate API call
    return { ...DASHBOARD_STATS };
  },

  /**
   * Fetches all leads with optional filtering
   */
  async getLeads() {
    await delay(500); // Simulate slightly longer fetch
    return [...SAMPLE_LEADS];
  },

  /**
   * Updates lead notes/status
   */
  async updateLead(leadId, updates) {
    await delay(200);
    console.log(`[API] Updated lead ${leadId}:`, updates);
    return { success: true };
  },

  // --- Settings ---

  /**
   * Fetches intake questions
   */
  async getIntakeQuestions() {
    await delay(300);
    return [...INTAKE_QUESTIONS];
  },

  /**
   * Saves general business profile settings
   */
  async saveSettings(settingsType, data) {
    await delay(400);
    console.log(`[API] Saved ${settingsType} settings:`, data);
    return { success: true };
  },

  // --- Theme / State Persistence ---

  /**
   * Updates or logs activities if needed on a custom logging DB
   */
  async logActivity(event, details) {
    console.log(`[API-Log] ${event}:`, details);
  }
}
