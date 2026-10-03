// ========================================================
// DISASTER ALERT DASHBOARD: MAIN APPLICATION LOGIC
// ========================================================

import {
  createIcons,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Radio,
  Map as MapIcon,
  FilePlus2,
  Home,
  Activity,
  Phone,
  PhoneCall,
  Video,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Crosshair,
  Camera,
  CheckCircle,
  AlertTriangle,
  Send,
  Truck,
  Sparkles,
  Inbox,
  Cpu,
  UserX,
  Ban,
  ArrowRight,
  ArrowLeft,
  Waves,
  CloudRain,
  PieChart,
  Wind,
  RadioTower,
  User,
  History,
  Check,
  MousePointerClick,
  Sun,
  Moon,
  Siren,
  Info,
  Plus,
  Database,
  Copy
} from 'lucide';

import confetti from 'canvas-confetti';
import { storageManager } from './modules/storageManager.js';
import { soundManager } from './modules/soundManager.js';
import { MapManager } from './modules/mapManager.js';
import { ChartManager } from './modules/chartManager.js';
import { supabaseService } from './modules/supabaseClient.js';
import { disasterApiService } from './modules/disasterApis.js';
import {
  validateThaiCitizenId,
  analyzeTextIntegrity,
  evaluateReportTrust
} from './modules/antiFakeEngine.js';

class DisasterDashboardApp {
  constructor() {
    this.currentRole = 'officer'; // 'officer' or 'citizen'
    this.currentTheme = localStorage.getItem('dad_theme') || 'dark'; // 'dark' or 'light'
    this.currentStep = 1;
    this.selectedTriageId = null;
    this.selectedIncidentId = null;
    this.triageFilter = 'all';

    // Geolocation mock/live state
    this.userDeviceLat = 20.4325;
    this.userDeviceLng = 99.8805;
    this.photoAttached = false;
    this.otpVerified = true;

    this.mapManager = new MapManager(
      (inc) => this.handleIncidentMarkerClick(inc),
      (cam) => this.handleCctvMarkerClick(cam)
    );
    this.chartManager = new ChartManager();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.initThemeToggle();
    this.initSupabaseModal();
    this.initSupabaseSync();
    this.renderIcons();
    this.initClock();
    this.initAudioToggle();
    this.initNavigation();
    this.initRoleSwitcher();
    this.initMap();
    this.initTriageSystem();
    this.initCitizenWizard();
    this.initBroadcastSimulator();
    this.initSheltersView();
    this.initModals();
    this.initDataExportAndReset();
    this.refreshDashboardMetrics();

    // Initial default triage inspector load
    const triageItems = storageManager.getTriageItems();
    if (triageItems.length > 0) {
      this.selectTriageItem(triageItems[0].id);
    }
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('dad_theme', theme);
    document.body.className = theme === 'light' ? 'theme-light' : 'theme-dark';

    const label = document.getElementById('themeLabel');
    const icon = document.getElementById('themeIcon');
    if (label) label.textContent = theme === 'light' ? 'โหมดมืด' : 'โหมดสว่าง';
    if (icon) {
      icon.setAttribute('data-lucide', theme === 'light' ? 'moon' : 'sun');
    }
    this.renderIcons();
  }

