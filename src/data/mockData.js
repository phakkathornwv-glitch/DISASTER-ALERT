// ========================================================
// MOCK DATA: THAI DISASTER SCENARIOS & TELEMETRY
// ========================================================

export const INITIAL_INCIDENTS = [
  {
    id: 'INC-2026-0891',
    type: 'flood',
    typeName: 'อุทกภัย (น้ำท่วมฉับพลัน)',
    typeIcon: '🌊',
    title: 'น้ำป่าทะลักท่วมชุมชนเกาะทรายและตลาดสายลมจอย',
    description: 'ระดับน้ำแม่น้ำสายเพิ่มสูงขึ้นอย่างรวดเร็ว ท่วมบ้านเรือนชั้น 1 สูงกว่า 1.20 เมตร กระแสน้ำเชี่ยว มีประชาชนติดค้างบนชั้น 2 จำนวนมาก ต้องการเรือท้องแบนช่วยเหลือด่วน',
    province: 'เชียงราย',
    district: 'แม่สาย',
    subdistrict: 'เวียงพางคำ',
    landmark: 'ตลาดสายลมจอย ซอย 4',
    lat: 20.4325,
    lng: 99.8805,
    severity: 4, // 1 to 4
    severityLabel: 'วิกฤตสูงสุด (ระดับ 4)',
    status: 'verified', // verified, investigating, dispatched, resolved
    reportedAt: '10 นาทีที่แล้ว',
    timestamp: Date.now() - 10 * 60 * 1000,
    reporterName: 'นายสมศักดิ์ ปัญญาดี',
    reporterPhone: '081-998-7654',
    citizenId: '1103702456891',
    trustScore: 95,
    isFake: false,
    dispatchedUnits: ['เรือท้องแบน ปภ. (3 ลำ)', 'หน่วยกู้ชีพ 1669', 'ทีมกู้ภัยสว่างศรัทธา'],
    victimsCount: 45,
    dangerRadiusMeters: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&auto=format&fit=crop'
  },
  {
    id: 'INC-2026-0888',
    type: 'landslide',
    typeName: 'ดินโคลนถล่มปิดทับเส้นทาง',
    typeIcon: '⛰️',
    title: 'ดินสไลด์ปิดทับทางหลวง 118 (เชียงใหม่-เชียงราย)',
    description: 'ฝนตกสะสมต่อเนื่องทำให้ดินไหล่เขาถล่มทับผิวจราจร 2 ช่องทาง รถทุกชนิดไม่สามารถผ่านได้ มีเสาไฟฟ้าล้มขวางทาง 3 ต้น ไม่มีผู้บาดเจ็บ',
    province: 'เชียงราย',
    district: 'เวียงป่าเป้า',
    subdistrict: 'แม่เจดีย์ใหม่',
    landmark: 'กม. 64+200 ทางหลวง 118',
    lat: 19.2314,
    lng: 99.5042,
    severity: 3,
    severityLabel: 'วิกฤต (ระดับ 3)',
    status: 'dispatched',
    reportedAt: '35 นาทีที่แล้ว',
    timestamp: Date.now() - 35 * 60 * 1000,
    reporterName: 'นายกิตติคุณ มั่งมี (แขวงทางหลวง)',
    reporterPhone: '053-712-345',
    citizenId: '3509900187452',
    trustScore: 98,
    isFake: false,
    dispatchedUnits: ['รถตักและเครื่องจักรกลหนัก แขวงทางหลวง', 'เจ้าหน้าที่ตำรวจทางหลวง 1193'],
    victimsCount: 0,
    dangerRadiusMeters: 800,
    imageUrl: 'https://images.unsplash.com/photo-1618265341355-d0e2d1fdf26b?w=500&auto=format&fit=crop'
  },
  {
    id: 'INC-2026-0884',
    type: 'earthquake',
    typeName: 'แผ่นดินไหว',
    typeIcon: '⚡',
    title: 'แผ่นดินไหวขนาด 4.8 แมกนิจูด อ.ปาย รู้สึกสั่นไหวชัดเจน',
    description: 'กรมอุตุนิยมวิทยาตรวจพบแผ่นดินไหวจุดศูนย์กลางที่ ต.เวียงใต้ อ.ปาย จ.แม่ฮ่องสอน ความลึก 5 กม. ประชาชนรู้สึกสั่นไหว ผนังอาคารเรียน รร.บ้านปาย มีรอยร้าวเล็กน้อย',
    province: 'แม่ฮ่องสอน',
    district: 'ปาย',
    subdistrict: 'เวียงใต้',
    landmark: 'บริเวณโรงเรียนบ้านปาย',
    lat: 19.3582,
    lng: 98.4389,
    severity: 3,
    severityLabel: 'วิกฤต (ระดับ 3)',
    status: 'verified',
    reportedAt: '1 ชั่วโมงที่แล้ว',
    timestamp: Date.now() - 60 * 60 * 1000,
    reporterName: 'ศูนย์เฝ้าระวังแผ่นดินไหว กรมอุตุฯ',
    reporterPhone: '02-399-4547',
    citizenId: '1100400876219',
    trustScore: 100,
    isFake: false,
    dispatchedUnits: ['ทีมวิศวกรตรวจสอบโครงสร้าง อปท.', 'เจ้าหน้าที่ ปภ. แม่ฮ่องสอน'],
    victimsCount: 0,
    dangerRadiusMeters: 5000,
    imageUrl: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?w=500&auto=format&fit=crop'
  },
  {
    id: 'INC-2026-0880',
    type: 'chemical',
    typeName: 'สารเคมีรั่วไหล / อัคคีภัย',
    typeIcon: '☣️',
    title: 'ไฟไหม้โกดังเก็บสารตัวทำละลาย นิคมอุตสาหกรรมบางปู',
    description: 'เกิดเพลิงไหม้รุนแรงในอาคารเก็บสารเคมี มีกลุ่มควันสีดำและกลิ่นฉุนกระจายตัว เจ้าหน้าที่สั่งอพยพประชาชนรัศมี 1 กม. ด้านท้ายลม',
    province: 'สมุทรปราการ',
    district: 'เมืองสมุทรปราการ',
    subdistrict: 'แพรกษา',
    landmark: 'ซอย 12 นิคมฯ บางปู',
    lat: 13.5298,
    lng: 100.6582,
    severity: 4,
    severityLabel: 'วิกฤตสูงสุด (ระดับ 4)',
    status: 'dispatched',
    reportedAt: '2 ชั่วโมงที่แล้ว',
    timestamp: Date.now() - 120 * 60 * 1000,
    reporterName: 'นายธีระพล อินทร์จันทร์ (ผจก.ความปลอดภัย)',
    reporterPhone: '089-112-9988',
    citizenId: '1101401982734',
    trustScore: 92,
    isFake: false,
    dispatchedUnits: ['รถดับเพลิงโฟม 5 คัน', 'ทีม Hazmat ปภ.', 'หน่วยกู้ชีพปราการ'],
    victimsCount: 12,
    dangerRadiusMeters: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&auto=format&fit=crop'
  },
  {
    id: 'INC-2026-0875',
    type: 'storm',
    typeName: 'วาตภัย / คลื่นลมแรง',
    typeIcon: '🌪️',
    title: 'คลื่นลมแรงซัดเรือประมงพื้นบ้านเกยตื้น หาดละไม',
    description: 'คลื่นทะเลสูง 2-3 เมตรซัดเข้าหาด เรือประมงพื้นบ้านได้รับความเสียหาย 4 ลำ ประชาชนและนักท่องเที่ยวปลอดภัย ธงแดงเตือนห้ามลงเล่นน้ำ',
    province: 'สุราษฎร์ธานี',
    district: 'เกาะสมุย',
    subdistrict: 'มะเร็ต',
    landmark: 'หาดละไม',
    lat: 9.4728,
    lng: 100.0489,
    severity: 2,
    severityLabel: 'เฝ้าระวัง (ระดับ 2)',
    status: 'verified',
    reportedAt: '3 ชั่วโมงที่แล้ว',
    timestamp: Date.now() - 180 * 60 * 1000,
    reporterName: 'นายสมพร ชาวเล',
    reporterPhone: '077-421-990',
    citizenId: '8840200192841',
    trustScore: 88,
    isFake: false,
    dispatchedUnits: ['เทศบาลนครเกาะสมุย', 'ตำรวจน้ำสมุย'],
    victimsCount: 0,
    dangerRadiusMeters: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop'
  },
  {
    id: 'INC-2026-0870',
    type: 'pm25',
    typeName: 'มลพิษทางอากาศ PM2.5',
    typeIcon: '🌫️',
    title: 'ค่าฝุ่น PM2.5 เกินเกณฑ์มาตรฐานระดับสีแดง (128 µg/m³)',
    description: 'ดัชนีคุณภาพอากาศ AQI พุ่งสูงเกินเกณฑ์ส่งผลกระทบต่อสุขภาพ แนะนำประชาชนงดกิจกรรมกลางแจ้งและสวมหน้ากาก N95 ทางจังหวัดจัดตั้งศูนย์ปฏิบัติการดับไฟป่า',
    province: 'น่าน',
    district: 'เมืองน่าน',
    subdistrict: 'ในเวียง',
    landmark: 'ศูนย์ราชการจังหวัดน่าน',
    lat: 18.7831,
    lng: 100.7782,
    severity: 2,
    severityLabel: 'เฝ้าระวัง (ระดับ 2)',
    status: 'verified',
    reportedAt: '4 ชั่วโมงที่แล้ว',
    timestamp: Date.now() - 240 * 60 * 1000,
    reporterName: 'สถานีตรวจวัดคุณภาพอากาศ คพ.',
    reporterPhone: '054-710-123',
    citizenId: '1100500123984',
    trustScore: 99,
    isFake: false,
    dispatchedUnits: ['รถฉีดพ่นละอองน้ำ อปท.', 'ชุดลาดตระเวนดับไฟป่า'],
    victimsCount: 0,
    dangerRadiusMeters: 8000,
    imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=500&auto=format&fit=crop'
  }
];

