const form = document.querySelector("#ballisticForm");
const tableBody = document.querySelector("#rangeTable");
const clickHeader = document.querySelector("#clickHeader");
const summaryGrid = document.querySelector("#summaryGrid");
const solutionTitle = document.querySelector("#solutionTitle");
const reticleCanvas = document.querySelector("#reticleCanvas");
const resetButton = document.querySelector("#resetButton");
const clickUnit = document.querySelector("#clickUnit");
const previewRangeSelect = document.querySelector("#previewRange");
const rangeUnitSelect = document.querySelector("#rangeUnit");
const rangeUnitLabels = document.querySelectorAll(".range-unit-label");
const calibreSelect = document.querySelector("#calibreSelect");
const calibreDataTable = document.querySelector("#calibreDataTable");
const pageTabs = document.querySelectorAll(".page-tab");
const pagePanels = document.querySelectorAll("[data-page-panel]");
const noteReticleCanvas = document.querySelector("#noteReticleCanvas");
const noteReticleType = document.querySelector("#noteReticleType");
const noteDistance = document.querySelector("#noteDistance");
const noteDistanceUnit = document.querySelector("#noteDistanceUnit");
const noteDistanceUnitLabel = document.querySelector("#noteDistanceUnitLabel");
const noteWind = document.querySelector("#noteWind");
const noteElevation = document.querySelector("#noteElevation");
const noteLoad = document.querySelector("#noteLoad");
const noteText = document.querySelector("#noteText");
const clearAimPoint = document.querySelector("#clearAimPoint");
const saveRangeNote = document.querySelector("#saveRangeNote");
const clearRangeNotes = document.querySelector("#clearRangeNotes");
const savedNotes = document.querySelector("#savedNotes");
const authStatus = document.querySelector("#authStatus");
const authMessage = document.querySelector("#authMessage");
const authName = document.querySelector("#authName");
const authEmail = document.querySelector("#authEmail");
const authPassword = document.querySelector("#authPassword");
const loginButton = document.querySelector("#loginButton");
const registerButton = document.querySelector("#registerButton");
const resetRequestButton = document.querySelector("#resetRequestButton");
const logoutButton = document.querySelector("#logoutButton");
const refreshAdminButton = document.querySelector("#refreshAdminButton");
const adminUsersTable = document.querySelector("#adminUsersTable");
const usageLog = document.querySelector("#usageLog");
const unitButtons = document.querySelectorAll("[data-units]");
let displayUnits = "imperial";
let aimPoint = { x: 0.5, y: 0.5 };
let activeRangeUnit = "yd";
const storage = {
  get(key, fallback) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) || fallback : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, value);
    } catch {}
  },
  remove(key) {
    try {
      if (window.localStorage) window.localStorage.removeItem(key);
    } catch {}
  },
};
let rangeNotes = JSON.parse(storage.get("rangeNotes", "[]"));
let authToken = storage.get("authToken", "");
let currentAccount = JSON.parse(storage.get("currentAccount", "null"));
let saveTimer = null;

