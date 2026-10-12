# Astrodash Spec

## Overview

This application is a lightweight application that will show a dashboard with relevant widgets to help out in the decision whether or not it's a suitable night for astrophotography.

The following widgets will be available:

- A widget showing the current phase of the moon as an image and as percentage of the full moon. 100% means full moon.
- A widget with the weather report for the upcoming 15 hours.
- A widget for the aurora borealis Kp index forecast
- A weather report widget for wind speeds
- A weather report widget for the total rain or snow
- A precipitation graph widget
- A widget for the expected seeing conditions
- Cloud coverage widget

The data for all of these widgets will be fetched from public API's relevant to each widget.

All forecasts cover a fixed 15 hours from page load time.

## Users

This is for astrophotographers trying to decide if it's worth starting a nights imaging session from their location. The location will be determined by zip code. The first version supports Swedish zip codes only.

## Goals

- Help astrophotographers decide whether tonight is worth starting an imaging session.
- Show the relevant conditions on one dashboard: moon phase, weather, wind, rain/snow, cloud coverage, seeing and aurora Kp forecast.
- Stay lightweight.

## Non-goals

- Locations outside Sweden (first version).
- A combined Yes/No verdict.
- User accounts or saved settings beyond the cached data.
- Imperial units.
- Forecasts beyond 15 hours.

## Features

### Moon phase widget

This widget will show the current state of the moon as an image. A new image is created for this, drawn to match the current phase. Under the moon image, a percentage will be shown to further visualize the moons state. 0% is new moon and 100% is full moon. The phase shown is the phase right now.

The widget also shows a graph of the moon's height over the horizon for the 15 hours from page load, for the user's zip code location.

### Weather report widget

This widget will show the weather report for the upcoming 15 hours as an hourly table: clouds, winds, precipitation, dew point, temperature and humidity.

### Rainfall / Snowfall widget

This widget will show a simple number: the total precipitation (rain or snow) in mm during the upcoming 15 hours, so the user quickly knows if rain or snow is expected during the night. It uses the same hourly mm data as the precipitation graph.

### Precipitation widget

This widget will show a line graph of the precipitation only, in mm, for the upcoming 15 hours. The x-axis is the hours and the y-axis is the precipitation in mm.

### Wind speeds widget

This widget will show the expected wind speeds throughout the upcoming 15 hours. The information will show min winds and max winds expected in the example format: 2m/s | 10m/s

### Cloud coverage widget

This widget will show the cloud coverage for the upcoming 15 hours as an hourly display.

### Seeing widget

This widget will show a graph of the expected seeing conditions for the upcoming 15 hours. The x-axis is the time. The y-axis has two scales for the same values: the Pickering scale on the left side and arcseconds on the right side. Good seeing is at the top.

The graph's background is colored by Pickering value:

| Pickering | Color |
| --- | --- |
| 8–10 | Dark green |
| 6–7 | Light green |
| 4–5 | Yellow |
| 1–3 | Dark red |

The 7Timer! seeing value is converted to both scales:

| 7Timer! value | Arcseconds | Pickering |
| --- | --- | --- |
| 1 | < 0.5" | 10 |
| 2 | 0.5–0.75" | 9 |
| 3 | 0.75–1" | 8 |
| 4 | 1–1.25" | 7 |
| 5 | 1.25–1.5" | 6 |
| 6 | 1.5–2" | 5 |
| 7 | 2–2.5" | 4 |
| 8 | > 2.5" | 3 |

### Aurora borealis widget

This widget will show a graph of the forecasted Kp index for the upcoming 15 hours from page load. The x-axis is the hours and the y-axis is the Kp index (0–9). NOAA forecasts one Kp value per 3-hour block.

The graph's background visualizes the probability of aurora in colors, based on the zip code's latitude. Each latitude has a threshold Kp: the lowest Kp at which aurora reaches it.

| Kp | Probability | Color |
| --- | --- | --- |
| At or above the threshold | High | Red |
| 1–2 below the threshold | Medium | Yellow |
| Lower | Low | Green |

The threshold comes from this approximate table of the southernmost latitude where aurora is visible:

| Kp | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Latitude °N | 66.5 | 64.5 | 62.4 | 60.4 | 58.3 | 56.3 | 54.2 | 52.2 | 50.1 | 48.1 |

Example: zip code 11245 (Stockholm, 59.3°N) has threshold Kp 4: green 0–2, yellow 2–4, red 4–9.

### Zip code input

An input field where the user enters their current Swedish zip code. Only five digits are accepted, in the format "XXX XX" or "XXXXX"; anything else is rejected. The zip code is converted to latitude/longitude coordinates, which all APIs consume. The zip code is saved in localStorage and restored on the next visit.

## Data sources (proposed)

All free / open-data, no API key required.

| Data | Source | Notes |
| --- | --- | --- |
| Zip code → coordinates | [Zippopotam.us](https://api.zippopotam.us/se/11122) | Swedish postcodes |
| Weather, wind, precipitation, clouds, dew point, humidity | [Open-Meteo](https://open-meteo.com/) | Hourly, metric, CC BY 4.0 |
| Seeing | [7Timer! ASTRO](https://www.7timer.info/doc.php) | 3-hourly seeing scale |
| Aurora Kp forecast | [NOAA SWPC Kp forecast](https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json) | 3-hour Kp values, covers the full 15 hours |
| Moon phase | Calculated locally, no API | e.g. `astronomy-engine` (MIT) |

## Technical constraints

- The application is a web application
- Use NextJS as the web framework
- Use MUI design and libraries, styled with Emotion (MUI default). No tailwind.
- Only use free or open-data API's and open source dependencies
- Metric units only
- Data is only fetched on page load. All external API calls go through NextJS route handlers and are cached in the NextJS server cache for 10 minutes.
- The dashboard lives at `/dashboard`, built from scratch. Existing routes `/`, `/moon-phases` and `/api/moon-phases` are removed.

## Design

The look and feel will follow standard MUI design. Use Emotion for styling.

The application adapts to the system's dark mode setting: dark theme when the system uses dark mode, light theme otherwise.

Widgets are laid out in a grid of 3 per row. The weather report widget spans the full width. The layout is responsive and must work on mobile devices.

The widgets are movable by drag and drop within the grid, using a drag handle in each widget's header. Dragging works with mouse, touch and keyboard. The widget order is saved in localStorage and restored on the next visit.

On every graph, hovering with the mouse shows the x and y values of the nearest point in a tooltip.

## Milestones

1. Remove existing code; set up MUI with Emotion.
2. Zip code input and lookup to coordinates.
3. Data fetching and 10-minute cache.
4. Moon phase widget.
5. Weather, wind, rain/snow and cloud coverage widgets.
6. Seeing widget.
7. Aurora widget.

## Open questions

-