// Anti-Fake Triage Queue: Items flagged for officer inspection
export const INITIAL_TRIAGE_ITEMS = [
  {
    id: 'TRG-9021',
    type: 'flood',
    typeName: 'อุทกภัย (น้ำท่วม)',
    typeIcon: '🌊',
    title: 'เขื่อนภูมิพลแตกแล้ว น้ำจะท่วมถึงกรุงเทพฯ ใน 2 ชั่วโมง!!!',
    description: 'เขื่อนแตกแล้วทุกคนนนนน 555555 หนีเร็ว ตายหมดแน่ น้ำสูง 50 เมตร ชัวร์ๆ รีบแชร์ด่วนๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆ',
    province: 'กรุงเทพมหานคร',
    district: 'พระนคร',
    subdistrict: 'พระบรมมหาราชวัง',
    landmark: 'สนามหลวง',
    lat: 13.7563,
    lng: 100.5018,
    reportedAt: '4 นาทีที่แล้ว',
    timestamp: Date.now() - 4 * 60 * 1000,
    reporterName: 'Anonymous Troll 99',
    reporterPhone: '099-999-9999',
    citizenId: '1234567890123', // Invalid Thai ID checksum
    ipAddress: '180.183.21.99',
    trustScore: 12, // Very low trust score
    trustLevel: 'low',
    fakeProbability: 95,
    status: 'pending',
    flags: [
      { rule: 'id_checksum_fail', label: 'เลขบัตร ปชช. ไม่ผ่านเกณฑ์ Checksum (Mod-11)', impact: -30 },
      { rule: 'nlp_panic_words', label: 'AI ตรวจพบคำสร้างความตื่นตระหนก / สแปม / ข่าวลือเขื่อนแตก', impact: -25 },
      { rule: 'distance_mismatch', label: 'พิกัดแจ้งเหตุ (กทม.) ขัดแย้งกับข้ออ้างเขื่อนภูมิพล (>400 กม.)', impact: -20 },
      { rule: 'no_photo_evidence', label: 'ไม่มีภาพถ่ายยืนยันเหตุการณ์', impact: -10 }
    ],
    clusterConsensus: 1, // Only 1 report, no consensus
    recommendedAction: 'reject_blacklist'
  },
  {
    id: 'TRG-9020',
    type: 'fire',
    typeName: 'อัคคีภัย',
    typeIcon: '🔥',
    title: 'เพลิงไหม้หญ้าแห้งลุกลามใกล้ปั๊มน้ำมัน ปตท. แม่สาย',
    description: 'มีไฟไหม้หญ้าข้างทาง ลมพัดแรง ควันเริ่มลอยเข้าหาปั๊มน้ำมัน ห่างประมาณ 150 เมตร มีชาวบ้านพยายามช่วยกันดับแต่ไม่ไหว',
    province: 'เชียงราย',
    district: 'แม่สาย',
    subdistrict: 'โป่งผา',
    landmark: 'ริมถนนพหลโยธิน เยื้องปั๊ม ปตท. โป่งผา',
    lat: 20.3951,
    lng: 99.8710,
    reportedAt: '12 นาทีที่แล้ว',
    timestamp: Date.now() - 12 * 60 * 1000,
    reporterName: 'นายพงษ์ศักดิ์ รัตนเรือง',
    reporterPhone: '086-554-3210',
    citizenId: '1579900234128', // Valid Thai ID
    ipAddress: '223.24.18.52',
    trustScore: 86,
    trustLevel: 'high',
    fakeProbability: 8,
    status: 'pending',
    flags: [
      { rule: 'id_valid', label: 'เลขบัตร ปชช. ถูกต้องตามมาตรฐาน ทร.', impact: +25 },
      { rule: 'otp_verified', label: 'ผ่านการยืนยันรหัส OTP ทาง SMS', impact: +20 },
      { rule: 'gps_proximity_ok', label: 'พิกัด GPS อุปกรณ์ตรงกับจุดเกิดเหตุ (ห่าง 120 ม.)', impact: +20 },
      { rule: 'nlp_coherent', label: 'ข้อความมีสาระและโครงสร้างสมบูรณ์', impact: +15 }
    ],
    clusterConsensus: 3, // 3 citizens reported nearby
    recommendedAction: 'approve_dispatch'
  },
  {
    id: 'TRG-9019',
    type: 'flood',
    typeName: 'อุทกภัย (น้ำท่วมขัง)',
    typeIcon: '🌊',
    title: 'น้ำเอ่อล้นเข้าท่อระบายน้ำ ซอยพหลโยธิน 8',
    description: 'ฝนตกหนัก 30 นาที น้ำระบายไม่ทัน สูงประมาณ 20 ซม. รถเล็กยังผ่านได้ช้าๆ',
    province: 'กรุงเทพมหานคร',
    district: 'พญาไท',
    subdistrict: 'สามเสนใน',
    landmark: 'ซอยพหลโยธิน 8 (สายลม)',
    lat: 13.7761,
    lng: 100.5434,
    reportedAt: '25 นาทีที่แล้ว',
    timestamp: Date.now() - 25 * 60 * 1000,
    reporterName: 'นางสาวพิมพ์ใจ มีสุข',
    reporterPhone: '081-334-5566',
    citizenId: '3100601248956',
    ipAddress: '110.168.42.11',
    trustScore: 68,
    trustLevel: 'medium',
    fakeProbability: 25,
    status: 'pending',
    flags: [
      { rule: 'id_valid', label: 'เลขบัตร ปชช. ถูกต้อง', impact: +25 },
      { rule: 'no_otp', label: 'ยังไม่กดยืนยัน OTP', impact: -15 },
      { rule: 'gps_proximity_ok', label: 'พิกัด GPS อยู่ในรัศมี 1 กม.', impact: +15 },
      { rule: 'duplicate_nearby', label: 'พบรายงานซ้ำในจุดใกล้เคียง', impact: +10 }
    ],
    clusterConsensus: 2,
    recommendedAction: 'request_investigate'
  }
];

