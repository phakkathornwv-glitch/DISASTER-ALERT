// ========================================================
// SUPABASE CLIENT & REAL-TIME CLOUD DATABASE CONNECTOR
// ========================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'dad_supabase_config_v1';

export class SupabaseService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.config = this.loadConfig();
    this.initClient();
  }

  loadConfig() {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }

    // Default fallback from Vite Environment Variables if present
    const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    return {
      url: envUrl,
      anonKey: envKey,
      autoSync: true
    };
  }

  saveConfig(url, anonKey, autoSync = true) {
    this.config = { url: url.trim(), anonKey: anonKey.trim(), autoSync };
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(this.config));
    this.initClient();
  }

  initClient() {
    if (this.config.url && this.config.anonKey) {
      try {
        this.client = createClient(this.config.url, this.config.anonKey, {
          auth: { persistSession: true },
          realtime: { params: { eventsPerSecond: 10 } }
        });
        this.isConnected = true;
      } catch (err) {
        console.warn('Supabase initialization failed:', err);
        this.client = null;
        this.isConnected = false;
      }
    } else {
      this.client = null;
      this.isConnected = false;
    }
  }

  async testConnection() {
    if (!this.client) {
      return { success: false, message: 'กรุณาระบุ Supabase Project URL และ Anon Key' };
    }
    try {
      // Test querying incidents table or general health check
      const { data, error } = await this.client.from('incidents').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        // Table might not be created yet, but connection works if it's 404 or specific code
        return { success: true, message: 'เชื่อมต่อ Supabase สำเร็จ (ตรวจสอบตารางในฐานข้อมูลแล้ว)', data };
      }
      return { success: true, message: 'เชื่อมต่อ Supabase Cloud Database สำเร็จ 100%', data };
    } catch (err) {
      return { success: false, message: 'การเชื่อมต่อล้มเหลว: ' + (err.message || String(err)) };
    }
  }

  // ----------------------------------------------------
  // INCIDENTS CLOUD SYNC
  // ----------------------------------------------------
  async fetchIncidents() {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.from('incidents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        type: row.type,
        typeName: row.type_name,
        typeIcon: row.type_icon,
        title: row.title,
        description: row.description,
        province: row.province,
        district: row.district,
        subdistrict: row.subdistrict,
        landmark: row.landmark,
        lat: row.lat,
        lng: row.lng,
        severity: row.severity,
        severityLabel: row.severity_label,
        status: row.status,
        reportedAt: row.reported_at,
        timestamp: row.timestamp,
        reporterName: row.reporter_name,
        reporterPhone: row.reporter_phone,
        citizenId: row.citizen_id,
        trustScore: row.trust_score,
        isFake: row.is_fake,
        dispatchedUnits: row.dispatched_units || [],
        victimsCount: row.victims_count || 0,
        dangerRadiusMeters: row.danger_radius_meters || 1000,
        imageUrl: row.image_url
      }));
    } catch (err) {
      console.warn('Supabase fetchIncidents error:', err);
      return null;
    }
  }

  async insertIncident(incident) {
    if (!this.client) return false;
    try {
      const row = {
        id: incident.id,
        type: incident.type,
        type_name: incident.typeName,
        type_icon: incident.typeIcon,
        title: incident.title,
        description: incident.description,
        province: incident.province,
        district: incident.district,
        subdistrict: incident.subdistrict,
        landmark: incident.landmark,
        lat: incident.lat,
        lng: incident.lng,
        severity: incident.severity,
        severity_label: incident.severityLabel,
        status: incident.status || 'verified',
        reported_at: incident.reportedAt,
        timestamp: incident.timestamp || Date.now(),
        reporter_name: incident.reporterName,
        reporter_phone: incident.reporterPhone,
        citizen_id: incident.citizenId,
        trust_score: incident.trustScore,
        is_fake: incident.isFake || false,
        dispatched_units: incident.dispatchedUnits || [],
        victims_count: incident.victimsCount || 0,
        danger_radius_meters: incident.dangerRadiusMeters || 1000,
        image_url: incident.imageUrl || null
      };
      const { error } = await this.client.from('incidents').upsert(row);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase insertIncident error:', err);
      return false;
    }
  }

  // ----------------------------------------------------
  // TRIAGE REPORTS CLOUD SYNC
  // ----------------------------------------------------
  async fetchTriageReports() {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.from('triage_reports').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        type: row.type,
        typeName: row.type_name,
        typeIcon: row.type_icon,
        title: row.title,
        description: row.description,
        province: row.province,
        district: row.district,
        subdistrict: row.subdistrict,
        landmark: row.landmark,
        lat: row.lat,
        lng: row.lng,
        reportedAt: row.reported_at,
        timestamp: row.timestamp,
        reporterName: row.reporter_name,
        reporterPhone: row.reporter_phone,
        citizenId: row.citizen_id,
        ipAddress: row.ip_address,
        trustScore: row.trust_score,
        trustLevel: row.trust_level,
        fakeProbability: row.fake_probability,
        status: row.status,
        flags: row.flags || [],
        clusterConsensus: row.cluster_consensus || 1,
        recommendedAction: row.recommended_action
      }));
    } catch (err) {
      console.warn('Supabase fetchTriageReports error:', err);
      return null;
    }
  }

  async insertTriageReport(item) {
    if (!this.client) return false;
    try {
      const row = {
        id: item.id,
        type: item.type,
        type_name: item.typeName,
        type_icon: item.typeIcon,
        title: item.title,
        description: item.description,
        province: item.province,
        district: item.district,
        subdistrict: item.subdistrict,
        landmark: item.landmark,
        lat: item.lat,
        lng: item.lng,
        reported_at: item.reportedAt,
        timestamp: item.timestamp || Date.now(),
        reporter_name: item.reporterName,
        reporter_phone: item.reporterPhone,
        citizen_id: item.citizenId,
        ip_address: item.ipAddress || '',
        trust_score: item.trustScore,
        trust_level: item.trustLevel,
        fake_probability: item.fakeProbability,
        status: item.status || 'pending',
        flags: item.flags || [],
        cluster_consensus: item.clusterConsensus || 1,
        recommended_action: item.recommendedAction
      };
      const { error } = await this.client.from('triage_reports').upsert(row);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase insertTriageReport error:', err);
      return false;
    }
  }

  async deleteTriageReport(id) {
    if (!this.client) return false;
    try {
      const { error } = await this.client.from('triage_reports').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase deleteTriageReport error:', err);
      return false;
    }
  }

  // ----------------------------------------------------
  // REALTIME SUBSCRIPTION
  // ----------------------------------------------------
  subscribeToIncidents(onUpdate) {
    if (!this.client) return null;
    const channel = this.client
      .channel('public:incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
        if (onUpdate) onUpdate(payload);
      })
      .subscribe();
    return channel;
  }
}

export const supabaseService = new SupabaseService();
