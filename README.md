# postman-scripts

Postman pre-request scripts and Jest tests.

## Team timezone planner

The repository also includes a small, dependency-free timezone landing page. Open
`index.html` from a local static web server (for example, `python3 -m http.server`)
to view it. `coworkers.mjs` lists the supplied team regions and IANA timezone IDs;
replace the region labels with coworker names when they are available.

The meeting planner starts from Pacific local time, displayed as
`America/San_Francisco` (PST/PDT). DST-aware conversion uses the valid IANA zone
`America/Los_Angeles`; `America/San_Francisco` is a display label, not a valid
IANA timezone. Another configured region can be selected as the meeting's
source timezone. Times skipped by a daylight-saving transition are rejected;
repeated times use their earlier occurrence. Run the timezone tests with
`node --test`.