// Shelters and Evacuation Centers
export const INITIAL_SHELTERS = [
  {
    id: 'SHL-01',
    name: 'ศูนย์พักพิงชั่วคราว โรงเรียนเทศบาล 1 (เวียงพางคำ)',
    province: 'เชียงราย',
    district: 'แม่สาย',
    address: 'หมู่ 3 ต.เวียงพางคำ อ.แม่สาย จ.เชียงราย',
    lat: 20.4280,
    lng: 99.8750,
    capacity: 600,
    currentOccupancy: 380,
    status: 'open',
    contactPerson: 'นายอำนวย คำแปง (ผอ.โรงเรียน)',
    phone: '053-731-234',
    supplies: {
      drinkingWaterLiters: 2400,
      foodBoxes: 850,
      medicalKits: 120,
      blankets: 450
    },
    hasMedicalTeam: true,
    hasPetZone: true
  },
  {
    id: 'SHL-02',
    name: 'อาคารเอนกประสงค์ องค์การบริหารส่วนตำบลแม่สาย',
    province: 'เชียงราย',
    district: 'แม่สาย',
    address: 'ต.แม่สาย อ.แม่สาย จ.เชียงราย',
    lat: 20.4150,
    lng: 99.8920,
    capacity: 450,
    currentOccupancy: 310,
    status: 'open',
    contactPerson: 'นางกาญจนา แก้วมาลา',
    phone: '053-733-111',
    supplies: {
      drinkingWaterLiters: 1800,
      foodBoxes: 500,
      medicalKits: 80,
      blankets: 320
    },
    hasMedicalTeam: true,
    hasPetZone: false
  },
  {
    id: 'SHL-03',
    name: 'ศูนย์กีฬาเฉลิมพระเกียรติ มหาวิทยาลัยราชภัฏเชียงราย',
    province: 'เชียงราย',
    district: 'เมืองเชียงราย',
    address: 'ต.บ้านดู่ อ.เมือง จ.เชียงราย',
    lat: 19.9820,
    lng: 99.8490,
    capacity: 1000,
    currentOccupancy: 295,
    status: 'open',
    contactPerson: 'ดร.สมเกียรติ วงศ์ษา',
    phone: '053-776-000',
    supplies: {
      drinkingWaterLiters: 4500,
      foodBoxes: 1200,
      medicalKits: 250,
      blankets: 800
    },
    hasMedicalTeam: true,
    hasPetZone: true
  },
  {
    id: 'SHL-04',
    name: 'หอประชุมอำเภอเวียงป่าเป้า',
    province: 'เชียงราย',
    district: 'เวียงป่าเป้า',
    address: 'ต.เวียง อ.เวียงป่าเป้า จ.เชียงราย',
    lat: 19.3512,
    lng: 99.5011,
    capacity: 350,
    currentOccupancy: 0,
    status: 'standby',
    contactPerson: 'นายมนัส เกรียงไกร',
    phone: '053-781-456',
    supplies: {
      drinkingWaterLiters: 1000,
      foodBoxes: 300,
      medicalKits: 50,
      blankets: 200
    },
    hasMedicalTeam: false,
    hasPetZone: false
  }
];