  initThemeToggle() {
    const btn = document.getElementById('btnThemeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.applyTheme(nextTheme);
      this.showToast(`เปลี่ยนเป็น${nextTheme === 'light' ? 'โหมดสว่าง (Clean Light)' : 'โหมดมืด (Clean Dark)'}แล้ว`, 'info');
    });
  }

  renderIcons() {
    createIcons({
      icons: {
        ShieldAlert,
        ShieldCheck,
        ShieldX,
        Radio,
        Map: MapIcon,
        FilePlus2,
        Home,
        Activity,
        Phone,
        PhoneCall,
        Video,
        Volume2,
        VolumeX,
        RotateCcw,
        Download,
        Crosshair,
        Camera,
        CheckCircle,
        AlertTriangle,
        Send,
        Truck,
        Sparkles,
        Inbox,
        Cpu,
        UserX,
        Ban,
        ArrowRight,
        ArrowLeft,
        Waves,
        CloudRain,
        PieChart,
        Wind,
        RadioTower,
        User,
        History,
        Check,
        MousePointerClick,
        Sun,
        Moon,
        Siren,
        Info,
        Plus,
        Database,
        Copy
      }
    });
  }

  // Live System Clock
  initClock() {
    const clockEl = document.getElementById('systemClock');
    const phoneClockEl = document.getElementById('phoneClock');
    const cctvTimeEl = document.getElementById('cctvMetaTime');

    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('th-TH', { hour12: false }) + ' ICT';
      const shortTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
      const fullDateStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' ICT';

      if (clockEl) clockEl.textContent = timeStr;
      if (phoneClockEl) phoneClockEl.textContent = shortTime;
      if (cctvTimeEl) cctvTimeEl.textContent = fullDateStr;
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  // Audio Toggle
  initAudioToggle() {
    const btn = document.getElementById('btnAudioToggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      const label = btn.querySelector('.audio-status-label');
      if (isMuted) {
        btn.classList.add('muted');
        label.textContent = 'เสียง: ปิด';
        this.showToast('ปิดเสียงเตือนและไซเรนแล้ว', 'warning');
      } else {
        btn.classList.remove('muted');
        label.textContent = 'เสียง: เปิด';
        soundManager.playSuccessChime();
        this.showToast('เปิดเสียงเตือนระบบแล้ว', 'success');
      }
      this.renderIcons();
    });
  }

  // Navigation Tabs Switching
  initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const panes = document.querySelectorAll('.tab-pane');

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const targetTab = link.getAttribute('data-tab');

        navLinks.forEach(l => l.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        link.classList.add('active');
        const targetPane = document.getElementById(targetTab);
        if (targetPane) {
          targetPane.classList.add('active');
        }

        // Trigger Map/Chart render fixes
        if (targetTab === 'tab-map') {
          this.mapManager.invalidateSize();
        } else if (targetTab === 'tab-report') {
          this.mapManager.invalidateSize();
        } else if (targetTab === 'tab-telemetry') {
          const incidents = storageManager.getIncidents();
          this.chartManager.initAllCharts(incidents);
        }
      });
    });
  }

  // Role Switcher (Command Officer vs Citizen Report)
  initRoleSwitcher() {
    const btnOfficer = document.getElementById('btnRoleOfficer');
    const btnCitizen = document.getElementById('btnRoleCitizen');

    btnOfficer.addEventListener('click', () => {
      this.currentRole = 'officer';
      btnOfficer.classList.add('active');
      btnCitizen.classList.remove('active');
      this.switchTab('tab-map');
      this.showToast('เข้าสู่โหมดศูนย์บัญชาการ ปภ. / อปท.', 'success');
    });

    btnCitizen.addEventListener('click', () => {
      this.currentRole = 'citizen';
      btnCitizen.classList.add('active');
      btnOfficer.classList.remove('active');
      this.switchTab('tab-report');
      this.showToast('เข้าสู่พอร์ทัลประชาชน: พร้อมแจ้งเหตุด่วน', 'success');
    });
  }

  switchTab(tabId) {
    const link = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
    if (link) link.click();
  }

  // Toast Notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ----------------------------------------------------
  // MAP & INCIDENTS COMMAND
  // ----------------------------------------------------
  initMap() {
    this.mapManager.initMainMap('crisisMap');
    this.renderMapIncidentsList();

    // Layer toggle checkboxes
    const layerIncidents = document.getElementById('layerIncidentsCheck');
    const layerShelters = document.getElementById('layerSheltersCheck');
    const layerSensors = document.getElementById('layerSensorsCheck');
    const layerCctv = document.getElementById('layerCctvCheck');
    const layerDanger = document.getElementById('layerDangerZoneCheck');

    if (layerIncidents) layerIncidents.addEventListener('change', (e) => this.mapManager.toggleLayer('incidents', e.target.checked));
    if (layerShelters) layerShelters.addEventListener('change', (e) => this.mapManager.toggleLayer('shelters', e.target.checked));
    if (layerSensors) layerSensors.addEventListener('change', (e) => this.mapManager.toggleLayer('sensors', e.target.checked));
    if (layerCctv) layerCctv.addEventListener('change', (e) => this.mapManager.toggleLayer('cctv', e.target.checked));
    if (layerDanger) layerDanger.addEventListener('change', (e) => this.mapManager.toggleLayer('dangerZones', e.target.checked));

    // Preset view buttons
    document.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (view === 'north') this.mapManager.panToLocation(20.4325, 99.8805, 11);
        else if (view === 'central') this.mapManager.panToLocation(14.3532, 100.5684, 10);
        else if (view === 'south') this.mapManager.panToLocation(9.4728, 100.0489, 10);
        else if (view === 'all') this.mapManager.panToLocation(14.5, 100.5, 6);
      });
    });

    // Filters
    const typeFilter = document.getElementById('filterDisasterType');
    const sevFilter = document.getElementById('filterSeverity');

    const handleFilterChange = () => {
      this.renderMapIncidentsList(typeFilter.value, sevFilter.value);
    };

    if (typeFilter) typeFilter.addEventListener('change', handleFilterChange);
    if (sevFilter) sevFilter.addEventListener('change', handleFilterChange);

    // Floating card close button
    const btnCloseCard = document.getElementById('btnCloseFloatingCard');
    if (btnCloseCard) {
      btnCloseCard.addEventListener('click', () => {
        const card = document.getElementById('mapFloatingCard');
        if (card) card.classList.add('hidden');
      });
    }
  }

  renderMapIncidentsList(typeFilter = 'all', sevFilter = 'all') {
    const listContainer = document.getElementById('mapIncidentList');
    if (!listContainer) return;

    let incidents = storageManager.getIncidents();

    if (typeFilter !== 'all') {
      incidents = incidents.filter(i => i.type === typeFilter);
    }
    if (sevFilter !== 'all') {
      incidents = incidents.filter(i => String(i.severity) === String(sevFilter));
    }

    // Update map markers
    this.mapManager.renderIncidents(incidents);
    this.mapManager.renderShelters(storageManager.getShelters());
    this.mapManager.renderCctv(storageManager.getCctvFeeds());

    listContainer.innerHTML = '';

    if (incidents.length === 0) {
      listContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: #64748b; font-size: 0.85rem;">ไม่พบเหตุการณ์ตามตัวกรองที่เลือก</div>`;
      return;
    }

    incidents.forEach(inc => {
      const card = document.createElement('div');
      card.className = `incident-card sev-${inc.severity}`;
      if (this.selectedIncidentId === inc.id) card.classList.add('active');

      const trustClass = inc.trustScore >= 80 ? 'high' : inc.trustScore >= 40 ? 'medium' : 'low';

      card.innerHTML = `
        <div class="inc-header">
          <span class="inc-type-badge">${inc.typeIcon || '⚠️'} ${inc.typeName}</span>
          <span class="inc-time">${inc.reportedAt || 'ไม่นานนี้'}</span>
        </div>
        <div class="inc-title">${inc.title}</div>
        <div class="inc-location">
          <i data-lucide="crosshair" style="width: 12px; height: 12px;"></i>
          <span>${inc.district} จ.${inc.province} (${inc.landmark || ''})</span>
        </div>
        <div class="inc-footer">
          <span class="inc-trust-tag ${trustClass}">
            <i data-lucide="shield-check" style="width: 12px; height: 12px;"></i>
            คะแนนความน่าเชื่อถือ: ${inc.trustScore}%
          </span>
          <span class="inc-dispatch-badge">${inc.dispatchedUnits ? inc.dispatchedUnits.length + ' ทีมปฏิบัติการ' : 'รอยืนยัน'}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        this.handleIncidentMarkerClick(inc);
      });

      listContainer.appendChild(card);
    });

    this.renderIcons();
    this.refreshDashboardMetrics();
  }

  handleIncidentMarkerClick(inc) {
    this.selectedIncidentId = inc.id;
    this.mapManager.panToLocation(inc.lat, inc.lng, 13);

    // Highlight card in sidebar list
    const cards = document.querySelectorAll('.incident-card');
    cards.forEach(c => c.classList.remove('active'));

    // Show floating detail card on map
    const floatingCard = document.getElementById('mapFloatingCard');
    const body = document.getElementById('floatingCardBody');
    if (floatingCard && body) {
      body.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
          <span style="font-size: 1.2rem;">${inc.typeIcon || '⚠️'}</span>
          <span style="font-size: 0.75rem; color: #ff9100; font-weight: 700;">${inc.severityLabel}</span>
        </div>
        <div class="title">${inc.title}</div>
        <div class="desc">${inc.description}</div>
        <div class="floating-meta-grid">
          <div>📍 พิกัด: ${inc.lat.toFixed(4)}, ${inc.lng.toFixed(4)}</div>
          <div>👤 ผู้แจ้ง: ${inc.reporterName}</div>
          <div>🛡️ ความน่าเชื่อถือ: <span class="text-green font-bold">${inc.trustScore}%</span></div>
          <div>👥 ผู้ประสบภัย: ~${inc.victimsCount || 0} คน</div>
        </div>
        <div class="floating-actions">
          <button class="btn-action-primary" id="btnDispatchTactical">
            <i data-lucide="truck"></i> สั่งการระดมทีมกู้ภัย
          </button>
        </div>
      `;

      floatingCard.classList.remove('hidden');
      this.renderIcons();

      const btnDispatch = document.getElementById('btnDispatchTactical');
      if (btnDispatch) {
        btnDispatch.addEventListener('click', () => {
          this.openDispatchModal(inc);
        });
      }
    }
  }

  handleCctvMarkerClick(cam) {
    const modal = document.getElementById('cctvModalOverlay');
    const locName = document.getElementById('cctvLocationName');
    const visualLayer = document.getElementById('cctvVisualLayer');

    if (locName) locName.textContent = cam.name;
    if (visualLayer) {
      visualLayer.innerHTML = `
        <div class="cctv-water-sim"></div>
        <div style="position: absolute; color: rgba(255,255,255,0.7); font-size: 13px; text-shadow: 0 0 6px #000; text-align: center;">
          ⚡ [LIVE SENSOR TELEMETRY] ${cam.currentWaterLevel}<br/>
          กล้องมุมมอง PTZ หมุนตรวจการณ์รอบสะพาน
        </div>
      `;
    }

    if (modal) modal.classList.remove('hidden');
    soundManager.playDispatchBeep();
  }

  // ----------------------------------------------------
  // ANTI-FAKE & SPAM TRIAGE SYSTEM
  // ----------------------------------------------------
  initTriageSystem() {
    this.renderTriageQueueList();
    this.renderBlacklist();

    // Trust Filter chips
    const chips = document.querySelectorAll('[data-trust-filter]');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.triageFilter = chip.getAttribute('data-trust-filter');
        this.renderTriageQueueList();
      });
    });

    // Add blacklist manual button
    const btnAddBlacklist = document.getElementById('btnAddBlacklist');
    const inputBlacklist = document.getElementById('inputBlacklistTarget');
    if (btnAddBlacklist && inputBlacklist) {
      btnAddBlacklist.addEventListener('click', () => {
        const val = inputBlacklist.value.trim();
        if (!val) return;
        storageManager.addToBlacklist({
          target: val,
          type: val.length === 13 ? 'citizenId' : val.includes('.') ? 'ipAddress' : 'phone',
          reason: 'เจ้าหน้าที่สั่งขึ้นบัญชีดำด้วยตนเอง',
          bannedAt: new Date().toISOString().slice(0, 10)
        });
        inputBlacklist.value = '';
        this.renderBlacklist();
        this.showToast(`เพิ่ม ${val} เข้าบัญชีดำสำเร็จ`, 'error');
      });
    }
  }

  renderTriageQueueList() {
    const container = document.getElementById('triageQueueList');
    if (!container) return;

    let items = storageManager.getTriageItems();

    if (this.triageFilter === 'suspicious') {
      items = items.filter(i => i.trustScore < 40);
    } else if (this.triageFilter === 'medium') {
      items = items.filter(i => i.trustScore >= 40 && i.trustScore < 80);
    } else if (this.triageFilter === 'high') {
      items = items.filter(i => i.trustScore >= 80);
    }

    container.innerHTML = '';

    if (items.length === 0) {
      container.innerHTML = `<div style="padding: 30px; text-align: center; color: #64748b;">ไม่มีรายการรอคัดกรองในหมวดนี้</div>`;
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `triage-item`;
      if (this.selectedTriageId === item.id) card.classList.add('active');

      const trustClass = item.trustScore >= 80 ? 'high' : item.trustScore >= 40 ? 'medium' : 'low';

      card.innerHTML = `
        <div class="triage-top">
          <span class="triage-type-tag">${item.typeIcon || '⚠️'} ${item.typeName}</span>
          <span class="trust-badge-pill ${trustClass}">คะแนนความน่าเชื่อถือ: ${item.trustScore}%</span>
        </div>
        <div class="triage-title">${item.title}</div>
        <div class="triage-snippet">${item.description}</div>
        <div class="triage-meta-row">
          <span>👤 ${item.reporterName} | 📍 ${item.district} จ.${item.province}</span>
          <div class="triage-flags">
            <span class="flag-badge ${item.trustScore < 40 ? 'bad' : 'ok'}">${item.flags ? item.flags.length + ' กฎตรวจสอบ' : ''}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectTriageItem(item.id);
      });

      container.appendChild(card);
    });

    this.renderIcons();
    this.refreshDashboardMetrics();
  }

  selectTriageItem(id) {
    this.selectedTriageId = id;
    const items = storageManager.getTriageItems();
    const item = items.find(i => i.id === id);

    // Update active class
    document.querySelectorAll('.triage-item').forEach(el => el.classList.remove('active'));

    const card = document.getElementById('inspectorDetailCard');
    if (!card || !item) return;

    const trustClass = item.trustScore >= 80 ? 'text-green' : item.trustScore >= 40 ? 'text-amber' : 'text-red';

    const flagsHtml = (item.flags || []).map(f => {
      const isPositive = f.impact > 0;
      const type = isPositive ? 'pass' : (f.impact < -20 ? 'fail' : 'warn');
      const sign = isPositive ? '+' : '';
      return `
        <div class="factor-item ${type}">
          <div class="factor-name">
            <span>${isPositive ? '✓' : '⚠️'}</span>
            <span>${f.label}</span>
          </div>
          <div class="factor-score-change ${isPositive ? 'text-green' : 'text-red'}">${sign}${f.impact}</div>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="inspector-detail-content">
        <div class="inspector-score-header">
          <div>
            <div style="font-size: 0.75rem; color: #94a3b8;">ผลการวิเคราะห์ความน่าเชื่อถือ (Trust Index)</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #fff;">${item.id} - ${item.typeName}</div>
          </div>
          <div class="score-big ${trustClass}">${item.trustScore} / 100</div>
        </div>

        <div style="background: var(--bg-surface-2); padding: 12px; border-radius: 8px; font-size: 0.8rem;">
          <div style="color: #94a3b8; font-size: 0.7rem; margin-bottom: 2px;">ข้อมูลผู้แจ้ง & เลขประจำตัวประชาชน:</div>
          <div><strong>${item.reporterName}</strong> | โทร: ${item.reporterPhone} | บัตร ปชช: <span class="font-mono">${item.citizenId}</span></div>
          <div style="margin-top: 6px; color: #cbd5e1;">"${item.description}"</div>
        </div>

        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-bottom: 8px;">เกณฑ์การประเมินและน้ำหนักคะแนน (Decision Breakdown):</div>
          <div class="factor-breakdown-list">${flagsHtml}</div>
        </div>

        <div class="inspector-actions">
          <button class="btn-verify-approve" id="btnApproveReport">
            <i data-lucide="check-circle"></i> อนุมัติ & ส่งทีมกู้ภัย
          </button>
          <button class="btn-verify-reject" id="btnRejectReport">
            <i data-lucide="ban"></i> ปฏิเสธ & แบนผู้แจ้ง (Blacklist)
          </button>
        </div>
      </div>
    `;

    this.renderIcons();

    // Approve Action
    const btnApprove = document.getElementById('btnApproveReport');
    if (btnApprove) {
      btnApprove.addEventListener('click', () => {
        this.approveTriageReport(item);
      });
    }

    // Reject & Blacklist Action
    const btnReject = document.getElementById('btnRejectReport');
    if (btnReject) {
      btnReject.addEventListener('click', () => {
        this.rejectAndBlacklistReport(item);
      });
    }
  }

  approveTriageReport(item) {
    // Convert to verified incident
    const newIncident = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      type: item.type,
      typeName: item.typeName,
      typeIcon: item.typeIcon,
      title: item.title,
      description: item.description,
      province: item.province,
      district: item.district,
      subdistrict: item.subdistrict || '',
      landmark: item.landmark || '',
      lat: item.lat,
      lng: item.lng,
      severity: item.trustScore >= 80 ? 3 : 2,
      severityLabel: 'วิกฤต (ระดับ 3)',
      status: 'verified',
      reportedAt: 'เพิ่งแจ้ง',
      timestamp: Date.now(),
      reporterName: item.reporterName,
      reporterPhone: item.reporterPhone,
      citizenId: item.citizenId,
      trustScore: item.trustScore,
      dispatchedUnits: ['ทีมกู้ภัย อปท. ประจำพื้นที่'],
      victimsCount: item.victimsCount || 0,
      dangerRadiusMeters: 1000
    };

    storageManager.addIncident(newIncident);
    storageManager.removeTriageItem(item.id);

    soundManager.playSuccessChime();
    this.showToast(`อนุมัติเหตุการณ์ ${newIncident.title} และปักหมุดบนแผนที่สดแล้ว`, 'success');

    this.renderTriageQueueList();
    this.renderMapIncidentsList();
    this.selectNextTriageItem();
  }

  rejectAndBlacklistReport(item) {
    storageManager.addToBlacklist({
      target: item.citizenId || item.reporterPhone || item.ipAddress,
      type: item.citizenId ? 'citizenId' : 'phone',
      reason: `แจ้งข้อมูลเท็จ / สร้างความตระหนก: ${item.title}`,
      bannedAt: new Date().toISOString().slice(0, 10)
    });

    storageManager.removeTriageItem(item.id);
    soundManager.playDispatchBeep();
    this.showToast(`ปฏิเสธรายงานและขึ้นบัญชีดำผู้แจ้ง (${item.reporterName}) สำเร็จ`, 'error');

    this.renderTriageQueueList();
    this.renderBlacklist();
    this.selectNextTriageItem();
  }

  selectNextTriageItem() {
    const items = storageManager.getTriageItems();
    if (items.length > 0) {
      this.selectTriageItem(items[0].id);
    } else {
      const card = document.getElementById('inspectorDetailCard');
      if (card) {
        card.innerHTML = `<div class="inspector-placeholder"><i data-lucide="check-circle"></i><p>ไม่มีรายงานค้างในคิวตรวจสอบ</p></div>`;
        this.renderIcons();
      }
    }
  }

  renderBlacklist() {
    const container = document.getElementById('blacklistContainer');
    if (!container) return;

    const list = storageManager.getBlacklist();
    container.innerHTML = '';

    list.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'blacklist-item';
      div.innerHTML = `
        <div>
          <strong>${entry.target}</strong> (${entry.type}) - ${entry.reason}
        </div>
        <button class="btn-unban" data-unban="${entry.target}">ปลดแบน</button>
      `;
      container.appendChild(div);
    });

    container.querySelectorAll('[data-unban]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-unban');
        storageManager.removeFromBlacklist(target);
        this.renderBlacklist();
        this.showToast(`ปลดแบน ${target} แล้ว`, 'info');
      });
    });
  }

  // ----------------------------------------------------
  // CITIZEN INCIDENT REPORTING WIZARD
  // ----------------------------------------------------
  initCitizenWizard() {
    this.mapManager.initPickerMap('pickerMap', 20.4325, 99.8805, async (lat, lng) => {
      const latInput = document.getElementById('reportLat');
      const lngInput = document.getElementById('reportLng');
      if (latInput) latInput.value = lat.toFixed(5);
      if (lngInput) lngInput.value = lng.toFixed(5);
      this.updateLiveTrustScore();

      // Call Reverse Geocoding API to auto-fill address
      const geo = await disasterApiService.reverseGeocode(lat, lng);
      const provEl = document.getElementById('reportProvince');
      const distEl = document.getElementById('reportDistrict');
      const subdistEl = document.getElementById('reportSubdistrict');
      const landmarkEl = document.getElementById('reportLandmark');

      if (provEl && geo.province) {
        // Match or add option
        for (let opt of provEl.options) {
          if (geo.province.includes(opt.value)) {
            provEl.value = opt.value;
            break;
          }
        }
      }
      if (distEl && geo.district) distEl.value = geo.district;
      if (subdistEl && geo.subdistrict) subdistEl.value = geo.subdistrict;
      if (landmarkEl && geo.road) landmarkEl.value = `บริเวณ ${geo.road} (${geo.subdistrict || ''})`;
    });

    // Step Navigation
    document.getElementById('btnStep1Next')?.addEventListener('click', () => this.goToStep(2));
    document.getElementById('btnStep2Prev')?.addEventListener('click', () => this.goToStep(1));
    document.getElementById('btnStep2Next')?.addEventListener('click', () => this.goToStep(3));
    document.getElementById('btnStep3Prev')?.addEventListener('click', () => this.goToStep(2));
    document.getElementById('btnStep3Next')?.addEventListener('click', () => this.goToStep(4));
    document.getElementById('btnStep4Prev')?.addEventListener('click', () => this.goToStep(3));

    // Disaster Type Selector Cards
    document.querySelectorAll('.type-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // Urgency Pills
    document.querySelectorAll('.urgency-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.urgency-pill').forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        const radio = pill.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // Auto GPS Detect Button
    document.getElementById('btnAutoGps')?.addEventListener('click', () => {
      const status = document.getElementById('gpsStatusText');
      if (status) status.textContent = 'กำลังจับสัญญาณ GPS จากดาวเทียม...';

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            this.userDeviceLat = lat;
            this.userDeviceLng = lng;

            const latInput = document.getElementById('reportLat');
            const lngInput = document.getElementById('reportLng');
            if (latInput) latInput.value = lat.toFixed(5);
            if (lngInput) lngInput.value = lng.toFixed(5);

            this.mapManager.setPickerLocation(lat, lng);

            // Auto reverse geocode
            const geo = await disasterApiService.reverseGeocode(lat, lng);
            const provEl = document.getElementById('reportProvince');
            const distEl = document.getElementById('reportDistrict');
            const subdistEl = document.getElementById('reportSubdistrict');
            if (distEl && geo.district) distEl.value = geo.district;
            if (subdistEl && geo.subdistrict) subdistEl.value = geo.subdistrict;

            if (status) status.innerHTML = `<span class="text-green">✓ ตรวจพบพิกัดสด (${lat.toFixed(4)}, ${lng.toFixed(4)}) - ${geo.district} จ.${geo.province}</span>`;
            this.updateLiveTrustScore();
          },
          async (err) => {
            // Fallback realistic coordinates
            const fallbackLat = 20.4325;
            const fallbackLng = 99.8805;
            this.userDeviceLat = fallbackLat;
            this.userDeviceLng = fallbackLng;
            if (status) status.innerHTML = `<span class="text-green">✓ ตรวจพบพิกัดจำลอง อ.แม่สาย (20.4325, 99.8805)</span>`;
            this.updateLiveTrustScore();
          }
        );
      }
    });

    // Citizen ID input validation
    const idInput = document.getElementById('reporterCitizenId');
    idInput?.addEventListener('input', () => {
      const val = idInput.value.replace(/\D/g, '');
      const badge = document.getElementById('idValidityBadge');
      const isValid = validateThaiCitizenId(val);

      if (badge) {
        if (isValid) {
          badge.innerHTML = `<span class="badge-valid-pill">✓ รูปแบบถูกต้อง</span>`;
        } else if (val.length === 13) {
          badge.innerHTML = `<span class="badge-invalid-pill">⚠️ Checksum ไม่ถูกต้อง</span>`;
        } else {
          badge.innerHTML = `<span style="font-size: 0.7rem; color: #64748b;">${val.length}/13 หลัก</span>`;
        }
      }
      this.updateLiveTrustScore();
    });

    // Send OTP Simulation
    const btnSendOtp = document.getElementById('btnSendOtp');
    btnSendOtp?.addEventListener('click', () => {
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpInput = document.getElementById('reporterOtp');
      const otpBadge = document.getElementById('otpStatusBadge');

      if (otpInput) otpInput.value = randomOtp;
      if (otpBadge) {
        otpBadge.textContent = '✓ ยืนยัน OTP สำเร็จ';
        otpBadge.className = 'otp-badge verified';
      }
      this.otpVerified = true;
      soundManager.playSuccessChime();
      this.showToast(`[SMS Gateway] รหัส OTP ของท่านคือ ${randomOtp} (ยืนยันอัตโนมัติแล้ว)`, 'success');
      this.updateLiveTrustScore();
    });

    // NLP live check on description
    const descInput = document.getElementById('reportDescription');
    descInput?.addEventListener('input', () => {
      const nlp = analyzeTextIntegrity('', descInput.value);
      const hint = document.getElementById('nlpPreviewHint');
      if (hint) {
        if (nlp.isSpam || nlp.hasPanicTrigger) {
          hint.innerHTML = `<i data-lucide="alert-triangle"></i> AI Anomaly Detector: <span class="text-red">⚠️ ตรวจพบคำต้องสงสัย "${nlp.matchedSpam.join(', ')}" ซึ่งอาจถูกปรับลดคะแนน</span>`;
        } else {
          hint.innerHTML = `<i data-lucide="sparkles"></i> AI Spam & Anomaly Checker: <span class="text-green">✓ ข้อความสมบูรณ์ ชัดเจน ไม่พบคำส่อเจตนาลวง</span>`;
        }
        this.renderIcons();
      }
      this.updateLiveTrustScore();
    });

    // Photo Dropzone Simulation
    const dropzone = document.getElementById('photoDropzone');
    const photoInput = document.getElementById('reportPhotoInput');
    const photoBox = document.getElementById('photoPreviewBox');
    const dropContent = document.getElementById('dropzoneContent');
    const previewImg = document.getElementById('photoPreviewImg');
    const btnRemovePhoto = document.getElementById('btnRemovePhoto');

    dropzone?.addEventListener('click', (e) => {
      if (e.target !== btnRemovePhoto) {
        photoInput?.click();
      }
    });

    photoInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (previewImg) previewImg.src = ev.target?.result;
          if (photoBox) photoBox.classList.remove('hidden');
          if (dropContent) dropContent.classList.add('hidden');
          this.photoAttached = true;
          this.updateLiveTrustScore();
          this.showToast('อัปโหลดภาพถ่ายหลักฐานและตรวจสอบ EXIF แล้ว (+15% คะแนนความน่าเชื่อถือ)', 'success');
        };
        reader.readAsDataURL(file);
      }
    });

    btnRemovePhoto?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (photoInput) photoInput.value = '';
      if (photoBox) photoBox.classList.add('hidden');
      if (dropContent) dropContent.classList.remove('hidden');
      this.photoAttached = false;
      this.updateLiveTrustScore();
    });

    // Form Submission
    const reportForm = document.getElementById('citizenReportForm');
    reportForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCitizenFormSubmit();
    });
  }

  goToStep(step) {
    this.currentStep = step;

    document.querySelectorAll('.wizard-pane').forEach((p, idx) => {
      p.classList.toggle('active', idx + 1 === step);
    });

    document.querySelectorAll('.step-node').forEach(node => {
      const s = parseInt(node.getAttribute('data-step'), 10);
      node.classList.toggle('active', s === step);
      node.classList.toggle('completed', s < step);
    });

    if (step === 2) {
      this.mapManager.invalidateSize();
    }
  }

  updateLiveTrustScore() {
    const citizenId = document.getElementById('reporterCitizenId')?.value || '';
    const phone = document.getElementById('reporterPhone')?.value || '';
    const desc = document.getElementById('reportDescription')?.value || '';
    const lat = parseFloat(document.getElementById('reportLat')?.value || 0);
    const lng = parseFloat(document.getElementById('reportLng')?.value || 0);

    const reportData = {
      citizenId,
      reporterPhone: phone,
      title: document.getElementById('reportTitle')?.value || '',
      description: desc,
      lat,
      lng,
      deviceLat: this.userDeviceLat,
      deviceLng: this.userDeviceLng,
      otpVerified: this.otpVerified,
      hasPhoto: this.photoAttached
    };

    const evaluation = evaluateReportTrust(
      reportData,
      storageManager.getIncidents(),
      storageManager.getBlacklist()
    );

    const scoreEl = document.getElementById('liveTrustScoreVal');
    const fillEl = document.getElementById('liveTrustProgressFill');
    const factorsEl = document.getElementById('liveTrustFactors');

    if (scoreEl) scoreEl.textContent = `${evaluation.trustScore} / 100`;
    if (fillEl) {
      fillEl.style.width = `${evaluation.trustScore}%`;
      fillEl.className = `score-progress-fill ${evaluation.trustLevel}`;
    }

    if (factorsEl) {
      factorsEl.innerHTML = evaluation.flags.map(f => {
        const isPos = f.impact > 0;
        return `<span class="factor-tag ${isPos ? 'valid' : 'invalid'}">${isPos ? '✓' : '⚠️'} ${f.label} (${isPos ? '+' : ''}${f.impact})</span>`;
      }).join('');
    }
  }

  handleCitizenFormSubmit() {
    const type = document.querySelector('input[name="reportType"]:checked')?.value || 'flood';
    const urgency = parseInt(document.querySelector('input[name="reportUrgency"]:checked')?.value || '3', 10);
    const province = document.getElementById('reportProvince')?.value || 'เชียงราย';
    const district = document.getElementById('reportDistrict')?.value || 'แม่สาย';
    const subdistrict = document.getElementById('reportSubdistrict')?.value || '';
    const landmark = document.getElementById('reportLandmark')?.value || '';
    const lat = parseFloat(document.getElementById('reportLat')?.value || 20.4325);
    const lng = parseFloat(document.getElementById('reportLng')?.value || 99.8805);
    const title = document.getElementById('reportTitle')?.value || 'แจ้งเหตุด่วน';
    const desc = document.getElementById('reportDescription')?.value || '';
    const victims = parseInt(document.getElementById('reportVictimsCount')?.value || '0', 10);
    const reporterName = document.getElementById('reporterName')?.value || 'ประชาชนผู้แจ้ง';
    const phone = document.getElementById('reporterPhone')?.value || '';
    const citizenId = document.getElementById('reporterCitizenId')?.value || '';

    const typeIcons = {
      flood: '🌊',
      landslide: '⛰️',
      fire: '🔥',
      storm: '🌪️',
      earthquake: '⚡',
      chemical: '☣️'
    };

    const typeNames = {
      flood: 'อุทกภัย (น้ำท่วม)',
      landslide: 'ดินโคลนถล่ม',
      fire: 'อัคคีภัย / ไฟไหม้',
      storm: 'วาตภัย / พายุ',
      earthquake: 'แผ่นดินไหว',
      chemical: 'สารเคมีรั่วไหล'
    };

    const reportData = {
      id: `CIT-${Date.now().toString().slice(-4)}`,
      type,
      typeName: typeNames[type] || 'เหตุฉุกเฉิน',
      typeIcon: typeIcons[type] || '⚠️',
      title,
      description: desc,
      province,
      district,
      subdistrict,
      landmark,
      lat,
      lng,
      deviceLat: this.userDeviceLat,
      deviceLng: this.userDeviceLng,
      otpVerified: this.otpVerified,
      hasPhoto: this.photoAttached,
      victimsCount: victims,
      reporterName,
      reporterPhone: phone,
      citizenId,
      reportedAt: 'เมื่อสักครู่',
      timestamp: Date.now()
    };

    // Run full Anti-Fake Engine
    const evaluation = evaluateReportTrust(
      reportData,
      storageManager.getIncidents(),
      storageManager.getBlacklist()
    );

    reportData.trustScore = evaluation.trustScore;
    reportData.trustLevel = evaluation.trustLevel;
    reportData.flags = evaluation.flags;
    reportData.status = 'pending';

    if (evaluation.trustScore >= 80) {
      // High trust: directly add to verified incidents
      reportData.severity = urgency;
      reportData.severityLabel = urgency === 4 ? 'วิกฤตสูงสุด (ระดับ 4)' : 'วิกฤต (ระดับ 3)';
      reportData.dispatchedUnits = ['หน่วยตอบโต้ภัยพิบัติเร็ว อปท.'];
      reportData.dangerRadiusMeters = 1000;
      
      storageManager.addIncident(reportData);
      this.renderMapIncidentsList();

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      soundManager.playSuccessChime();
      this.showToast('🎉 ส่งรายงานสำเร็จ! ข้อมูลได้รับความน่าเชื่อถือสูง (Trust Score ' + evaluation.trustScore + '%) และเชื่อมต่อศูนย์สั่งการทันที', 'success');
    } else {
      // Medium or low trust: route to Triage queue for officer review
      storageManager.addTriageItem(reportData);
      this.renderTriageQueueList();

      if (evaluation.trustScore < 40) {
        soundManager.playDispatchBeep();
        this.showToast('⚠️ ข้อมูลของท่านถูกส่งเข้าคิวตรวจสอบพิเศษ เนื่องจากคะแนนความน่าเชื่อถือต่ำ (' + evaluation.trustScore + '%)', 'warning');
      } else {
        soundManager.playSuccessChime();
        this.showToast('✓ ส่งข้อมูลเข้าสู่ระบบเรียบร้อยแล้ว อยู่ระหว่างเจ้าหน้าที่ตรวจสอบยืนยัน', 'info');
      }
    }

    // Reset Form to Step 1
    this.goToStep(1);
    this.switchTab('tab-map');
  }

  // ----------------------------------------------------
  // EMERGENCY CELL BROADCAST SIMULATOR
  // ----------------------------------------------------
  initBroadcastSimulator() {
    this.renderBroadcastLogs();

    const broadcastForm = document.getElementById('broadcastForm');
    const headlineInput = document.getElementById('broadcastHeadline');
    const bodyInput = document.getElementById('broadcastBody');
    const previewHeadline = document.getElementById('phonePreviewHeadline');
    const previewMessage = document.getElementById('phonePreviewMessage');
    const btnTestSiren = document.getElementById('btnTestBroadcastSiren');
    const btnPhoneAck = document.getElementById('btnPhoneAck');

    // Realtime Sync to Phone Frame
    headlineInput?.addEventListener('input', (e) => {
      if (previewHeadline) previewHeadline.textContent = e.target.value;
    });

    bodyInput?.addEventListener('input', (e) => {
      if (previewMessage) previewMessage.textContent = e.target.value;
    });

    // Siren Test
    btnTestSiren?.addEventListener('click', () => {
      soundManager.playEmergencySiren(4);
      this.showToast('🔊 กำลังทดสอบเสียงไซเรนฉุกเฉินระดับชาติ (EAS Tone)', 'warning');
    });

    // Phone Acknowledge Button
    btnPhoneAck?.addEventListener('click', () => {
      const alertBox = document.getElementById('phoneAlertBox');
      if (alertBox) {
        alertBox.style.opacity = '0.5';
        setTimeout(() => alertBox.style.opacity = '1', 1000);
      }
      this.showToast('ผู้ใช้โทรศัพท์มือถือกดยืนยันรับทราบข้อความเตือนภัยแล้ว (Acknowledge)', 'success');
    });

    // Send Broadcast Submit
    broadcastForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      const level = document.getElementById('broadcastLevel')?.value || 'severe';
      const targetArea = document.getElementById('broadcastTargetArea')?.selectedOptions[0]?.text || 'อ.แม่สาย จ.เชียงราย';
      const headline = headlineInput?.value || '[ปภ. เตือนภัยฉุกเฉิน]';
      const body = bodyInput?.value || '';

      const channels = [];
      if (document.getElementById('chkCellBroadcast')?.checked) channels.push('Cell Broadcast 5G/4G');
      if (document.getElementById('chkSms')?.checked) channels.push('SMS Push');
      if (document.getElementById('chkLineAlert')?.checked) channels.push('LINE Alert');

      const log = {
        id: `BC-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString('th-TH') + ' ICT',
        level,
        levelLabel: level === 'extreme' ? '🔴 ระดับสูงสุด (Extreme)' : '🟠 ระดับรุนแรง (Severe)',
        targetArea,
        headline,
        channels: channels.length > 0 ? channels : ['Cell Broadcast'],
        status: 'กระจายสัญญาณสำเร็จ 100% (เสาสัญญาณครอบคลุม)'
      };

      storageManager.addBroadcastLog(log);
      this.renderBroadcastLogs();

      // Trigger siren sound and visual phone shake
      soundManager.playEmergencySiren(5);

      const phoneAlert = document.getElementById('phoneAlertBox');
      if (phoneAlert) {
        phoneAlert.classList.remove('bounce-anim');
        void phoneAlert.offsetWidth; // Trigger reflow
        phoneAlert.classList.add('bounce-anim');
      }

      this.showToast(`📡 ส่งสัญญาณ Cell Broadcast ไปยัง ${targetArea} สำเร็จเรียบร้อย!`, 'error');
    });
  }

  renderBroadcastLogs() {
    const tbody = document.getElementById('broadcastLogsBody');
    if (!tbody) return;

    const logs = storageManager.getBroadcastLogs();
    tbody.innerHTML = '';

    logs.forEach(log => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-mono">${log.timestamp}</td>
        <td><strong>${log.levelLabel || log.level}</strong></td>
        <td>${log.targetArea}</td>
        <td>${log.headline}</td>
        <td>${Array.isArray(log.channels) ? log.channels.join(', ') : log.channels}</td>
        <td><span class="text-green">${log.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ----------------------------------------------------
  // SHELTERS & EVACUATION VIEW
  // ----------------------------------------------------
  initSheltersView() {
    this.renderSheltersList();

    document.getElementById('btnOpenNewShelter')?.addEventListener('click', () => {
      const name = prompt('กรุณาระบุชื่อศูนย์พักพิงชั่วคราวใหม่:');
      if (name) {
        const shelters = storageManager.getShelters();
        shelters.unshift({
          id: `SHL-${Date.now().toString().slice(-3)}`,
          name,
          province: 'เชียงราย',
          district: 'แม่สาย',
          address: 'อ.แม่สาย จ.เชียงราย',
          lat: 20.4200 + (Math.random() - 0.5) * 0.05,
          lng: 99.8800 + (Math.random() - 0.5) * 0.05,
          capacity: 500,
          currentOccupancy: 0,
          status: 'open',
          contactPerson: 'เจ้าหน้าที่ อปท. ประจำศูนย์',
          phone: '053-731-999',
          supplies: {
            drinkingWaterLiters: 2000,
            foodBoxes: 600,
            medicalKits: 100,
            blankets: 400
          },
          hasMedicalTeam: true,
          hasPetZone: true
        });
        storageManager.saveShelters(shelters);
        this.renderSheltersList();
        this.showToast(`เพิ่มศูนย์พักพิง "${name}" สำเร็จ`, 'success');
      }
    });
  }

  renderSheltersList() {
    const grid = document.getElementById('sheltersListGrid');
    if (!grid) return;

    const shelters = storageManager.getShelters();
    grid.innerHTML = '';

    let totalCap = 0;
    let totalOcc = 0;
    let totalFood = 0;

    shelters.forEach(shl => {
      totalCap += shl.capacity;
      totalOcc += shl.currentOccupancy;
      totalFood += shl.supplies?.foodBoxes || 0;

      const pct = Math.round((shl.currentOccupancy / shl.capacity) * 100);
      const isFull = pct >= 90;
      const fillClass = isFull ? 'bg-red' : pct >= 65 ? 'bg-amber' : 'bg-green';

      const card = document.createElement('div');
      card.className = 'shelter-card';
      card.innerHTML = `
        <div class="shelter-card-header">
          <div>
            <div class="shelter-name">${shl.name}</div>
            <div class="shelter-location">📍 ${shl.address}</div>
          </div>
          <span class="shelter-status-tag ${isFull ? 'full' : 'open'}">
            ${isFull ? 'เต็มพิกัด (FULL)' : 'เปิดรับผู้ประสบภัย'}
          </span>
        </div>

        <div class="shelter-cap-section">
          <div class="cap-labels">
            <span>ความจุผู้พักพิง:</span>
            <strong class="font-mono">${shl.currentOccupancy} / ${shl.capacity} คน (${pct}%)</strong>
          </div>
          <div class="cap-bar-track">
            <div class="cap-bar-fill" style="width: ${pct}%; background: ${isFull ? '#ff334b' : '#00e676'};"></div>
          </div>
        </div>

        <div class="shelter-supplies-grid">
          <div class="supply-item"><span>💧 น้ำดื่ม:</span> <strong>${shl.supplies?.drinkingWaterLiters || 0} ลิตร</strong></div>
          <div class="supply-item"><span>🍱 อาหารกล่อง:</span> <strong>${shl.supplies?.foodBoxes || 0} ชุด</strong></div>
          <div class="supply-item"><span>💊 ชุดปฐมพยาบาล:</span> <strong>${shl.supplies?.medicalKits || 0} กล่อง</strong></div>
          <div class="supply-item"><span>🛏️ ผ้าห่ม/ที่นอน:</span> <strong>${shl.supplies?.blankets || 0} ผืน</strong></div>
        </div>

        <div class="shelter-actions">
          <button class="btn-shelter-action" data-checkin="${shl.id}">+ ลงทะเบียนเข้าพัก</button>
          <a href="tel:${shl.phone}" class="btn-shelter-action" style="text-decoration: none;">📞 โทรประสานงาน</a>
        </div>
      `;

      grid.appendChild(card);
    });

    // Update Summary counters
    const capEl = document.getElementById('totalCapacityCount');
    const occEl = document.getElementById('totalOccupantsCount');
    const foodEl = document.getElementById('foodRationsCount');
    const shlCountEl = document.getElementById('totalSheltersCount');

    if (capEl) capEl.textContent = totalCap.toLocaleString();
    if (occEl) occEl.textContent = totalOcc.toLocaleString();
    if (foodEl) foodEl.textContent = totalFood.toLocaleString();
    if (shlCountEl) shlCountEl.textContent = shelters.length;

    // Checkin click handler
    grid.querySelectorAll('[data-checkin]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-checkin');
        const shls = storageManager.getShelters();
        const shl = shls.find(s => s.id === id);
        if (shl && shl.currentOccupancy < shl.capacity) {
          shl.currentOccupancy += 5;
          storageManager.saveShelters(shls);
          this.renderSheltersList();
          soundManager.playSuccessChime();
          this.showToast(`ลงทะเบียนผู้ประสบภัย +5 คน เข้าศูนย์ ${shl.name} แล้ว`, 'success');
        } else {
          this.showToast('ศูนย์พักพิงนี้เต็มความจุแล้ว กรุณาส่งต่อไปยังศูนย์ใกล้เคียง', 'warning');
        }
      });
    });
  }

  // ----------------------------------------------------
  // MODALS & OVERLAYS (SOS, CCTV, DISPATCH)
  // ----------------------------------------------------
  initModals() {
    // Quick SOS Modal
    const btnQuickSos = document.getElementById('btnQuickSos');
    const sosModal = document.getElementById('sosModalOverlay');
    const btnCloseSos = document.getElementById('btnCloseSosModal');
    const btnConfirmSos = document.getElementById('btnConfirmSos');

    btnQuickSos?.addEventListener('click', () => {
      if (sosModal) sosModal.classList.remove('hidden');
      soundManager.playEmergencySiren(2);
    });

    btnCloseSos?.addEventListener('click', () => {
      if (sosModal) sosModal.classList.add('hidden');
    });

    btnConfirmSos?.addEventListener('click', () => {
      const desc = document.getElementById('sosQuickDesc')?.value || 'ขอความช่วยเหลือด่วน';
      const phone = document.getElementById('sosQuickPhone')?.value || '0812345678';

      const sosIncident = {
        id: `SOS-${Date.now().toString().slice(-4)}`,
        type: 'flood',
        typeName: '🚨 สัญญาณขอความช่วยเหลือเร่งด่วน (SOS)',
        typeIcon: '🚨',
        title: `[SOS ด่วนที่สุด] ${desc.slice(0, 45)}`,
        description: `ผู้ประสบภัยกดสัญญาณ SOS ฉุกเฉิน: "${desc}" โทรติดต่อกลับด่วน: ${phone}`,
        province: 'เชียงราย',
        district: 'แม่สาย',
        subdistrict: 'เวียงพางคำ',
        landmark: 'สัญญาณพิกัด GPS อัตโนมัติ',
        lat: 20.4325 + (Math.random() - 0.5) * 0.005,
        lng: 99.8805 + (Math.random() - 0.5) * 0.005,
        severity: 4,
        severityLabel: 'วิกฤตสูงสุด (ระดับ 4)',
        status: 'dispatched',
        reportedAt: 'เมื่อสักครู่',
        timestamp: Date.now(),
        reporterName: 'ผู้ประสบภัย (สัญญาณ SOS)',
        reporterPhone: phone,
        citizenId: '1103702456891',
        trustScore: 99,
        dispatchedUnits: ['หน่วยกู้ชีพ 1669', 'เรือท้องแบน ปภ.'],
        victimsCount: 2,
        dangerRadiusMeters: 500
      };

      storageManager.addIncident(sosIncident);
      this.renderMapIncidentsList();

      if (sosModal) sosModal.classList.add('hidden');
      soundManager.playDispatchBeep();
      this.showToast('🚨 ส่งสัญญาณ SOS เข้าศูนย์บัญชาการ ปภ. และส่งหน่วยกู้ชีพ 1669 ทันที!', 'error');
      this.switchTab('tab-map');
    });

    // CCTV Modal Close & Snapshot
    document.getElementById('btnCloseCctvModal')?.addEventListener('click', () => {
      document.getElementById('cctvModalOverlay')?.classList.add('hidden');
    });

    document.getElementById('btnSnapshotCctv')?.addEventListener('click', () => {
      this.showToast('📷 บันทึกภาพ Snapshot จากกล้อง CCTV เข้าสู่ระบบบันทึกหลักฐานแล้ว', 'success');
    });

    // Dispatch Modal
    const dispatchModal = document.getElementById('dispatchModalOverlay');
    document.getElementById('btnCloseDispatchModal')?.addEventListener('click', () => {
      if (dispatchModal) dispatchModal.classList.add('hidden');
    });
    document.getElementById('btnCancelDispatch')?.addEventListener('click', () => {
      if (dispatchModal) dispatchModal.classList.add('hidden');
    });

    document.getElementById('btnConfirmDispatch')?.addEventListener('click', () => {
      if (this.selectedDispatchIncident) {
        soundManager.playDispatchBeep();
        this.showToast(`🚚 สั่งการระดมทีมกู้ภัยเข้าพื้นที่ "${this.selectedDispatchIncident.title}" สำเร็จ`, 'success');
      }
      if (dispatchModal) dispatchModal.classList.add('hidden');
    });
  }

  openDispatchModal(incident) {
    this.selectedDispatchIncident = incident;
    const modal = document.getElementById('dispatchModalOverlay');
    const titleEl = document.getElementById('dispatchIncidentTitle');
    if (titleEl) titleEl.textContent = `เหตุการณ์: ${incident.title} (${incident.district} จ.${incident.province})`;
    if (modal) modal.classList.remove('hidden');
  }

  // ----------------------------------------------------
  // SUPABASE CLOUD DATABASE INTEGRATION
  // ----------------------------------------------------
  initSupabaseSync() {
    this.updateSupabaseStatusUI();

    if (supabaseService.isConnected) {
      // Pull latest from cloud and setup realtime
      storageManager.pullFromCloud().then(res => {
        if (res) {
          this.renderMapIncidentsList();
          this.renderTriageQueueList();
          this.showToast('ซิงค์ข้อมูลล่าสุดจาก Supabase Cloud Database เรียบร้อย', 'success');
        }
      });

      // Realtime listener
      supabaseService.subscribeToIncidents(() => {
        storageManager.pullFromCloud().then(() => {
          this.renderMapIncidentsList();
          this.showToast('⚡ มีข้อมูลภัยพิบัติอัปเดตแบบ Realtime จาก Supabase Cloud', 'info');
        });
      });
    }
  }

  updateSupabaseStatusUI() {
    const statusLabel = document.getElementById('supabaseStatusLabel');
    const modalBadge = document.getElementById('supabaseModalStatusBadge');
    const isConnected = supabaseService.isConnected;

    if (statusLabel) {
      statusLabel.innerHTML = isConnected 
        ? `<span style="color: #10b981; font-weight: 700;">● Cloud ต่อแล้ว</span>`
        : `<span>Supabase: ออฟไลน์</span>`;
    }

    if (modalBadge) {
      if (isConnected) {
        modalBadge.className = 'badge-valid-pill';
        modalBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        modalBadge.style.color = '#10b981';
        modalBadge.textContent = '🟢 เชื่อมต่อ Supabase Cloud Database แล้ว';
      } else {
        modalBadge.className = 'badge-valid-pill';
        modalBadge.style.background = '#f1f5f9';
        modalBadge.style.color = '#64748b';
        modalBadge.textContent = '⚪ โหมดออฟไลน์ / LocalStorage';
      }
    }
  }

  initSupabaseModal() {
    const btnOpen = document.getElementById('btnOpenSupabaseModal');
    const modal = document.getElementById('supabaseModalOverlay');
    const btnClose = document.getElementById('btnCloseSupabaseModal');
    const btnCancel = document.getElementById('btnCancelSupabase');
    const btnSave = document.getElementById('btnSaveConnectSupabase');
    const btnCopySql = document.getElementById('btnCopySqlSchema');

    const inputUrl = document.getElementById('inputSupabaseUrl');
    const inputKey = document.getElementById('inputSupabaseAnonKey');

    btnOpen?.addEventListener('click', () => {
      if (inputUrl) inputUrl.value = supabaseService.config.url || '';
      if (inputKey) inputKey.value = supabaseService.config.anonKey || '';
      this.updateSupabaseStatusUI();
      if (modal) modal.classList.remove('hidden');
    });

    btnClose?.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });

    btnCancel?.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });

    btnSave?.addEventListener('click', async () => {
      const url = inputUrl?.value.trim() || '';
      const key = inputKey?.value.trim() || '';

      if (!url || !key) {
        alert('กรุณากรอกทั้ง Supabase URL และ Public Anon Key');
        return;
      }

      btnSave.disabled = true;
      btnSave.textContent = 'กำลังทดสอบการเชื่อมต่อ...';

      supabaseService.saveConfig(url, key, true);
      const testRes = await supabaseService.testConnection();

      btnSave.disabled = false;
      btnSave.innerHTML = `<i data-lucide="check"></i> บันทึกและทดสอบเชื่อมต่อ`;
      this.renderIcons();

      if (testRes.success) {
        this.updateSupabaseStatusUI();
        this.showToast(testRes.message, 'success');
        
        // Sync existing local incidents to Cloud
        await storageManager.syncToCloud();
        await storageManager.pullFromCloud();
        this.renderMapIncidentsList();

        if (modal) modal.classList.add('hidden');
      } else {
        alert(testRes.message);
        this.showToast(testRes.message, 'error');
      }
    });

    btnCopySql?.addEventListener('click', () => {
      const sqlSchema = `-- DISASTER ALERT DASHBOARD SUPABASE SCHEMA
CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  type_name TEXT NOT NULL,
  type_icon TEXT DEFAULT '⚠️',
  title TEXT NOT NULL,
  description TEXT,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  subdistrict TEXT,
  landmark TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  severity INT DEFAULT 3,
  severity_label TEXT DEFAULT 'วิกฤต (ระดับ 3)',
  status TEXT DEFAULT 'verified',
  reported_at TEXT DEFAULT 'เมื่อสักครู่',
  timestamp BIGINT,
  reporter_name TEXT,
  reporter_phone TEXT,
  citizen_id TEXT,
  trust_score INT DEFAULT 85,
  is_fake BOOLEAN DEFAULT FALSE,
  dispatched_units JSONB DEFAULT '[]'::jsonb,
  victims_count INT DEFAULT 0,
  danger_radius_meters INT DEFAULT 1000,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.triage_reports (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  type_name TEXT NOT NULL,
  type_icon TEXT DEFAULT '⚠️',
  title TEXT NOT NULL,
  description TEXT,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  subdistrict TEXT,
  landmark TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  reported_at TEXT DEFAULT 'เมื่อสักครู่',
  timestamp BIGINT,
  reporter_name TEXT,
  reporter_phone TEXT,
  citizen_id TEXT,
  ip_address TEXT,
  trust_score INT DEFAULT 50,
  trust_level TEXT DEFAULT 'medium',
  fake_probability INT DEFAULT 50,
  status TEXT DEFAULT 'pending',
  flags JSONB DEFAULT '[]'::jsonb,
  cluster_consensus INT DEFAULT 1,
  recommended_action TEXT DEFAULT 'request_investigate',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public all access on incidents" ON public.incidents;
CREATE POLICY "Public all access on incidents" ON public.incidents FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public all access on triage_reports" ON public.triage_reports;
CREATE POLICY "Public all access on triage_reports" ON public.triage_reports FOR ALL USING (true) WITH CHECK (true);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'incidents') THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents, public.triage_reports; END IF; END $$;`;

      navigator.clipboard.writeText(sqlSchema).then(() => {
        this.showToast('📋 คัดลอกคำสั่ง SQL Schema ไปยัง Clipboard แล้ว! นำไปวางใน Supabase SQL Editor ได้เลย', 'success');
      });
    });
  }

  // ----------------------------------------------------
  // EXPORT & RESET ACTIONS
  // ----------------------------------------------------
  initDataExportAndReset() {
    // Reset Data
    document.getElementById('btnResetData')?.addEventListener('click', () => {
      if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นสำหรับเดโม่ใช่หรือไม่?')) {
        storageManager.resetToDefaults();
        this.renderMapIncidentsList();
        this.renderTriageQueueList();
        this.renderSheltersList();
        this.renderBlacklist();
        this.renderBroadcastLogs();
        this.showToast('รีเซ็ตข้อมูลจำลองเรียบร้อยแล้ว', 'info');
      }
    });

    // Export Summary
    document.getElementById('btnExportSummary')?.addEventListener('click', () => {
      const data = {
        exportedAt: new Date().toISOString(),
        system: 'ระบบบริหารจัดการและแจ้งเตือนภัยพิบัติอัจฉริยะ (Disaster Alert Dashboard)',
        incidents: storageManager.getIncidents(),
        shelters: storageManager.getShelters(),
        broadcastLogs: storageManager.getBroadcastLogs()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `disaster_alert_report_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('ส่งออกรายงานสรุปสถานการณ์ (JSON) เรียบร้อย', 'success');
    });
  }

  // Dashboard top metrics counters
  refreshDashboardMetrics() {
    const incidents = storageManager.getIncidents();
    const triage = storageManager.getTriageItems();

    const crit = incidents.filter(i => i.severity === 4).length;
    const warn = incidents.filter(i => i.severity === 3 || i.severity === 2).length;

    let dispatchedTotal = 0;
    incidents.forEach(i => {
      if (i.dispatchedUnits) dispatchedTotal += i.dispatchedUnits.length;
    });

    const activeBadge = document.getElementById('activeIncidentsBadge');
    const triageBadge = document.getElementById('pendingVerifyBadge');
    const statCrit = document.getElementById('statCriticalCount');
    const statWarn = document.getElementById('statWarningCount');
    const statDisp = document.getElementById('statDispatchedCount');

    if (activeBadge) activeBadge.textContent = incidents.length;
    if (triageBadge) triageBadge.textContent = triage.length;
    if (statCrit) statCrit.textContent = crit;
    if (statWarn) statWarn.textContent = warn;
    if (statDisp) statDisp.textContent = dispatchedTotal;
  }
}

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new DisasterDashboardApp();
  app.init();
});
