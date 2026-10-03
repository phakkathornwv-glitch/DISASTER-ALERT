// ========================================================
// ANTI-FAKE REPORTING & MULTI-FACTOR TRUST ENGINE
// ========================================================

/**
 * Validates a 13-digit Thai Citizen ID using the official Mod-11 Checksum Algorithm.
 * @param {string} id - 13-digit citizen ID string
 * @returns {boolean} true if checksum is mathematically valid
 */
export function validateThaiCitizenId(id) {
  if (!id) return false;
  const cleanId = String(id).replace(/\D/g, '');
  if (cleanId.length !== 13) return false;

  // Prevent obvious repeated digits (e.g. 0000000000000, 1111111111111)
  if (/^(\d)\1{12}$/.test(cleanId)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanId.charAt(i), 10) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(cleanId.charAt(12), 10);
}

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * AI / NLP Anomaly Detector for spam, prank words, and extreme panic rumors.
 */
export function analyzeTextIntegrity(title = '', description = '') {
  const combined = `${title} ${description}`.toLowerCase();
  
  const SPAM_KEYWORDS = [
    '5555', '555', 'เขื่อนแตก', 'ตายหมด', 'ชัวร์ๆ', 'รีบแชร์', 'กวนตีน', 'ล้อเล่น',
    'แกล้ง', 'มั่ว', 'fake', 'test1234', 'asdf', 'qwerty', 'จอมปลอม', 'โกหก',
    'hack', 'admin', 'น้ำท่วม 100 เมตร', 'สึนามิพัดเข้ากทม'
  ];

  const PANIC_TRIGGERS = ['เขื่อนแตก', 'สึนามิถล่มกทม', 'ตายยกลำ', 'ระเบิดนิวเคลียร์'];

  let matchedSpam = [];
  let isSpam = false;
  let hasPanicTrigger = false;

  SPAM_KEYWORDS.forEach(kw => {
    if (combined.includes(kw)) {
      matchedSpam.push(kw);
      isSpam = true;
    }
  });

  PANIC_TRIGGERS.forEach(kw => {
    if (combined.includes(kw)) {
      hasPanicTrigger = true;
    }
  });

  // Check excessive repetitive characters or exclamation marks
  const hasExcessiveExclamation = /[!?.]{4,}/.test(combined);
  const hasExcessiveRepeatedLetters = /(.)\1{5,}/.test(combined);
  const isTooShort = description.trim().length < 10;

  return {
    isSpam,
    hasPanicTrigger,
    hasExcessiveExclamation,
    hasExcessiveRepeatedLetters,
    isTooShort,
    matchedSpam,
    qualityScore: (!isSpam && !hasExcessiveExclamation && !isTooShort) ? 90 : 20
  };
}

/**
 * Evaluates an incident submission against all anti-fake rules
 * and computes a composite Trust Score (0 - 100).
 */