const ballisticData = [
  { calibre: ".17 HMR", load: "17 gr V-Max", bullet: "Polymer tipped rimfire", weight: 17, bc: 0.125, velocity: 2550, diameter: 0.172, twist: "1:9" },
  { calibre: ".17 HMR", load: "20 gr XTP", bullet: "Hollow point rimfire", weight: 20, bc: 0.125, velocity: 2375, diameter: 0.172, twist: "1:9" },
  { calibre: ".22 LR", load: "40 gr Standard", bullet: "Lead round nose", weight: 40, bc: 0.13, velocity: 1070, diameter: 0.223, twist: "1:16" },
  { calibre: ".22 LR", load: "40 gr High Velocity", bullet: "Plated hollow point", weight: 40, bc: 0.125, velocity: 1250, diameter: 0.223, twist: "1:16" },
  { calibre: ".22 WMR", load: "30 gr V-Max", bullet: "Polymer tipped rimfire", weight: 30, bc: 0.095, velocity: 2200, diameter: 0.224, twist: "1:16" },
  { calibre: ".22 WMR", load: "40 gr JHP", bullet: "Jacketed hollow point", weight: 40, bc: 0.115, velocity: 1875, diameter: 0.224, twist: "1:16" },
  { calibre: ".204 Ruger", load: "32 gr V-Max", bullet: "Polymer tipped varmint", weight: 32, bc: 0.21, velocity: 4225, diameter: 0.204, twist: "1:12" },
  { calibre: ".204 Ruger", load: "40 gr V-Max", bullet: "Polymer tipped varmint", weight: 40, bc: 0.275, velocity: 3900, diameter: 0.204, twist: "1:12" },
  { calibre: ".22 Hornet", load: "35 gr V-Max", bullet: "Polymer tipped varmint", weight: 35, bc: 0.109, velocity: 3100, diameter: 0.224, twist: "1:16" },
  { calibre: ".22-250 Rem", load: "50 gr V-Max", bullet: "Polymer tipped varmint", weight: 50, bc: 0.242, velocity: 3800, diameter: 0.224, twist: "1:14-1:12" },
  { calibre: ".22-250 Rem", load: "55 gr V-Max", bullet: "Polymer tipped varmint", weight: 55, bc: 0.255, velocity: 3680, diameter: 0.224, twist: "1:14-1:12" },
  { calibre: ".223 Rem", load: "55 gr FMJ", bullet: "General range FMJ", weight: 55, bc: 0.255, velocity: 3240, diameter: 0.224, twist: "1:12-1:9" },
  { calibre: ".223 Rem", load: "55 gr V-Max", bullet: "Polymer tipped varmint", weight: 55, bc: 0.255, velocity: 3240, diameter: 0.224, twist: "1:12-1:9" },
  { calibre: ".223 Rem", load: "62 gr FMJ", bullet: "General range FMJ", weight: 62, bc: 0.307, velocity: 3020, diameter: 0.224, twist: "1:9-1:7" },
  { calibre: ".223 Rem", load: "69 gr Match", bullet: "HPBT match", weight: 69, bc: 0.355, velocity: 2950, diameter: 0.224, twist: "1:9-1:7" },
  { calibre: ".223 Rem", load: "77 gr Match", bullet: "OTM match", weight: 77, bc: 0.372, velocity: 2750, diameter: 0.224, twist: "1:8-1:7" },
  { calibre: "5.56 NATO", load: "55 gr M193", bullet: "FMJ ball", weight: 55, bc: 0.255, velocity: 3250, diameter: 0.224, twist: "1:12-1:7" },
  { calibre: "5.56 NATO", load: "62 gr M855", bullet: "FMJ ball", weight: 62, bc: 0.304, velocity: 3020, diameter: 0.224, twist: "1:9-1:7" },
  { calibre: "5.56 NATO", load: "77 gr OTM", bullet: "Open tip match", weight: 77, bc: 0.372, velocity: 2750, diameter: 0.224, twist: "1:8-1:7" },
  { calibre: ".224 Valkyrie", load: "75 gr TMJ", bullet: "Target jacketed", weight: 75, bc: 0.395, velocity: 3000, diameter: 0.224, twist: "1:7" },
  { calibre: ".224 Valkyrie", load: "90 gr Match", bullet: "HPBT match", weight: 90, bc: 0.563, velocity: 2700, diameter: 0.224, twist: "1:7" },
  { calibre: "6mm ARC", load: "103 gr ELD-X", bullet: "Expanding polymer tip", weight: 103, bc: 0.512, velocity: 2800, diameter: 0.243, twist: "1:7.5" },
  { calibre: "6mm ARC", load: "108 gr ELD-M", bullet: "Match polymer tip", weight: 108, bc: 0.536, velocity: 2750, diameter: 0.243, twist: "1:7.5" },
  { calibre: "6mm Creedmoor", load: "105 gr Match", bullet: "BTHP match", weight: 105, bc: 0.53, velocity: 3050, diameter: 0.243, twist: "1:8" },
  { calibre: "6mm Creedmoor", load: "108 gr ELD-M", bullet: "Match polymer tip", weight: 108, bc: 0.536, velocity: 2960, diameter: 0.243, twist: "1:8" },
  { calibre: ".243 Win", load: "95 gr SST", bullet: "Polymer tipped", weight: 95, bc: 0.355, velocity: 3100, diameter: 0.243, twist: "1:10" },
  { calibre: ".243 Win", load: "105 gr Match", bullet: "BTHP match", weight: 105, bc: 0.53, velocity: 2950, diameter: 0.243, twist: "1:8" },
  { calibre: ".25-06 Rem", load: "100 gr Tipped", bullet: "Hunting polymer tip", weight: 100, bc: 0.393, velocity: 3230, diameter: 0.257, twist: "1:10" },
  { calibre: ".25-06 Rem", load: "115 gr Ballistic Tip", bullet: "Hunting polymer tip", weight: 115, bc: 0.453, velocity: 3060, diameter: 0.257, twist: "1:10" },
  { calibre: "6.5 Grendel", load: "123 gr SST", bullet: "Polymer tipped", weight: 123, bc: 0.51, velocity: 2580, diameter: 0.264, twist: "1:8" },
  { calibre: "6.5 Grendel", load: "130 gr OTM", bullet: "Open tip match", weight: 130, bc: 0.56, velocity: 2500, diameter: 0.264, twist: "1:8" },
  { calibre: "6.5 Creedmoor", load: "120 gr Match", bullet: "Open tip match", weight: 120, bc: 0.47, velocity: 2950, diameter: 0.264, twist: "1:8" },
  { calibre: "6.5 Creedmoor", load: "129 gr SST", bullet: "Polymer tipped hunting", weight: 129, bc: 0.485, velocity: 2850, diameter: 0.264, twist: "1:8" },
  { calibre: "6.5 Creedmoor", load: "140 gr ELD-M", bullet: "Match polymer tip", weight: 140, bc: 0.61, velocity: 2710, diameter: 0.264, twist: "1:8" },
  { calibre: "6.5 Creedmoor", load: "143 gr ELD-X", bullet: "Expanding polymer tip", weight: 143, bc: 0.625, velocity: 2700, diameter: 0.264, twist: "1:8" },
  { calibre: "6.5 PRC", load: "143 gr ELD-X", bullet: "Expanding polymer tip", weight: 143, bc: 0.625, velocity: 2960, diameter: 0.264, twist: "1:8" },
  { calibre: "6.5 PRC", load: "147 gr ELD-M", bullet: "Match polymer tip", weight: 147, bc: 0.697, velocity: 2910, diameter: 0.264, twist: "1:8" },
  { calibre: ".270 Win", load: "130 gr Soft Point", bullet: "Hunting soft point", weight: 130, bc: 0.435, velocity: 3060, diameter: 0.277, twist: "1:10" },
  { calibre: ".270 Win", load: "145 gr ELD-X", bullet: "Expanding polymer tip", weight: 145, bc: 0.536, velocity: 2970, diameter: 0.277, twist: "1:10" },
  { calibre: ".270 Win", load: "150 gr Long Range", bullet: "Polymer tipped", weight: 150, bc: 0.525, velocity: 2850, diameter: 0.277, twist: "1:10" },
  { calibre: ".270 WSM", load: "130 gr Ballistic Tip", bullet: "Hunting polymer tip", weight: 130, bc: 0.433, velocity: 3275, diameter: 0.277, twist: "1:10" },
  { calibre: ".270 WSM", load: "150 gr Long Range", bullet: "Polymer tipped", weight: 150, bc: 0.525, velocity: 3100, diameter: 0.277, twist: "1:10" },
  { calibre: "7mm-08 Rem", load: "120 gr Tipped", bullet: "Hunting polymer tip", weight: 120, bc: 0.417, velocity: 3000, diameter: 0.284, twist: "1:9.5" },
  { calibre: "7mm-08 Rem", load: "140 gr Soft Point", bullet: "Hunting soft point", weight: 140, bc: 0.485, velocity: 2860, diameter: 0.284, twist: "1:9.5" },
  { calibre: "7mm Rem Mag", load: "150 gr Ballistic Tip", bullet: "Hunting polymer tip", weight: 150, bc: 0.493, velocity: 3110, diameter: 0.284, twist: "1:9.5" },
  { calibre: "7mm Rem Mag", load: "162 gr ELD-X", bullet: "Expanding polymer tip", weight: 162, bc: 0.631, velocity: 2940, diameter: 0.284, twist: "1:9.5" },
  { calibre: "7mm PRC", load: "175 gr ELD-X", bullet: "Expanding polymer tip", weight: 175, bc: 0.689, velocity: 3000, diameter: 0.284, twist: "1:8" },
  { calibre: "7mm PRC", load: "180 gr ELD-M", bullet: "Match polymer tip", weight: 180, bc: 0.796, velocity: 2975, diameter: 0.284, twist: "1:8" },
  { calibre: "7.62x39", load: "123 gr FMJ", bullet: "FMJ ball", weight: 123, bc: 0.275, velocity: 2350, diameter: 0.311, twist: "1:9.5" },
  { calibre: "7.62x39", load: "123 gr SST", bullet: "Polymer tipped", weight: 123, bc: 0.295, velocity: 2350, diameter: 0.311, twist: "1:9.5" },
  { calibre: ".300 Blackout", load: "110 gr V-Max", bullet: "Polymer tipped", weight: 110, bc: 0.29, velocity: 2350, diameter: 0.308, twist: "1:7-1:8" },
  { calibre: ".300 Blackout", load: "125 gr Match", bullet: "Open tip match", weight: 125, bc: 0.33, velocity: 2200, diameter: 0.308, twist: "1:7-1:8" },
  { calibre: ".300 Blackout", load: "220 gr Subsonic", bullet: "Open tip match", weight: 220, bc: 0.56, velocity: 1050, diameter: 0.308, twist: "1:7" },
  { calibre: ".308 Win", load: "150 gr FMJ", bullet: "General range FMJ", weight: 150, bc: 0.398, velocity: 2820, diameter: 0.308, twist: "1:12-1:10" },
  { calibre: ".308 Win", load: "150 gr SST", bullet: "Polymer tipped hunting", weight: 150, bc: 0.415, velocity: 2820, diameter: 0.308, twist: "1:12-1:10" },
  { calibre: ".308 Win", load: "168 gr Match", bullet: "BTHP match", weight: 168, bc: 0.462, velocity: 2650, diameter: 0.308, twist: "1:12-1:10" },
  { calibre: ".308 Win", load: "175 gr Match", bullet: "OTM match", weight: 175, bc: 0.505, velocity: 2600, diameter: 0.308, twist: "1:11-1:10" },
  { calibre: ".308 Win", load: "178 gr ELD-X", bullet: "Expanding polymer tip", weight: 178, bc: 0.552, velocity: 2600, diameter: 0.308, twist: "1:11-1:10" },
  { calibre: ".30-06 Sprg", load: "150 gr Soft Point", bullet: "Hunting soft point", weight: 150, bc: 0.387, velocity: 2910, diameter: 0.308, twist: "1:10" },
  { calibre: ".30-06 Sprg", load: "168 gr Match", bullet: "BTHP match", weight: 168, bc: 0.462, velocity: 2800, diameter: 0.308, twist: "1:10" },
  { calibre: ".30-06 Sprg", load: "180 gr Soft Point", bullet: "Hunting soft point", weight: 180, bc: 0.452, velocity: 2700, diameter: 0.308, twist: "1:10" },
  { calibre: ".30-06 Sprg", load: "178 gr ELD-X", bullet: "Expanding polymer tip", weight: 178, bc: 0.552, velocity: 2750, diameter: 0.308, twist: "1:10" },
  { calibre: ".300 Win Mag", load: "180 gr Match", bullet: "Open tip match", weight: 180, bc: 0.533, velocity: 2960, diameter: 0.308, twist: "1:10" },
  { calibre: ".300 Win Mag", load: "190 gr Match", bullet: "BTHP match", weight: 190, bc: 0.533, velocity: 2900, diameter: 0.308, twist: "1:10" },
  { calibre: ".300 Win Mag", load: "200 gr ELD-X", bullet: "Long range hunting", weight: 200, bc: 0.626, velocity: 2850, diameter: 0.308, twist: "1:10" },
  { calibre: ".300 PRC", load: "212 gr ELD-X", bullet: "Expanding polymer tip", weight: 212, bc: 0.673, velocity: 2860, diameter: 0.308, twist: "1:8.5" },
  { calibre: ".300 PRC", load: "225 gr ELD-M", bullet: "Match polymer tip", weight: 225, bc: 0.777, velocity: 2810, diameter: 0.308, twist: "1:8.5" },
  { calibre: ".338 Lapua Mag", load: "250 gr Match", bullet: "BTHP match", weight: 250, bc: 0.675, velocity: 2900, diameter: 0.338, twist: "1:10" },
  { calibre: ".338 Lapua Mag", load: "285 gr ELD-M", bullet: "Match polymer tip", weight: 285, bc: 0.789, velocity: 2745, diameter: 0.338, twist: "1:9.3" },
  { calibre: ".375 CheyTac", load: "350 gr Match", bullet: "Solid match", weight: 350, bc: 0.94, velocity: 3000, diameter: 0.375, twist: "1:10" },
  { calibre: ".375 CheyTac", load: "377 gr Match", bullet: "Solid match", weight: 377, bc: 1.0, velocity: 2925, diameter: 0.375, twist: "1:10" },
  { calibre: ".45-70 Gov", load: "300 gr JHP", bullet: "Jacketed hollow point", weight: 300, bc: 0.197, velocity: 1850, diameter: 0.458, twist: "1:20" },
  { calibre: ".45-70 Gov", load: "405 gr Hard Cast", bullet: "Flat nose hard cast", weight: 405, bc: 0.281, velocity: 1330, diameter: 0.458, twist: "1:20" },
  { calibre: ".50 BMG", load: "660 gr FMJ", bullet: "FMJ ball", weight: 660, bc: 0.67, velocity: 2910, diameter: 0.510, twist: "1:15" },
  { calibre: ".50 BMG", load: "750 gr A-Max", bullet: "Polymer tipped match", weight: 750, bc: 1.05, velocity: 2820, diameter: 0.510, twist: "1:15" },
];

