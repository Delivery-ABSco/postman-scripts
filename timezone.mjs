export const EASTERN_TIME_ZONE = "America/New_York";
export const PACIFIC_TIME_ZONE = "America/Los_Angeles";
export const UTC_TIME_ZONE = "UTC";

const dateTimeFormatter = (timeZone, options) => new Intl.DateTimeFormat("en-US", {
  timeZone,
  ...options,
});

export function isValidTimeZone(timeZone) {
  try {
    dateTimeFormatter(timeZone, { year: "numeric" });
    return true;
  } catch {
    return false;
  }
}

export function getZonedParts(date, timeZone) {
  const parts = dateTimeFormatter(timeZone, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts
    .filter(({ type }) => type !== "literal")
    .map(({ type, value }) => [type, Number(value)]));
}

function wallTimeAsUtc(parts) {
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

function sameWallTime(left, right) {
  return ["year", "month", "day", "hour", "minute"].every((key) => left[key] === right[key]);
}

export function localDateTimeToDate(value, timeZone) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new RangeError("Choose a valid meeting date and time.");
  if (!isValidTimeZone(timeZone)) throw new RangeError(`“${timeZone}” is not a valid IANA timezone.`);

  const [, year, month, day, hour, minute] = match.map(Number);
  const wanted = { year, month, day, hour, minute };
  const wallUtc = wallTimeAsUtc(wanted);
  const checkDate = new Date(wallUtc);
  if (checkDate.getUTCFullYear() !== year || checkDate.getUTCMonth() + 1 !== month
    || checkDate.getUTCDate() !== day || hour > 23 || minute > 59) {
    throw new RangeError("Choose a valid meeting date and time.");
  }

  const offsets = new Set();
  for (let hours = -48; hours <= 48; hours += 3) {
    const sample = new Date(wallUtc + hours * 60 * 60 * 1000);
    const parts = getZonedParts(sample, timeZone);
    offsets.add(wallTimeAsUtc(parts) - sample.getTime());
  }

  const candidates = [...offsets]
    .map((offset) => new Date(wallUtc - offset))
    .filter((candidate) => sameWallTime(getZonedParts(candidate, timeZone), wanted))
    .sort((left, right) => left - right);

  if (candidates.length === 0) {
    throw new RangeError("That local time does not exist because the clocks move forward. Choose another time.");
  }

  // When clocks move back, choose the earlier occurrence of the repeated local time.
  return candidates[0];
}

export function formatClock(date, timeZone) {
  return dateTimeFormatter(timeZone, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h12",
  }).format(date);
}

export function formatDate(date, timeZone) {
  return dateTimeFormatter(timeZone, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(date, timeZone) {
  return dateTimeFormatter(timeZone, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h12",
  }).format(date);
}

export function formatTimeZoneName(date, timeZone) {
  if (timeZone === UTC_TIME_ZONE) return "UTC";
  if (timeZone === "Europe/London" || timeZone === "Australia/Melbourne") {
    const utcMinute = Math.floor(date.getTime() / 60_000) * 60_000;
    const offsetMinutes = (wallTimeAsUtc(getZonedParts(date, timeZone)) - utcMinute) / 60_000;
    const regionNames = {
      "Europe/London": { 0: "GMT", 60: "BST" },
      "Australia/Melbourne": { 600: "AEST", 660: "AEDT" },
    };
    if (regionNames[timeZone][offsetMinutes]) return regionNames[timeZone][offsetMinutes];
  }
  const locale = timeZone.startsWith("Europe/")
    ? "en-GB"
    : timeZone.startsWith("Australia/")
      ? "en-AU"
      : "en-US";
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(date);
  return parts.find(({ type }) => type === "timeZoneName")?.value ?? timeZone;
}

export function formatDateTimeLocal(date, timeZone) {
  const { year, month, day, hour, minute } = getZonedParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