// CCTV Cameras Simulation
export const INITIAL_CCTV_FEEDS = [
  {
    id: 'CAM-01',
    name: 'CCTV สะพานมิตรภาพไทย-เมียนมา แห่งที่ 1 (แม่สาย)',
    province: 'เชียงราย',
    district: 'แม่สาย',
    lat: 20.4431,
    lng: 99.8821,
    status: 'online',
    currentWaterLevel: '5.80 ม. (ล้นตลิ่ง +0.80 ม.)',
    warningStatus: 'critical',
    cameraAngle: 'หันหน้าทางทิศเหนือ มองเห็นกระแสน้ำและชุมชนเกาะทราย'
  },
  {
    id: 'CAM-02',
    name: 'CCTV ประตูระบายน้ำแม่น้ำปิง สถานี P.1 นวรัฐ เชียงใหม่',
    province: 'เชียงใหม่',
    district: 'เมืองเชียงใหม่',
    lat: 18.7883,
    lng: 99.0034,
    status: 'online',
    currentWaterLevel: '3.65 ม. (ระดับวิกฤต 3.70 ม.)',
    warningStatus: 'warning',
    cameraAngle: 'สะพานนวรัฐ แม่น้ำปิง'
  },
  {
    id: 'CAM-03',
    name: 'CCTV เขื่อนเจ้าพระยา อ.สรรพยา ชัยนาท',
    province: 'ชัยนาท',
    district: 'สรรพยา',
    lat: 15.1584,
    lng: 100.1802,
    status: 'online',
    currentWaterLevel: 'อัตราการระบาย 2,150 ลบ.ม./วินาที',
    warningStatus: 'warning',
    cameraAngle: 'ท้ายเขื่อนเจ้าพระยา'
  }
];

