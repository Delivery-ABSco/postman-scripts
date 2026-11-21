import { coworkers } from "./coworkers.mjs";
import {
  EASTERN_TIME_ZONE,
  PACIFIC_TIME_ZONE,
  UTC_TIME_ZONE,
  formatClock,
  formatDate,
  formatDateTime,
  formatDateTimeLocal,
  formatTimeZoneName,
  isValidTimeZone,
  localDateTimeToDate,
} from "./timezone.mjs";

const clockGrid = document.querySelector("#clock-grid");
const configHint = document.querySelector("#config-hint");
const meetingForm = document.querySelector("#meeting-form");
const meetingInput = document.querySelector("#meeting-time");
const meetingZone = document.querySelector("#meeting-zone");
const meetingTimeLabel = document.querySelector("#meeting-time-label");
const results = document.querySelector("#meeting-results");
const resultsList = document.querySelector("#results-list");
const resultsSource = document.querySelector("#results-source");
const formError = document.querySelector("#form-error");

const configuredCoworkers = coworkers.filter(({ name, timeZone }) =>
  name && timeZone && isValidTimeZone(timeZone));
const hasUnconfiguredCoworkers = configuredCoworkers.length !== coworkers.length;

function clockLocations() {
  return configuredCoworkers.map(({ name, timeZone }) => ({
    name,
    timeZone,
    featured: [EASTERN_TIME_ZONE, UTC_TIME_ZONE].includes(timeZone),
  }));
}

function renderClocks(date = new Date()) {
  clockGrid.replaceChildren(...clockLocations().map(({ name, timeZone, featured }) => {
    const card = document.createElement("article");
    const local = timeZone === PACIFIC_TIME_ZONE;
    card.className = `clock-card${featured ? " featured" : ""}${local ? " local" : ""}`;
    card.innerHTML = `
      <div class="clock-topline">
        <span class="clock-name"></span>
        <span class="clock-zone"></span>
      </div>
      <time class="clock-time"></time>
      <p class="clock-date"></p>`;
    card.querySelector(".clock-name").textContent = name;
    card.querySelector(".clock-zone").textContent = formatTimeZoneName(date, timeZone);
    const clock = card.querySelector(".clock-time");
    clock.textContent = formatClock(date, timeZone);
    clock.dateTime = formatDateTimeLocal(date, timeZone);
    card.querySelector(".clock-date").textContent = formatDate(date, timeZone);
    return card;
  }));
  if (hasUnconfiguredCoworkers) {
    const message = document.createElement("p");
    message.className = "clock-message";
    message.textContent = "Coworker timezone not configured yet.";
    clockGrid.append(message);
    configHint.hidden = false;
  }
}

function setupMeetingZoneOptions() {
  const zones = [...configuredCoworkers]
    .sort((left, right) => Number(right.timeZone === PACIFIC_TIME_ZONE)
      - Number(left.timeZone === PACIFIC_TIME_ZONE))
    .map(({ name, timeZone }) => [name, timeZone]);
  meetingZone.replaceChildren(...zones.map(([label, zone]) => {
    const option = document.createElement("option");
    option.value = zone;
    option.textContent = `${label} (${zone})`;
    return option;
  }));
  meetingZone.value = PACIFIC_TIME_ZONE;
  updateMeetingTimeLabel();
  meetingInput.value = formatDateTimeLocal(
    new Date(Date.now() + 60 * 60 * 1000),
    PACIFIC_TIME_ZONE,
  );
}

function updateMeetingTimeLabel() {
  const region = configuredCoworkers.find(({ timeZone }) => timeZone === meetingZone.value)?.name
    ?? meetingZone.value;
  meetingTimeLabel.textContent = region === "Pacific"
    ? "Meeting date & time (Pacific local time)"
    : `Meeting date & time (${region} local time)`;
}

function renderMeetingTimes(date) {
  const sourceRegion = configuredCoworkers.find(({ timeZone }) => timeZone === meetingZone.value)?.name
    ?? meetingZone.value;
  resultsSource.textContent = `Translated from ${sourceRegion} time`;
  resultsList.replaceChildren(...configuredCoworkers.map(({ name, timeZone }) => {
    const row = document.createElement("div");
    row.className = "result-row";
    const location = document.createElement("span");
    location.className = "result-location";
    location.textContent = `${name} · ${formatDateTime(date, timeZone)}`;
    const time = document.createElement("span");
    time.className = "result-time";
    time.textContent = formatTimeZoneName(date, timeZone);
    row.append(location, time);
    return row;
  }));
  results.hidden = false;
}

meetingZone.addEventListener("change", updateMeetingTimeLabel);

meetingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formError.hidden = true;
  try {
    renderMeetingTimes(localDateTimeToDate(meetingInput.value, meetingZone.value));
  } catch (error) {
    formError.textContent = error.message;
    formError.hidden = false;
    results.hidden = true;
  }
});

setupMeetingZoneOptions();
renderClocks();
window.setInterval(() => renderClocks(), 1000);