const defaults = Object.fromEntries(new FormData(form).entries());

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const inchesToCm = (value) => value * 2.54;
const yardsToMeters = (value) => value * 0.9144;
const metersToYards = (value) => value / 0.9144;
const fpsToMps = (value) => value * 0.3048;
const ftlbToJoule = (value) => value * 1.35582;
const celsiusToFahrenheit = (value) => value * 1.8 + 32;
const rangeValueToYards = (value, unit) => (unit === "m" ? metersToYards(value) : value);
const yardsToRangeValue = (value, unit) => (unit === "m" ? yardsToMeters(value) : value);

function formatRangeLabel(yards, unit = "yd") {
  if (unit === "m") {
    const meters = yardsToMeters(yards);
    return `${meters >= 100 ? meters.toFixed(0) : meters.toFixed(1)} m`;
  }
  return `${yards.toFixed(0)} yd`;
}

function readInputs() {
  const data = Object.fromEntries(new FormData(form).entries());
  const rangeUnit = data.rangeUnit || "yd";
  return {
    bulletName: data.bulletName || "Custom load",
    bulletWeight: toNumber(data.bulletWeight, 140),
    bc: clamp(toNumber(data.bc, 0.5), 0.05, 1.5),
    muzzleVelocity: clamp(toNumber(data.muzzleVelocity, 2600), 300, 5000),
    diameter: clamp(toNumber(data.diameter, 0.308), 0.05, 1),
    rangeUnit,
    zeroRange: clamp(rangeValueToYards(toNumber(data.zeroRange, 100), rangeUnit), 10, 600),
    sightHeight: clamp(toNumber(data.sightHeight, 1.8), 0.1, 5),
    rangeStep: clamp(rangeValueToYards(toNumber(data.rangeStep, 50), rangeUnit), 10, 200),
    maxRange: clamp(rangeValueToYards(toNumber(data.maxRange, 800), rangeUnit), 50, 1500),
    scopeType: data.scopeType || "mil",
    clickValue: clamp(toNumber(data.clickValue, 0.1), 0.01, 1),
    reticleStep: clamp(toNumber(data.reticleStep, 0.5), 0.1, 5),
    previewRange: data.previewRange || "auto",
    temperature: clamp(toNumber(data.temperature, 15), -40, 55),
    pressure: clamp(toNumber(data.pressure, 29.92), 20, 33),
    humidity: clamp(toNumber(data.humidity, 50), 0, 100),
    altitude: clamp(toNumber(data.altitude, 0), -1500, 16000),
    windSpeed: clamp(toNumber(data.windSpeed, 0), 0, 80),
    windAngle: clamp(toNumber(data.windAngle, 90), 0, 180),
  };
}