// Initial Blacklisted Users / Devices
export const INITIAL_BLACKLIST = [
  { target: '1234567890123', type: 'citizenId', reason: 'แจ้งเหตุเขื่อนแตกเท็จซ้ำซาก', bannedAt: '2026-10-01' },
  { target: '0999999999', type: 'phone', reason: 'เบอร์สแปมปั่นป่วนระบบ 1784', bannedAt: '2026-09-28' },
  { target: '180.183.21.99', type: 'ipAddress', reason: 'Botnet ส่งรายงานขยะ 120 ครั้ง/นาที', bannedAt: '2026-10-02' }
];

// Broadcast History Logs
export const INITIAL_BROADCAST_LOGS = [
  {
    id: 'BC-2026-104',
    timestamp: '2026-10-02 22:45 ICT',
    level: 'extreme',
    levelLabel: '🔴 ระดับสูงสุด (Extreme)',
    targetArea: 'อ.แม่สาย จ.เชียงราย (ริมแม่น้ำสาย)',
    headline: '[ปภ. แจ้งเตือนฉุกเฉิน] สั่งอพยพทันที ริมแม่น้ำสาย แม่สาย',
    channels: ['Cell Broadcast 5G/4G', 'SMS Push', 'LINE Alert'],
    status: 'กระจายสัญญาณสำเร็จ 100% (45,210 อุปกรณ์)'
  },
  {
    id: 'BC-2026-103',
    timestamp: '2026-10-02 20:15 ICT',
    level: 'severe',
    levelLabel: '🟠 ระดับรุนแรง (Severe)',
    targetArea: 'อ.เวียงป่าเป้า จ.เชียงราย',
    headline: '[ปภ. แจ้งเตือนภัย] เฝ้าระวังดินโคลนถล่มและปิดถนน ทล.118',
    channels: ['Cell Broadcast', 'SMS Push'],
    status: 'กระจายสัญญาณสำเร็จ (18,400 อุปกรณ์)'
  },
  {
    id: 'BC-2026-102',
    timestamp: '2026-10-02 18:00 ICT',
    level: 'advisory',
    levelLabel: '🟡 เฝ้าระวัง (Advisory)',
    targetArea: 'ลุ่มน้ำเจ้าพระยา (อยุธยา / อ่างทอง / ชัยนาท)',
    headline: '[ปภ. แจ้งข่าวสาร] เขื่อนเจ้าพระยาปรับเพิ่มการระบายน้ำ 2,200 ลบ.ม./วิ',
    channels: ['LINE Alert', 'SMS Push'],
    status: 'กระจายสัญญาณสำเร็จ'
  }
];
