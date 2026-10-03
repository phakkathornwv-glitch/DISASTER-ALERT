// ========================================================
// MAP MANAGER: LEAFLET CRISIS GIS & TACTICAL LAYERS
// ========================================================

import L from 'leaflet';

export class MapManager {
  constructor(onIncidentClick, onCctvClick) {
    this.map = null;
    this.pickerMap = null;
    this.pickerMarker = null;
    this.onIncidentClick = onIncidentClick;
    this.onCctvClick = onCctvClick;

    this.layers = {
      incidents: L.layerGroup(),
      shelters: L.layerGroup(),
      sensors: L.layerGroup(),
      cctv: L.layerGroup(),
      dangerZones: L.layerGroup()
    };
  }

  initMainMap(containerId = 'crisisMap') {
    if (this.map) return;

    // Center on Thailand (Default view on Chiang Rai / North where major flood is active)
    this.map = L.map(containerId, {
      center: [20.4325, 99.8805],
      zoom: 11,
      zoomControl: false
    });

    // Custom dark tactical base layer (CartoDB DarkMatter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | ปภ. GIS',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    // Reposition zoom controls
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Add layer groups to map
    Object.values(this.layers).forEach(layer => layer.addTo(this.map));
  }

  initPickerMap(containerId = 'pickerMap', initialLat = 20.4325, initialLng = 99.8805, onCoordChange) {
    if (this.pickerMap) return;

    const el = document.getElementById(containerId);
    if (!el) return;

    this.pickerMap = L.map(containerId, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(this.pickerMap);

    // Custom draggable marker
    const pinIcon = L.divIcon({
      className: 'picker-pin-icon',
      html: `<div style="font-size: 24px; filter: drop-shadow(0 0 6px #00d2ff);">📍</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    this.pickerMarker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: true
    }).addTo(this.pickerMap);

    this.pickerMarker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      if (onCoordChange) onCoordChange(pos.lat, pos.lng);
    });

    this.pickerMap.on('click', (e) => {
      this.pickerMarker.setLatLng(e.latlng);
      if (onCoordChange) onCoordChange(e.latlng.lat, e.latlng.lng);
    });
  }

  setPickerLocation(lat, lng) {
    if (this.pickerMap && this.pickerMarker) {
      this.pickerMarker.setLatLng([lat, lng]);
      this.pickerMap.panTo([lat, lng]);
    }
  }

  renderIncidents(incidents = []) {
    this.layers.incidents.clearLayers();
    this.layers.dangerZones.clearLayers();

    incidents.forEach(inc => {
      if (!inc.lat || !inc.lng) return;

      const sevColor = inc.severity === 4 ? '#ff334b' : inc.severity === 3 ? '#ff9100' : inc.severity === 2 ? '#ffd600' : '#00e676';

      // Incident Marker Pin
      const icon = L.divIcon({
        className: 'custom-hazard-marker',
        html: `
          <div style="
            position: relative;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: rgba(13, 21, 39, 0.95);
            border: 2px solid ${sevColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 0 14px ${sevColor};
            cursor: pointer;
          ">
            ${inc.typeIcon || '⚠️'}
            <div style="
              position: absolute;
              bottom: -4px;
              right: -4px;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: ${sevColor};
              border: 2px solid #fff;
            "></div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([inc.lat, inc.lng], { icon });

      marker.on('click', () => {
        if (this.onIncidentClick) this.onIncidentClick(inc);
      });

      marker.bindPopup(`
        <div style="font-family: 'Prompt', sans-serif; min-width: 220px;">
          <div style="font-size: 11px; color: ${sevColor}; font-weight: 700;">${inc.severityLabel}</div>
          <div style="font-size: 14px; font-weight: 700; color: #fff; margin: 4px 0;">${inc.title}</div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">📍 ${inc.district} จ.${inc.province}</div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.3;">${inc.description.slice(0, 90)}...</div>
          <div style="margin-top: 8px; font-size: 11px; color: #00d2ff; font-weight: 600;">คลิกเพื่อดูรายละเอียด / สั่งการ</div>
        </div>
      `);

      this.layers.incidents.addLayer(marker);

      // Danger Radius Circle
      if (inc.dangerRadiusMeters) {
        const circle = L.circle([inc.lat, inc.lng], {
          radius: inc.dangerRadiusMeters,
          color: sevColor,
          fillColor: sevColor,
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4'
        });
        this.layers.dangerZones.addLayer(circle);
      }
    });
  }

  renderShelters(shelters = []) {
    this.layers.shelters.clearLayers();

    shelters.forEach(shl => {
      const pct = Math.round((shl.currentOccupancy / shl.capacity) * 100);
      const isFull = pct >= 90;
      const statusColor = isFull ? '#ff334b' : '#00e676';

      const icon = L.divIcon({
        className: 'custom-shelter-marker',
        html: `
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 10px;
            background: #0d1527;
            border: 2px solid ${statusColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 0 10px ${statusColor}88;
            color: #fff;
          ">
            🏠
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([shl.lat, shl.lng], { icon });
      marker.bindPopup(`
        <div style="font-family: 'Prompt', sans-serif; min-width: 240px;">
          <div style="font-size: 11px; color: ${statusColor}; font-weight: 700;">ศูนย์พักพิง (${shl.status === 'open' ? 'เปิดบริการ' : 'เตรียมพร้อม'})</div>
          <div style="font-size: 14px; font-weight: 700; color: #fff; margin: 4px 0;">${shl.name}</div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">📍 ${shl.district} จ.${shl.province}</div>
          <div style="font-size: 12px; color: #cbd5e1;">ความจุ: <strong>${shl.currentOccupancy} / ${shl.capacity} คน</strong> (${pct}%)</div>
          <div style="font-size: 11px; color: #00d2ff; margin-top: 6px;">📞 โทร: ${shl.phone}</div>
        </div>
      `);

      this.layers.shelters.addLayer(marker);
    });
  }

  renderCctv(cctvs = []) {
    this.layers.cctv.clearLayers();

    cctvs.forEach(cam => {
      const icon = L.divIcon({
        className: 'custom-cctv-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #0a0f1d;
            border: 2px solid #00d2ff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 0 8px #00d2ff;
            cursor: pointer;
          ">
            📹
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([cam.lat, cam.lng], { icon });

      marker.on('click', () => {
        if (this.onCctvClick) this.onCctvClick(cam);
      });

      marker.bindPopup(`
        <div style="font-family: 'Prompt', sans-serif;">
          <div style="font-size: 11px; color: #00d2ff; font-weight: 700;">● LIVE CCTV FEED</div>
          <div style="font-size: 13px; font-weight: 700; color: #fff; margin: 4px 0;">${cam.name}</div>
          <div style="font-size: 11px; color: #94a3b8;">${cam.currentWaterLevel}</div>
          <div style="font-size: 11px; color: #00d2ff; margin-top: 6px; font-weight: 600;">คลิกเพื่อเปิดกล้องดูภาพสด</div>
        </div>
      `);

      this.layers.cctv.addLayer(marker);
    });
  }

  panToLocation(lat, lng, zoom = 14) {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  }

  toggleLayer(layerKey, isVisible) {
    if (!this.map || !this.layers[layerKey]) return;
    if (isVisible) {
      this.map.addLayer(this.layers[layerKey]);
    } else {
      this.map.removeLayer(this.layers[layerKey]);
    }
  }

  invalidateSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 200);
    }
    if (this.pickerMap) {
      setTimeout(() => this.pickerMap.invalidateSize(), 200);
    }
  }
}