export function evaluateReportTrust(reportData, existingIncidents = [], blacklist = []) {
  const flags = [];
  let score = 50; // Neutral baseline

  // 1. Blacklist Check (Instant ban)
  const isBlacklisted = blacklist.some(b => 
    (b.target === reportData.citizenId) || 
    (b.target === reportData.reporterPhone?.replace(/\D/g, '')) ||
    (b.target === reportData.ipAddress)
  );

  if (isBlacklisted) {
    flags.push({ rule: 'blacklist_match', label: 'ผู้แจ้งอยู่ในบัญชีดำ (Blacklisted User/IP)', impact: -90 });
    return {
      trustScore: 5,
      trustLevel: 'low',
      fakeProbability: 99,
      status: 'rejected_blacklisted',
      flags,
      clusterConsensus: 1,
      recommendedAction: 'reject_blacklist'
    };
  }

  // 2. Thai Citizen ID Checksum
  const isIdValid = validateThaiCitizenId(reportData.citizenId);
  if (isIdValid) {
    score += 25;
    flags.push({ rule: 'id_valid', label: 'เลขบัตร ปชช. ถูกต้องตามมาตรฐาน ทร. (Mod-11)', impact: +25 });
  } else {
    score -= 30;
    flags.push({ rule: 'id_checksum_fail', label: 'เลขบัตร ปชช. ไม่ถูกต้องตามเกณฑ์ Checksum', impact: -30 });
  }

  // 3. OTP Verification Status
  if (reportData.otpVerified) {
    score += 20;
    flags.push({ rule: 'otp_verified', label: 'ผ่านการยืนยันรหัส OTP ทางเบอร์โทรศัพท์', impact: +20 });
  } else {
    score -= 10;
    flags.push({ rule: 'no_otp', label: 'ยังไม่ได้รับการยืนยันรหัส OTP', impact: -10 });
  }

  // 4. GPS Geofencing & Device Proximity Cross-Check
  if (reportData.deviceLat && reportData.deviceLng && reportData.lat && reportData.lng) {
    const distanceKm = calculateDistanceKm(
      reportData.deviceLat,
      reportData.deviceLng,
      reportData.lat,
      reportData.lng
    );

    if (distanceKm <= 5.0) {
      score += 20;
      flags.push({ rule: 'gps_proximity_ok', label: `พิกัด GPS อุปกรณ์อยู่ในจุดเกิดเหตุ (~${distanceKm.toFixed(1)} กม.)`, impact: +20 });
    } else if (distanceKm <= 25.0) {
      score += 5;
      flags.push({ rule: 'gps_proximity_moderate', label: `พิกัด GPS อุปกรณ์อยู่บริเวณใกล้เคียง (~${distanceKm.toFixed(1)} กม.)`, impact: +5 });
    } else {
      score -= 25;
      flags.push({ rule: 'gps_distance_mismatch', label: `พิกัด GPS อุปกรณ์อยู่ห่างจุดเกิดเหตุมาก (~${distanceKm.toFixed(0)} กม. เสี่ยงเป็นการปักหมุดเท็จ)`, impact: -25 });
    }
  } else {
    flags.push({ rule: 'no_gps', label: 'ไม่ได้เปิดแชร์ตำแหน่งพิกัด GPS สด', impact: -5 });
  }

  // 5. NLP Text Anomaly & Spam Analysis
  const nlp = analyzeTextIntegrity(reportData.title, reportData.description);
  if (nlp.isSpam || nlp.hasPanicTrigger) {
    score -= 35;
    flags.push({ rule: 'nlp_spam_detected', label: `AI ตรวจพบคำต้องสงสัย/สร้างความตระหนก: "${nlp.matchedSpam.join(', ')}"`, impact: -35 });
  } else if (nlp.hasExcessiveExclamation || nlp.hasExcessiveRepeatedLetters) {
    score -= 15;
    flags.push({ rule: 'nlp_suspicious_syntax', label: 'พบการใช้อักขระหรือเครื่องหมายเน้นย้ำผิดปกติ', impact: -15 });
  } else {
    score += 15;
    flags.push({ rule: 'nlp_coherent', label: 'เนื้อหาข้อความมีความสมบูรณ์ สอดคล้องกับภัยพิบัติ', impact: +15 });
  }

  // 6. Evidence Photos
  if (reportData.imageUrl || reportData.hasPhoto) {
    score += 15;
    flags.push({ rule: 'photo_evidence_attached', label: 'มีภาพถ่ายหลักฐานประกอบเหตุการณ์', impact: +15 });
  } else {
    score -= 5;
    flags.push({ rule: 'no_photo', label: 'ไม่มีภาพถ่ายหลักฐาน', impact: -5 });
  }

  // 7. Spatial Deduplication & Cluster Consensus
  let clusterCount = 1;
  if (existingIncidents && existingIncidents.length > 0) {
    existingIncidents.forEach(inc => {
      if (inc.lat && inc.lng && reportData.lat && reportData.lng) {
        const d = calculateDistanceKm(inc.lat, inc.lng, reportData.lat, reportData.lng);
        if (d <= 1.5 && inc.type === reportData.type) {
          clusterCount++;
        }
      }
    });
  }

  if (clusterCount >= 2) {
    score += 10;
    flags.push({ rule: 'cluster_consensus', label: `พบรายงานเหตุประเภทเดียวกันในรัศมีใกล้เคียง (${clusterCount} รายงาน)`, impact: +10 });
  }

  // Clamp Score to 0 - 100
  const finalScore = Math.max(0, Math.min(100, score));
  let trustLevel = 'medium';
  let fakeProb = Math.max(0, 100 - finalScore);
  let recommendedAction = 'request_investigate';

  if (finalScore >= 80) {
    trustLevel = 'high';
    recommendedAction = 'approve_dispatch';
  } else if (finalScore < 40) {
    trustLevel = 'low';
    recommendedAction = 'reject_blacklist';
  }

  return {
    trustScore: finalScore,
    trustLevel,
    fakeProbability: fakeProb,
    status: 'pending',
    flags,
    clusterConsensus: clusterCount,
    recommendedAction
  };
}
