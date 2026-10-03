// ========================================================
// STORAGE MANAGER: HYBRID LOCALSTORAGE & SUPABASE CLOUD
// ========================================================

import {
  INITIAL_INCIDENTS,
  INITIAL_TRIAGE_ITEMS,
  INITIAL_SHELTERS,
  INITIAL_CCTV_FEEDS,
  INITIAL_BLACKLIST,
  INITIAL_BROADCAST_LOGS
} from '../data/mockData.js';

import { supabaseService } from './supabaseClient.js';

const STORAGE_KEYS = {
  INCIDENTS: 'dad_incidents_v1',
  TRIAGE: 'dad_triage_v1',
  SHELTERS: 'dad_shelters_v1',
  CCTV: 'dad_cctv_v1',
  BLACKLIST: 'dad_blacklist_v1',
  BROADCAST_LOGS: 'dad_broadcast_logs_v1',
  THREAT_LEVEL: 'dad_threat_level_v1'
};

export const storageManager = {
  // Reset all data back to mock defaults
  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(INITIAL_INCIDENTS));
    localStorage.setItem(STORAGE_KEYS.TRIAGE, JSON.stringify(INITIAL_TRIAGE_ITEMS));
    localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(INITIAL_SHELTERS));
    localStorage.setItem(STORAGE_KEYS.CCTV, JSON.stringify(INITIAL_CCTV_FEEDS));
    localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(INITIAL_BLACKLIST));
    localStorage.setItem(STORAGE_KEYS.BROADCAST_LOGS, JSON.stringify(INITIAL_BROADCAST_LOGS));
    localStorage.setItem(STORAGE_KEYS.THREAT_LEVEL, '3');
  },

  // Sync initial data to Supabase if connected
  async syncToCloud() {
    if (!supabaseService.isConnected) return;
    const incidents = this.getIncidents();
    for (const inc of incidents) {
      await supabaseService.insertIncident(inc);
    }
    const triage = this.getTriageItems();
    for (const trg of triage) {
      await supabaseService.insertTriageReport(trg);
    }
  },

  // Pull latest data from Supabase Cloud
  async pullFromCloud() {
    if (!supabaseService.isConnected) return null;
    const cloudIncidents = await supabaseService.fetchIncidents();
    if (cloudIncidents && cloudIncidents.length > 0) {
      this.saveIncidents(cloudIncidents);
    }
    const cloudTriage = await supabaseService.fetchTriageReports();
    if (cloudTriage && cloudTriage.length > 0) {
      this.saveTriageItems(cloudTriage);
    }
    return { incidents: cloudIncidents, triage: cloudTriage };
  },

  getIncidents() {
    const raw = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
    if (!raw) {
      this.resetToDefaults();
      return INITIAL_INCIDENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_INCIDENTS;
    }
  },

  saveIncidents(incidents) {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  },

  addIncident(incident) {
    const list = this.getIncidents();
    list.unshift(incident);
    this.saveIncidents(list);

    // Async Cloud sync
    if (supabaseService.isConnected) {
      supabaseService.insertIncident(incident).catch(console.warn);
    }
    return list;
  },

  updateIncident(id, updates) {
    const list = this.getIncidents();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.saveIncidents(list);
      if (supabaseService.isConnected) {
        supabaseService.insertIncident(list[idx]).catch(console.warn);
      }
    }
    return list;
  },

  getTriageItems() {
    const raw = localStorage.getItem(STORAGE_KEYS.TRIAGE);
    if (!raw) return INITIAL_TRIAGE_ITEMS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TRIAGE_ITEMS;
    }
  },

  saveTriageItems(items) {
    localStorage.setItem(STORAGE_KEYS.TRIAGE, JSON.stringify(items));
  },

  addTriageItem(item) {
    const items = this.getTriageItems();
    items.unshift(item);
    this.saveTriageItems(items);

    if (supabaseService.isConnected) {
      supabaseService.insertTriageReport(item).catch(console.warn);
    }
    return items;
  },

  removeTriageItem(id) {
    const items = this.getTriageItems().filter(i => i.id !== id);
    this.saveTriageItems(items);

    if (supabaseService.isConnected) {
      supabaseService.deleteTriageReport(id).catch(console.warn);
    }
    return items;
  },

  getShelters() {
    const raw = localStorage.getItem(STORAGE_KEYS.SHELTERS);
    if (!raw) return INITIAL_SHELTERS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SHELTERS;
    }
  },

  saveShelters(shelters) {
    localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(shelters));
  },

  getCctvFeeds() {
    const raw = localStorage.getItem(STORAGE_KEYS.CCTV);
    if (!raw) return INITIAL_CCTV_FEEDS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CCTV_FEEDS;
    }
  },

  getBlacklist() {
    const raw = localStorage.getItem(STORAGE_KEYS.BLACKLIST);
    if (!raw) return INITIAL_BLACKLIST;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BLACKLIST;
    }
  },

  saveBlacklist(list) {
    localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(list));
  },

  addToBlacklist(entry) {
    const list = this.getBlacklist();
    if (!list.some(b => b.target === entry.target)) {
      list.unshift(entry);
      this.saveBlacklist(list);
    }
    return list;
  },

  removeFromBlacklist(target) {
    const list = this.getBlacklist().filter(b => b.target !== target);
    this.saveBlacklist(list);
    return list;
  },

  getBroadcastLogs() {
    const raw = localStorage.getItem(STORAGE_KEYS.BROADCAST_LOGS);
    if (!raw) return INITIAL_BROADCAST_LOGS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BROADCAST_LOGS;
    }
  },

  addBroadcastLog(log) {
    const logs = this.getBroadcastLogs();
    logs.unshift(log);
    localStorage.setItem(STORAGE_KEYS.BROADCAST_LOGS, JSON.stringify(logs));
    return logs;
  }
};