function densityRatio(inputs) {
  const tempRankine = celsiusToFahrenheit(inputs.temperature) + 459.67;
  const pressureRatio = inputs.pressure / 29.92;
  const tempRatio = 518.67 / tempRankine;
  const altitudeRatio = Math.pow(1 - (0.0000068753 * inputs.altitude), 5.2559);
  const humidityEffect = 1 - inputs.humidity * 0.00018;
  return clamp(pressureRatio * tempRatio * altitudeRatio * humidityEffect, 0.55, 1.35);
}

function dragVelocity(v0, distanceFeet, bc, airRatio) {
  const dragConstant = 0.000046;
  return Math.max(350, v0 * Math.exp((-dragConstant * airRatio * distanceFeet) / bc));
}

function flightAtRange(rangeYards, inputs, airRatio) {
  const distanceFeet = rangeYards * 3;
  const stepFeet = 3;
  let feet = 0;
  let tof = 0;

  while (feet < distanceFeet) {
    const segment = Math.min(stepFeet, distanceFeet - feet);
    const vA = dragVelocity(inputs.muzzleVelocity, feet, inputs.bc, airRatio);
    const vB = dragVelocity(inputs.muzzleVelocity, feet + segment, inputs.bc, airRatio);
    tof += segment / ((vA + vB) / 2);
    feet += segment;
  }

  const velocity = dragVelocity(inputs.muzzleVelocity, distanceFeet, inputs.bc, airRatio);
  const rawDropInches = 0.5 * 32.174 * tof * tof * 12;
  return { rangeYards, tof, velocity, rawDropInches };
}

function calculateRows(inputs) {
  const airRatio = densityRatio(inputs);
  const zero = flightAtRange(inputs.zeroRange, inputs, airRatio);
  const zeroFeet = inputs.zeroRange * 3;
  const boreAngle = Math.atan((zero.rawDropInches + inputs.sightHeight) / 12 / zeroFeet);
  const ranges = [];

  for (let range = 0; range <= inputs.maxRange; range += inputs.rangeStep) {
    if (range === 0) continue;
    ranges.push(range);
  }

  if (!ranges.includes(inputs.zeroRange)) ranges.push(inputs.zeroRange);
  ranges.sort((a, b) => a - b);

  const crosswindMph = inputs.windSpeed * Math.sin((inputs.windAngle * Math.PI) / 180);
  const windFps = crosswindMph * 1.46667;

  return ranges.map((rangeYards) => {
    const flight = flightAtRange(rangeYards, inputs, airRatio);
    const lineOfDepartureInches = Math.tan(boreAngle) * rangeYards * 3 * 12;
    const dropInches = flight.rawDropInches - lineOfDepartureInches + inputs.sightHeight;
    const moa = (dropInches / (rangeYards * 1.047)) * 100;
    const mil = (dropInches / (rangeYards * 3.6)) * 100;
    const adjustment = inputs.scopeType === "moa" ? moa : mil;
    const clicks = inputs.scopeType === "bdc" ? adjustment / inputs.reticleStep : adjustment / inputs.clickValue;
    const windInches = windFps * flight.tof * 12 * 0.22;
    const windMoa = (windInches / (rangeYards * 1.047)) * 100;
    const windMil = (windInches / (rangeYards * 3.6)) * 100;
    const energy = (inputs.bulletWeight * flight.velocity * flight.velocity) / 450240;

    return {
      rangeYards,
      dropInches,
      moa,
      mil,
      adjustment,
      clicks,
      windInches,
      windMoa,
      windMil,
      velocity: flight.velocity,
      energy,
      tof: flight.tof,
      isZero: Math.abs(rangeYards - inputs.zeroRange) < 0.1,
    };
  });
}

