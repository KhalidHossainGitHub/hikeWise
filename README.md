# HikeWise

**HikeWise** is a trail difficulty visualizer that helps you understand how challenging a hike will feel *before* you start. Instead of judging a trail by distance alone, you can upload a GPX route file and instantly see which parts are easy, moderate, or tough — clearly color-coded on an interactive 3D map.

It considers elevation and weather conditions to give you a more realistic sense of what to expect, so you can plan better, hike smarter, and avoid surprises on the trail. While hiking, you can also enable live GPS tracking to see your position on the route and which segment you're currently on. The app works smoothly on both desktop and mobile devices.

🔗 **Live Demo:** [hikewise-v2.vercel.app](https://hikewise-v2.vercel.app)

<p align="center">
  <img width="932" alt="HikeWise Preview" src="public\hikeWise-preview.png">
  <br>
  <b>Figure 1: HikeWise Preview Design</b>
</p>

## Project Overview

HikeWise enables hikers and outdoor enthusiasts to:

- **Upload GPX Routes**: Drag-and-drop or use the file picker to load any GPX file containing trackpoints with elevation data. Alternatively, choose from a selection of pre-loaded sample trails to explore instantly.
- **Visualize Difficulty on a 3-D Map**: View your entire route rendered on a Mapbox satellite map with real DEM terrain exaggeration, atmospheric sky layer, and smooth camera transitions.
- **Analyze Segment Difficulty**: The route is split into segments, each scored and color-coded — 🟢 Easy, 🟡 Moderate, or 🔴 Hard — based on elevation grade and real-time weather conditions at the trail's location.
- **Explore Segments Interactively**: Click any segment in the sidebar list to highlight it on the map and fly to its location for a closer look.
- **View Route Summary**: See key stats at a glance — total distance, total ascent, average grade, maximum difficulty score, current temperature, and precipitation.
- **Track Your Location on Trail**: Enable live GPS tracking to see your position on the map, follow your location as you hike, and automatically highlight the nearest route segment when you're on the trail.
- **Switch Map Styles**: Toggle between Satellite, Streets, and Outdoors map styles while preserving 3-D terrain.

<p align="center">
  <img width="800" alt="Segment Interaction" src="public\hikeWise-segments.png">
  <br>
  <b>Figure 2: Clicking a segment to highlight it and fly to its location on the map.</b>
</p>

## Features

- **GPX Parsing**: Parses GPX files using `@mapbox/togeojson` with a manual XML fallback, extracting latitude, longitude, and elevation from every trackpoint.
- **3-D Satellite Map**: Powered by Mapbox GL JS with `satellite-streets-v12` style, real DEM terrain (1.4× exaggeration), atmospheric sky layer, and smooth animated camera transitions.
- **Difficulty Scoring Algorithm**: Each segment receives a numeric score based on its elevation grade and current weather penalties, then classified as Easy, Moderate, or Hard.
- **Color-Coded Route Segments**: Segments are drawn directly on the map with difficulty-based colors — green for easy, amber for moderate, and red for hard.
- **Live Weather Integration**: Fetches today's max temperature and precipitation sum from the free Open-Meteo API using the route's midpoint coordinates.
- **Interactive Segment List**: A scrollable sidebar list of all segments with distance, elevation gain, grade, and difficulty badge — click to fly-to on the map.
- **Route Summary Card**: Displays total distance (km), total ascent (m), average grade (%), max difficulty score, temperature (°C), and precipitation (mm).
- **Live GPS Tracking**: Uses the browser Geolocation API to show a live position marker on the map, follow your location while hiking, and highlight the current trail segment when you're within range of the route.
- **Sample Trails**: Five pre-loaded Ontario trails (Bruce Trail, Centennial Ridges, Niagara Whirlpool Loop, Orchard & Vista Loop, Rouge Valley Loop) available for instant exploration without uploading a file.
- **Responsive Design**: Fully functional on desktop and mobile. On desktop, the sidebar slides in from the left. On mobile, route details appear in a compact bottom panel with a peek bar showing key stats.

<p align="center">
  <img width="350" alt="Mobile Responsive View" src="public\hikewise-mobileView.jpeg">
  <br>
  <b>Figure 3: Mobile-responsive bottom panel with peek bar and expandable route details.</b>
</p>

## Difficulty Algorithm

The difficulty of each segment is calculated using a combination of terrain steepness and real-time weather conditions:

```
score = 20                             // base difficulty
      + |segment_grade_%| × 3         // steeper grade = harder
      + (temperature > 30 °C ? 15 : 0) // heat penalty
      + (precipitation > 2 mm ? 10 : 0) // rain penalty
```

The segment grade is computed as `(elevation gain / horizontal distance) × 100`. The raw score is then classified into three difficulty levels:

| Score Range | Level | Color |
|---|---|---|
| Below 40 | 🟢 Easy | Green (`#22c55e`) |
| 40 – 70 | 🟡 Moderate | Amber (`#f59e0b`) |
| Above 70 | 🔴 Hard | Red (`#ef4444`) |

Weather penalties are applied globally to all segments based on the live forecast at the route's midpoint. This means the same trail can shift from Easy to Moderate on a hot or rainy day, giving hikers a real-time awareness of conditions.

<p align="center">
  <img width="600" alt="Difficulty Visualization" src="public\hikeWise-difficultyVisual.png">
  <br>
  <b>Figure 4: Color-coded difficulty segments rendered on the 3-D terrain map.</b>
</p>

## Technologies Used

- **React 18**: Component-based UI with hooks and refs for state management and imperative map control.
- **TypeScript 5**: Full type safety across all components, hooks, utilities, and API responses.
- **Vite 6**: Lightning-fast development server and optimized production builds.
- **Mapbox GL JS 3**: 3-D satellite map rendering with DEM terrain, sky layers, and programmatic camera control.
- **@mapbox/togeojson**: GPX-to-GeoJSON conversion for trackpoint extraction.
- **Open-Meteo API**: Free weather forecast API providing daily max temperature and precipitation sum.
- **Browser Geolocation API**: Live GPS tracking for on-trail position and segment awareness (requires user permission and HTTPS).

<p align="center">
  <img width="700" alt="Live GPS Tracking" src="public\hikeWise-LiveGPSTracking.png">
  <br>
  <b>Figure 5: Live GPS tracking with a position marker on the map, automatic segment highlight, and on-trail status pill.</b>
</p>

## How to Use

1. **Install Dependencies**:
   - Open your terminal and install the required packages:
     ```bash
     git clone https://github.com/KhalidHossainGitHub/hikeWise-v2.git
     cd hikeWise-v2
     npm install
     ```

2. **Set Up Environment Variables**:
   - Create a `.env` file in the project root with your free [Mapbox access token](https://account.mapbox.com/access-tokens/):
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and add your token:
     ```
     VITE_MAPBOX_TOKEN=pk.your_token_here
     ```

3. **Run the Application**:
   - Start the development server:
     ```bash
     npm run dev
     ```
   - Open **http://localhost:5173** in your browser.

4. **Explore a Trail**:
   - Pick one of the five pre-loaded **Sample Trails** to explore instantly, or drag-and-drop your own `.gpx` file onto the upload zone.
   - The map will fly to your route and render color-coded difficulty segments on 3-D terrain.
   - Use the **sidebar panel** (desktop) or **bottom panel** (mobile) to view the route summary, switch map styles, recenter the camera, and click individual segments to fly to them.
   - Click **↩ Load another GPX** to reset and try a different trail.

5. **Track Your Location (On Trail)**:
   - After loading a route, click **Track Location** in the panel and allow location access when prompted.
   - Your live position appears as a blue dot on the map; the view follows you as you move.
   - When you're on the trail, the nearest segment is highlighted automatically and a compact status pill appears at the top of the map (e.g. segment number and difficulty).
   - Click **Stop Tracking** to turn off live GPS.
   - **Note:** Location tracking works best on a phone with GPS outdoors. For development testing away from the trail, use Chrome DevTools → **Sensors** to simulate coordinates on the route.

<p align="center">
  <img width="600" alt="Sample Trail Selection" src="public\hikeWise-sampleTrails.png">
  <br>
  <b>Figure 6: Selecting a pre-loaded sample trail for instant exploration.</b>
</p>

## License

MIT
