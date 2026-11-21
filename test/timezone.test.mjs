import test from "node:test";
import assert from "node:assert/strict";
import {
  EASTERN_TIME_ZONE,
  PACIFIC_TIME_ZONE,
  UTC_TIME_ZONE,
  formatDateTime,
  formatTimeZoneName,
  localDateTimeToDate,
} from "../timezone.mjs";
import { coworkers } from "../coworkers.mjs";

test("converts Eastern meeting times across daylight saving transitions", () => {
  const winter = localDateTimeToDate("2026-01-15T09:00", EASTERN_TIME_ZONE);
  const summer = localDateTimeToDate("2026-07-15T09:00", EASTERN_TIME_ZONE);

  assert.equal(winter.toISOString(), "2026-01-15T14:00:00.000Z");
  assert.equal(summer.toISOString(), "2026-07-15T13:00:00.000Z");
});

test("schedules from Pacific time with PST/PDT offsets", () => {
  const winter = localDateTimeToDate("2026-01-15T09:00", PACIFIC_TIME_ZONE);
  const summer = localDateTimeToDate("2026-07-15T09:00", PACIFIC_TIME_ZONE);

  assert.equal(winter.toISOString(), "2026-01-15T17:00:00.000Z");
  assert.equal(summer.toISOString(), "2026-07-15T16:00:00.000Z");
  assert.equal(formatDateTime(winter, EASTERN_TIME_ZONE), "Thu, Jan 15, 12:00 PM");
  assert.equal(formatDateTime(winter, UTC_TIME_ZONE), "Thu, Jan 15, 5:00 PM");
});

test("converts a meeting entered in a coworker's timezone to Eastern and UTC", () => {
  const instant = localDateTimeToDate("2026-07-15T09:00", "America/Los_Angeles");

  assert.equal(formatDateTime(instant, EASTERN_TIME_ZONE), "Wed, Jul 15, 12:00 PM");
  assert.equal(formatDateTime(instant, UTC_TIME_ZONE), "Wed, Jul 15, 4:00 PM");
});

test("converts meetings across all configured regions using their summer offsets", () => {
  const localMeetingTimes = new Map([
    ["UTC", "2026-07-15T16:00"],
    ["London", "2026-07-15T17:00"],
    ["Eastern", "2026-07-15T12:00"],
    ["Central", "2026-07-15T11:00"],
    ["Mountain", "2026-07-15T10:00"],
    ["Pacific", "2026-07-15T09:00"],
    ["Melbourne", "2026-07-16T02:00"],
  ]);

  for (const { name, timeZone } of coworkers) {
    assert.equal(
      localDateTimeToDate(localMeetingTimes.get(name), timeZone).toISOString(),
      "2026-07-15T16:00:00.000Z",
      `${name} should map to the shared UTC instant`,
    );
  }
});

test("uses Melbourne daylight saving time in January", () => {
  const instant = localDateTimeToDate("2026-01-16T03:00", "Australia/Melbourne");

  assert.equal(instant.toISOString(), "2026-01-15T16:00:00.000Z");
});

test("shows familiar timezone abbreviations for each region and season", () => {
  const winter = new Date("2026-01-15T16:00:00Z");
  const summer = new Date("2026-07-15T16:00:00Z");

  assert.equal(formatTimeZoneName(winter, "Europe/London"), "GMT");
  assert.equal(formatTimeZoneName(summer, "Europe/London"), "BST");
  assert.equal(formatTimeZoneName(winter, "Australia/Melbourne"), "AEDT");
  assert.equal(formatTimeZoneName(summer, "Australia/Melbourne"), "AEST");
  assert.equal(formatTimeZoneName(summer, PACIFIC_TIME_ZONE), "PDT");
  assert.equal(formatTimeZoneName(summer, EASTERN_TIME_ZONE), "EDT");
  assert.equal(formatTimeZoneName(summer, UTC_TIME_ZONE), "UTC");
});

test("chooses the earlier occurrence of an ambiguous fall-back time", () => {
  const instant = localDateTimeToDate("2026-11-01T01:30", EASTERN_TIME_ZONE);

  assert.equal(instant.toISOString(), "2026-11-01T05:30:00.000Z");
});

test("rejects local times skipped by the spring-forward transition", () => {
  assert.throws(
    () => localDateTimeToDate("2026-03-08T02:30", EASTERN_TIME_ZONE),
    /does not exist/,
  );
});