function formatSigned(value, digits = 1) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}`;
}

function holdUnitLabel(inputs) {
  if (inputs.scopeType === "moa") return "MOA";
  if (inputs.scopeType === "bdc") return "MIL hold";
  return "MIL";
}

function selectedPreviewRow(inputs, rows) {
  if (inputs.previewRange === "auto") return rows[rows.length - 1];
  const previewRange = toNumber(inputs.previewRange, rows[rows.length - 1].rangeYards);
  return rows.reduce((closest, row) => {
    const closestDiff = Math.abs(closest.rangeYards - previewRange);
    const rowDiff = Math.abs(row.rangeYards - previewRange);
    return rowDiff < closestDiff ? row : closest;
  }, rows[0]);
}

function syncPreviewOptions(inputs, rows) {
  const current = inputs.previewRange;
  const rangeOptions = rows
    .map((row) => `<option value="${row.rangeYards}">${formatRangeLabel(row.rangeYards, inputs.rangeUnit)} hold</option>`)
    .join("");
  previewRangeSelect.innerHTML = `<option value="auto">Auto ladder</option>${rangeOptions}`;

  const hasCurrent = [...previewRangeSelect.options].some((option) => option.value === current);
  previewRangeSelect.value = hasCurrent ? current : "auto";
}

function renderSummary(inputs, rows) {
  const air = densityRatio(inputs);
  const zeroRow = rows.find((row) => row.isZero) || rows[0];
  const preview = selectedPreviewRow(inputs, rows);
  const unitLabel = holdUnitLabel(inputs);
  const cards = [
    ["Air density", `${Math.round(air * 100)}%`],
    ["Zero", formatRangeLabel(inputs.zeroRange, inputs.rangeUnit)],
    [`${formatRangeLabel(preview.rangeYards, inputs.rangeUnit)} hold`, `${formatSigned(preview.adjustment, 2)} ${unitLabel}`],
    ["Zero check", `${formatSigned(zeroRow.dropInches, 2)} in`],
  ];

  summaryGrid.innerHTML = cards
    .map(([label, value]) => `<div class="summary-item"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function renderTable(inputs, rows) {
  const unitLabel = inputs.scopeType === "moa" ? "MOA" : inputs.scopeType === "bdc" ? "MIL" : "MIL";
  clickHeader.textContent = inputs.scopeType === "bdc" ? "Marks" : "Clicks";
  tableBody.innerHTML = rows
    .map((row) => {
      const range = displayUnits === "metric" ? `${yardsToMeters(row.rangeYards).toFixed(0)} m` : `${row.rangeYards} yd`;
      const drop = displayUnits === "metric" ? `${formatSigned(inchesToCm(row.dropInches), 1)} cm` : `${formatSigned(row.dropInches, 1)} in`;
      const wind = displayUnits === "metric" ? `${formatSigned(inchesToCm(row.windInches), 1)} cm` : `${formatSigned(row.windInches, 1)} in`;
      const velocity = displayUnits === "metric" ? `${fpsToMps(row.velocity).toFixed(0)} m/s` : `${row.velocity.toFixed(0)} fps`;
      const energy = displayUnits === "metric" ? `${ftlbToJoule(row.energy).toFixed(0)} J` : `${row.energy.toFixed(0)} ft-lb`;
      const elevation = inputs.scopeType === "moa" ? row.moa : row.mil;

      const isPreview = selectedPreviewRow(inputs, rows).rangeYards === row.rangeYards;
      return `<tr class="${row.isZero ? "highlight" : ""} ${isPreview ? "selected" : ""}">
        <td>${range}</td>
        <td>${drop}</td>
        <td>${formatSigned(elevation, 2)} ${unitLabel}</td>
        <td>${inputs.scopeType === "bdc" ? formatSigned(row.clicks, 1) : formatSigned(row.clicks, 0)}</td>
        <td>${wind}</td>
        <td>${velocity}</td>
        <td>${energy}</td>
        <td>${row.tof.toFixed(3)} s</td>
      </tr>`;
    })
    .join("");
}

function renderReticle(inputs, rows) {
  const ctx = reticleCanvas.getContext("2d");
  const width = reticleCanvas.width;
  const height = reticleCanvas.height;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#102321");
  gradient.addColorStop(1, "#213a34");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(234, 244, 241, 0.25)";
  ctx.lineWidth = 1;
  for (let x = 40; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 40; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const cx = width / 2;
  const cy = height * 0.32;
  ctx.strokeStyle = "#eaf4f1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(42, cy);
  ctx.lineTo(width - 42, cy);
  ctx.moveTo(cx, 28);
  ctx.lineTo(cx, height - 28);
  ctx.stroke();

  ctx.fillStyle = "#eaf4f1";
  ctx.font = "700 13px system-ui";
  const selectedRow = selectedPreviewRow(inputs, rows);
  const unitLabel = holdUnitLabel(inputs);
  const title = inputs.previewRange === "auto"
    ? `${inputs.scopeType.toUpperCase()} hold ladder`
    : `${formatRangeLabel(selectedRow.rangeYards, inputs.rangeUnit)}: ${formatSigned(selectedRow.adjustment, 2)} ${unitLabel}`;
  ctx.fillText(inputs.scopeType === "bdc" ? title.replace("BDC", "BDC") : title, 24, 30);

  const maxHold = Math.max(...rows.map((row) => Math.abs(row.adjustment)), 1);
  const scale = (height * 0.52) / maxHold;
  let usableRows = rows.filter((row) => row.rangeYards >= inputs.zeroRange).slice(0, 8);
  if (inputs.previewRange !== "auto" && !usableRows.some((row) => row.rangeYards === selectedRow.rangeYards)) {
    usableRows = [...usableRows.slice(0, 7), selectedRow].sort((a, b) => a.rangeYards - b.rangeYards);
  }

  usableRows.forEach((row) => {
    const y = cy + Math.abs(row.adjustment) * scale;
    if (y > height - 24) return;
    const isSelected = row.rangeYards === selectedRow.rangeYards;
    const tick = inputs.scopeType === "bdc" ? 54 : 28;
    ctx.strokeStyle = isSelected ? "#f0c15f" : row.isZero ? "#f5d894" : "rgba(234, 244, 241, 0.86)";
    ctx.lineWidth = isSelected ? 4 : row.isZero ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(cx - (isSelected ? tick + 16 : tick), y);
    ctx.lineTo(cx + (isSelected ? tick + 16 : tick), y);
    ctx.stroke();

    ctx.fillStyle = isSelected ? "#f0c15f" : row.isZero ? "#f5d894" : "#d7e8e4";
    ctx.font = "700 12px system-ui";
    const hold = inputs.scopeType === "moa" ? row.moa : row.mil;
    const holdLabel = inputs.scopeType === "bdc"
      ? `${formatRangeLabel(row.rangeYards, inputs.rangeUnit)} / ${Math.abs(row.clicks).toFixed(1)} marks`
      : `${formatRangeLabel(row.rangeYards, inputs.rangeUnit)} / ${formatSigned(hold, 2)} ${inputs.scopeType === "moa" ? "MOA" : "MIL"}`;
    ctx.fillText(holdLabel, cx + tick + 18, y + 4);
  });
}

function loadPreset(load) {
  form.elements.bulletName.value = `${load.calibre} ${load.load}`;
  form.elements.bulletWeight.value = load.weight;
  form.elements.bc.value = load.bc;
  form.elements.muzzleVelocity.value = load.velocity;
  form.elements.diameter.value = load.diameter;
  calculateAndRender();
}

function renderCalibreOptions() {
  const calibres = [...new Set(ballisticData.map((load) => load.calibre))];
  calibreSelect.innerHTML = `<option value="all">All calibres</option>${calibres
    .map((calibre) => `<option value="${calibre}">${calibre}</option>`)
    .join("")}`;
  if (calibres.includes("6.5 Creedmoor")) calibreSelect.value = "6.5 Creedmoor";
}

function renderCalibreDataTable() {
  const selectedCalibre = calibreSelect.value;
  const loads = selectedCalibre === "all" ? ballisticData : ballisticData.filter((load) => load.calibre === selectedCalibre);
  calibreDataTable.innerHTML = loads
    .map((load, index) => {
      const energy = (load.weight * load.velocity * load.velocity) / 450240;
      return `<tr>
        <td><button class="use-load-button" type="button" data-load-index="${index}">Use</button></td>
        <td>${load.load}</td>
        <td>${load.calibre}</td>
        <td>${load.bullet}</td>
        <td>${load.weight} gr</td>
        <td>${load.bc.toFixed(3)} G1</td>
        <td>${load.velocity} fps</td>
        <td>${energy.toFixed(0)} ft-lb</td>
        <td>${load.diameter.toFixed(3)} in</td>
        <td>${load.twist}</td>
      </tr>`;
    })
    .join("");

  calibreDataTable.querySelectorAll("[data-load-index]").forEach((button) => {
    button.addEventListener("click", () => {
      loadPreset(loads[toNumber(button.dataset.loadIndex, 0)]);
    });
  });
}

function updateRangeUnitLabels() {
  rangeUnitLabels.forEach((label) => {
    label.textContent = rangeUnitSelect.value;
  });
}

function convertRangeInputs(nextUnit) {
  ["zeroRange", "rangeStep", "maxRange"].forEach((name) => {
    const field = form.elements[name];
    const yards = rangeValueToYards(toNumber(field.value, 0), activeRangeUnit);
    const nextValue = yardsToRangeValue(yards, nextUnit);
    field.value = nextUnit === "m" ? nextValue.toFixed(1) : nextValue.toFixed(0);
  });
  activeRangeUnit = nextUnit;
  updateRangeUnitLabels();
}

function switchPage(page) {
  pageTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.page === page));
  pagePanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.pagePanel === page));
  if (page === "range-notes") renderNoteReticle();
}

function drawReticleBase(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0f221f");
  gradient.addColorStop(1, "#223d37");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(234, 244, 241, 0.16)";
  ctx.lineWidth = 1;
  for (let x = 40; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 40; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawHashMarks(ctx, cx, cy, spacing, count, vertical = false, size = 10) {
  for (let i = 1; i <= count; i += 1) {
    const offsets = [-i, i];
    offsets.forEach((offset) => {
      ctx.beginPath();
      if (vertical) {
        const y = cy + offset * spacing;
        ctx.moveTo(cx - size, y);
        ctx.lineTo(cx + size, y);
      } else {
        const x = cx + offset * spacing;
        ctx.moveTo(x, cy - size);
        ctx.lineTo(x, cy + size);
      }
      ctx.stroke();
    });
  }
}

function drawNoteReticleType(ctx, type, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  ctx.strokeStyle = "#eaf4f1";
  ctx.fillStyle = "#eaf4f1";
  ctx.lineWidth = 2;

  if (type === "duplex") {
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(40, cy);
    ctx.lineTo(cx - 80, cy);
    ctx.moveTo(cx + 80, cy);
    ctx.lineTo(width - 40, cy);
    ctx.moveTo(cx, 34);
    ctx.lineTo(cx, cy - 80);
    ctx.moveTo(cx, cy + 80);
    ctx.lineTo(cx, height - 34);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 80, cy);
    ctx.lineTo(cx + 80, cy);
    ctx.moveTo(cx, cy - 80);
    ctx.lineTo(cx, cy + 80);
    ctx.stroke();
  }

  if (type === "mil-dot") {
    ctx.beginPath();
    ctx.moveTo(40, cy);
    ctx.lineTo(width - 40, cy);
    ctx.moveTo(cx, 34);
    ctx.lineTo(cx, height - 34);
    ctx.stroke();
    for (let i = -5; i <= 5; i += 1) {
      if (i === 0) continue;
      ctx.beginPath();
      ctx.arc(cx + i * 44, cy, 4, 0, Math.PI * 2);
      ctx.arc(cx, cy + i * 44, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (type === "moa-hash") {
    ctx.beginPath();
    ctx.moveTo(40, cy);
    ctx.lineTo(width - 40, cy);
    ctx.moveTo(cx, 34);
    ctx.lineTo(cx, height - 34);
    ctx.stroke();
    drawHashMarks(ctx, cx, cy, 32, 9, false, 9);
    drawHashMarks(ctx, cx, cy, 32, 7, true, 9);
  }

  if (type === "bdc") {
    ctx.beginPath();
    ctx.moveTo(40, cy);
    ctx.lineTo(width - 40, cy);
    ctx.moveTo(cx, 34);
    ctx.lineTo(cx, height - 34);
    ctx.stroke();
    for (let i = 1; i <= 6; i += 1) {
      const y = cy + i * 38;
      const half = 30 + i * 9;
      ctx.beginPath();
      ctx.moveTo(cx - half, y);
      ctx.lineTo(cx + half, y);
      ctx.stroke();
      ctx.fillText(`${i}`, cx + half + 14, y + 4);
    }
  }

  if (type === "tree") {
    ctx.beginPath();
    ctx.moveTo(40, cy);
    ctx.lineTo(width - 40, cy);
    ctx.moveTo(cx, 34);
    ctx.lineTo(cx, height - 34);
    ctx.stroke();
    drawHashMarks(ctx, cx, cy, 36, 6, false, 8);
    for (let row = 1; row <= 7; row += 1) {
      const y = cy + row * 38;
      for (let col = -row; col <= row; col += 1) {
        const x = cx + col * 30;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function renderNoteReticle() {
  const ctx = noteReticleCanvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = Math.max(noteReticleCanvas.clientWidth || 0, 320);
  const displayHeight = Math.max(noteReticleCanvas.clientHeight || 0, 420);
  if (noteReticleCanvas.width !== Math.round(displayWidth * dpr) || noteReticleCanvas.height !== Math.round(displayHeight * dpr)) {
    noteReticleCanvas.width = Math.round(displayWidth * dpr);
    noteReticleCanvas.height = Math.round(displayHeight * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawReticleBase(ctx, displayWidth, displayHeight);
  drawNoteReticleType(ctx, noteReticleType.value, displayWidth, displayHeight);

  const markX = aimPoint.x * displayWidth;
  const markY = aimPoint.y * displayHeight;
  ctx.strokeStyle = "#f0c15f";
  ctx.fillStyle = "#f0c15f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(markX, markY, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(markX - 22, markY);
  ctx.lineTo(markX + 22, markY);
  ctx.moveTo(markX, markY - 22);
  ctx.lineTo(markX, markY + 22);
  ctx.stroke();
  ctx.font = "800 13px system-ui";
  ctx.fillText("Aim point", markX + 18, markY - 18);
}

function renderSavedNotes() {
  if (!rangeNotes.length) {
    savedNotes.innerHTML = `<div class="note-card"><strong>No notes saved yet</strong><p>Mark the reticle, add your distance and range notes, then save the entry here.</p></div>`;
    return;
  }
  savedNotes.innerHTML = rangeNotes
    .map((note) => `<article class="note-card">
      ${note.image ? `<img class="note-reticle-image" src="${note.image}" alt="Saved reticle aim point" />` : ""}
      <strong>${note.distance} ${note.distanceUnit || "yd"} · ${note.reticle}</strong>
      <div class="note-meta">${note.load || "No load recorded"} · wind ${note.wind || "0"} mph · hold ${note.elevation || "not recorded"}</div>
      <p>${note.text || "No extra notes."}</p>
      <p class="note-meta">Aim mark: ${(note.x * 100).toFixed(0)}% across, ${(note.y * 100).toFixed(0)}% down · ${note.date}</p>
    </article>`)
    .join("");
}

function saveNote() {
  renderNoteReticle();
  const note = {
    reticle: noteReticleType.options[noteReticleType.selectedIndex].text,
    distance: noteDistance.value || "0",
    distanceUnit: noteDistanceUnit.value,
    wind: noteWind.value || "0",
    elevation: noteElevation.value,
    load: noteLoad.value,
    text: noteText.value,
    x: aimPoint.x,
    y: aimPoint.y,
    image: noteReticleCanvas.toDataURL("image/png"),
    date: new Date().toLocaleString(),
  };
  rangeNotes = [note, ...rangeNotes].slice(0, 12);
  storage.set("rangeNotes", JSON.stringify(rangeNotes));
  renderSavedNotes();
  queueCloudSave();
}

function accountLabel() {
  if (!currentAccount) return "Login required";
  return `${currentAccount.email} (${currentAccount.role})`;
}

function setAuthMessage(message) {
  authMessage.textContent = message || "";
}

function updateAuthUi() {
  authStatus.textContent = accountLabel();
  document.body.classList.toggle("is-authenticated", Boolean(currentAccount && authToken));
  document.body.classList.toggle("is-admin", currentAccount?.role === "admin");
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = { error: raw || `HTTP ${response.status}` };
  }
  if (!response.ok) {
    const detail = payload.details ? ` (${payload.details})` : "";
    throw new Error(`${payload.error || `HTTP ${response.status}`}${detail}`);
  }
  return payload;
}

function appDataSnapshot() {
  return {
    form: Object.fromEntries(new FormData(form).entries()),
    displayUnits,
    rangeNotes,
    aimPoint,
  };
}

function applyCloudData(data = {}) {
  if (data.form) {
    Object.entries(data.form).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
    activeRangeUnit = form.elements.rangeUnit.value || "yd";
    updateRangeUnitLabels();
  }
  if (data.displayUnits) {
    displayUnits = data.displayUnits;
    unitButtons.forEach((button) => button.classList.toggle("active", button.dataset.units === displayUnits));
  }
  if (Array.isArray(data.rangeNotes)) {
    rangeNotes = data.rangeNotes;
    storage.set("rangeNotes", JSON.stringify(rangeNotes));
  }
  if (data.aimPoint) aimPoint = data.aimPoint;
  calculateAndRender();
  renderNoteReticle();
  renderSavedNotes();
}

function queueCloudSave() {
  if (!authToken) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await apiFetch("/data", {
        method: "POST",
        body: JSON.stringify({ data: appDataSnapshot() }),
      });
      setAuthMessage("Saved to your account.");
    } catch (error) {
      setAuthMessage(`Cloud save failed: ${error.message}`);
    }
  }, 800);
}

async function loadCloudData() {
  if (!authToken) return;
  const payload = await apiFetch("/data");
  applyCloudData(payload.data);
}

async function login() {
  try {
    const payload = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email: authEmail.value, password: authPassword.value }),
    });
    authToken = payload.token;
    currentAccount = payload.user;
    storage.set("authToken", authToken);
    storage.set("currentAccount", JSON.stringify(currentAccount));
    updateAuthUi();
    setAuthMessage("Logged in. Loading your saved data.");
    await loadCloudData();
    if (currentAccount.role === "admin") await refreshAdmin();
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function register() {
  try {
    const payload = await apiFetch("/register", {
      method: "POST",
      body: JSON.stringify({ name: authName.value, email: authEmail.value, password: authPassword.value }),
    });
    setAuthMessage(payload.needsApproval ? "Registered. Waiting for admin approval." : "Admin account created. You can log in now.");
  } catch (error) {
    setAuthMessage(error.message);
  }
}

function logout() {
  authToken = "";
  currentAccount = null;
  storage.remove("authToken");
  storage.remove("currentAccount");
  updateAuthUi();
  setAuthMessage("Logged out. Local mode is still available.");
}

async function requestPasswordReset() {
  try {
    await apiFetch("/password-reset-request", {
      method: "POST",
      body: JSON.stringify({ email: authEmail.value }),
    });
    setAuthMessage("Password reset request sent to the admin dashboard.");
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function refreshAdmin() {
  if (currentAccount?.role !== "admin") return;
  const [{ users }, { usage }] = await Promise.all([apiFetch("/admin/users"), apiFetch("/admin/usage")]);
  adminUsersTable.innerHTML = users
    .map((user) => `<tr>
      <td>${user.status}</td>
      <td>${user.name || ""}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.lastLoginAt || "Never"}</td>
      <td>${user.status === "pending" ? `<button class="use-load-button" data-approve="${user.id}" type="button">Approve</button>` : ""}</td>
      <td>
        <input class="admin-password-input" data-password-for="${user.id}" placeholder="New password" type="password" />
        <button class="use-load-button" data-reset="${user.id}" type="button">Reset</button>
      </td>
    </tr>`)
    .join("");
  usageLog.innerHTML = usage.length
    ? usage.slice(0, 60).map((entry) => `<article class="note-card"><strong>${entry.type}</strong><p>${entry.email || entry.userId || "unknown"} · ${entry.at}</p></article>`).join("")
    : `<div class="note-card"><strong>No usage yet</strong><p>Logins, saves, registrations, approvals, and reset requests will appear here.</p></div>`;
}

adminUsersTable.addEventListener("click", async (event) => {
  const approveId = event.target.dataset.approve;
  const resetId = event.target.dataset.reset;
  try {
    if (approveId) {
      await apiFetch("/admin/approve", { method: "POST", body: JSON.stringify({ userId: approveId }) });
      await refreshAdmin();
    }
    if (resetId) {
      const input = adminUsersTable.querySelector(`[data-password-for="${resetId}"]`);
      await apiFetch("/admin/reset-password", { method: "POST", body: JSON.stringify({ userId: resetId, newPassword: input.value }) });
      input.value = "";
      setAuthMessage("Password reset.");
      await refreshAdmin();
    }
  } catch (error) {
    setAuthMessage(error.message);
  }
});

function updateScopeDefaults() {
  const scopeType = form.elements.scopeType.value;
  clickUnit.textContent = scopeType === "moa" ? "moa" : scopeType === "bdc" ? "mark" : "mil";
  if (scopeType === "moa" && form.elements.clickValue.value === "0.1") form.elements.clickValue.value = "0.25";
  if (scopeType === "mil" && form.elements.clickValue.value === "0.25") form.elements.clickValue.value = "0.1";
}

function calculateAndRender() {
  updateScopeDefaults();
  const inputs = readInputs();
  const rows = calculateRows(inputs);
  syncPreviewOptions(inputs, rows);
  const syncedInputs = readInputs();
  solutionTitle.textContent = inputs.bulletName;
  renderSummary(syncedInputs, rows);
  renderTable(syncedInputs, rows);
  renderReticle(syncedInputs, rows);
}

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach((tab) => tab.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`[data-panel="${button.dataset.tab}"]`).classList.add("active");
  });
});

pageTabs.forEach((button) => {
  button.addEventListener("click", () => switchPage(button.dataset.page));
});

unitButtons.forEach((button) => {
  button.addEventListener("click", () => {
    unitButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    displayUnits = button.dataset.units;
    calculateAndRender();
    queueCloudSave();
  });
});

calibreSelect.addEventListener("change", renderCalibreDataTable);
rangeUnitSelect.addEventListener("change", () => {
  convertRangeInputs(rangeUnitSelect.value);
  calculateAndRender();
  queueCloudSave();
});
noteReticleType.addEventListener("change", renderNoteReticle);
noteDistanceUnit.addEventListener("change", () => {
  noteDistanceUnitLabel.textContent = noteDistanceUnit.value;
});
noteReticleCanvas.addEventListener("click", (event) => {
  const rect = noteReticleCanvas.getBoundingClientRect();
  aimPoint = {
    x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
    y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
  };
  renderNoteReticle();
  queueCloudSave();
});
clearAimPoint.addEventListener("click", () => {
  aimPoint = { x: 0.5, y: 0.5 };
  renderNoteReticle();
  queueCloudSave();
});
saveRangeNote.addEventListener("click", saveNote);
clearRangeNotes.addEventListener("click", () => {
  rangeNotes = [];
  storage.remove("rangeNotes");
  renderSavedNotes();
  queueCloudSave();
});
window.addEventListener("resize", renderNoteReticle);
form.addEventListener("input", () => {
  calculateAndRender();
  queueCloudSave();
});
form.addEventListener("change", () => {
  calculateAndRender();
  queueCloudSave();
});
loginButton.addEventListener("click", login);
registerButton.addEventListener("click", register);
logoutButton.addEventListener("click", logout);
resetRequestButton.addEventListener("click", requestPasswordReset);
refreshAdminButton.addEventListener("click", refreshAdmin);

resetButton.addEventListener("click", () => {
  Object.entries(defaults).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value;
  });
  calculateAndRender();
  queueCloudSave();
});

renderCalibreOptions();
renderCalibreDataTable();
updateRangeUnitLabels();
calculateAndRender();
renderNoteReticle();
renderSavedNotes();
updateAuthUi();
if (authToken) {
  loadCloudData().catch((error) => setAuthMessage(`Could not load account data: ${error.message}`));
  if (currentAccount?.role === "admin") refreshAdmin().catch((error) => setAuthMessage(error.message));
}
