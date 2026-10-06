import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const boroughs = [
  'Barking and Dagenham',
  'Barnet',
  'Bexley',
  'Brent',
  'Bromley',
  'Camden',
  'City of London',
  'Croydon',
  'Ealing',
  'Enfield',
  'Greenwich',
  'Hackney',
  'Hammersmith and Fulham',
  'Haringey',
  'Harrow',
  'Havering',
  'Hillingdon',
  'Hounslow',
  'Islington',
  'Kensington and Chelsea',
  'Kingston upon Thames',
  'Lambeth',
  'Lewisham',
  'Merton',
  'Newham',
  'Redbridge',
  'Richmond upon Thames',
  'Southwark',
  'Sutton',
  'Tower Hamlets',
  'Waltham Forest',
  'Wandsworth',
  'Westminster',
];

const outputDirectory = fileURLToPath(new URL('../public/data/transport/', import.meta.url));
const userAgent = 'RoomReviewTransportMaps/1.0 (https://roomreview.co.uk)';
const overpassEndpoints = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter',
];
const onlyBoroughs = process.argv.includes('--boroughs')
  ? process.argv[process.argv.indexOf('--boroughs') + 1].split(',').map((name) => name.trim())
  : process.argv.includes('--borough')
    ? [process.argv[process.argv.indexOf('--borough') + 1]]
    : null;
const force = process.argv.includes('--force');
const checkOnly = process.argv.includes('--check');
let nextRequestAt = 0;

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchPolite(url, options) {
  const wait = nextRequestAt - Date.now();
  if (wait > 0) await pause(wait);
  nextRequestAt = Date.now() + 1100;
  return fetch(url, {
    ...options,
    headers: { 'User-Agent': userAgent, ...options?.headers },
    signal: AbortSignal.timeout(180_000),
  });
}

function slugify(name) {
  return name.toLowerCase().replaceAll('&', 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function ringsForPolygon(geometry) {
  if (geometry.type === 'Polygon') return geometry.coordinates;
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat();
  return [];
}

function pointOnSegment(point, start, end) {
  const cross = (point[1] - start[1]) * (end[0] - start[0])
    - (point[0] - start[0]) * (end[1] - start[1]);
  const tolerance = 1e-10;
  return Math.abs(cross) <= tolerance
    && point[0] >= Math.min(start[0], end[0]) - tolerance
    && point[0] <= Math.max(start[0], end[0]) + tolerance
    && point[1] >= Math.min(start[1], end[1]) - tolerance
    && point[1] <= Math.max(start[1], end[1]) + tolerance;
}

function pointInRing(point, ring) {
  let inside = false;

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const start = ring[previous];
    const end = ring[index];
    if (pointOnSegment(point, start, end)) return true;

    const crossesRay = (start[1] > point[1]) !== (end[1] > point[1]);
    if (crossesRay && point[0] < ((end[0] - start[0]) * (point[1] - start[1])) / (end[1] - start[1]) + start[0]) {
      inside = !inside;
    }
  }

  return inside;
}

function pointInPolygon(point, geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates]
    : geometry.type === 'MultiPolygon' ? geometry.coordinates
      : [];

  return polygons.some(([outer, ...holes]) =>
    pointInRing(point, outer) && !holes.some((hole) => pointInRing(point, hole)),
  );
}

function segmentIntersectionParameter(start, end, edgeStart, edgeEnd) {
  const routeX = end[0] - start[0];
  const routeY = end[1] - start[1];
  const edgeX = edgeEnd[0] - edgeStart[0];
  const edgeY = edgeEnd[1] - edgeStart[1];
  const denominator = routeX * edgeY - routeY * edgeX;
  if (Math.abs(denominator) < 1e-12) return null;

  const offsetX = edgeStart[0] - start[0];
  const offsetY = edgeStart[1] - start[1];
  const routeParameter = (offsetX * edgeY - offsetY * edgeX) / denominator;
  const edgeParameter = (offsetX * routeY - offsetY * routeX) / denominator;
  if (routeParameter <= 1e-10 || routeParameter >= 1 - 1e-10 || edgeParameter < -1e-10 || edgeParameter > 1 + 1e-10) {
    return null;
  }

  return routeParameter;
}

function samePoint(first, second) {
  return Math.abs(first[0] - second[0]) < 1e-9 && Math.abs(first[1] - second[1]) < 1e-9;
}

function lineLength(line) {
  return line.slice(1).reduce((length, point, index) => {
    const previous = line[index];
    return length + Math.hypot(point[0] - previous[0], point[1] - previous[1]);
  }, 0);
}

function clipLineString(line, boundary) {
  const rings = ringsForPolygon(boundary);
  const clippedLines = [];
  let currentLine = [];

  const flush = () => {
    if (currentLine.length > 1) clippedLines.push(currentLine);
    currentLine = [];
  };

  for (let index = 0; index < line.length - 1; index += 1) {
    const start = line[index];
    const end = line[index + 1];
    const parameters = [0, 1];

    for (const ring of rings) {
      for (let edgeIndex = 0; edgeIndex < ring.length - 1; edgeIndex += 1) {
        const parameter = segmentIntersectionParameter(start, end, ring[edgeIndex], ring[edgeIndex + 1]);
        if (parameter !== null) parameters.push(parameter);
      }
    }

    parameters.sort((first, second) => first - second);
    const uniqueParameters = parameters.filter((parameter, parameterIndex) =>
      parameterIndex === 0 || Math.abs(parameter - parameters[parameterIndex - 1]) > 1e-10,
    );

    for (let parameterIndex = 0; parameterIndex < uniqueParameters.length - 1; parameterIndex += 1) {
      const startParameter = uniqueParameters[parameterIndex];
      const endParameter = uniqueParameters[parameterIndex + 1];
      const midpointParameter = (startParameter + endParameter) / 2;
      const midpoint = [
        start[0] + (end[0] - start[0]) * midpointParameter,
        start[1] + (end[1] - start[1]) * midpointParameter,
      ];

      if (!pointInPolygon(midpoint, boundary)) {
        flush();
        continue;
      }

      const clippedStart = [
        start[0] + (end[0] - start[0]) * startParameter,
        start[1] + (end[1] - start[1]) * startParameter,
      ];
      const clippedEnd = [
        start[0] + (end[0] - start[0]) * endParameter,
        start[1] + (end[1] - start[1]) * endParameter,
      ];

      if (currentLine.length && samePoint(currentLine[currentLine.length - 1], clippedStart)) {
        currentLine.push(clippedEnd);
      } else {
        flush();
        currentLine = [clippedStart, clippedEnd];
      }
    }

    if (!pointInPolygon(end, boundary)) flush();
  }

  flush();
  return clippedLines;
}

async function boroughBoundary(name) {
  for (const query of [`London Borough of ${name}, London, UK`, `${name}, London, UK`]) {
    const search = new URL('https://nominatim.openstreetmap.org/search');
    search.searchParams.set('format', 'jsonv2');
    search.searchParams.set('polygon_geojson', '1');
    search.searchParams.set('limit', '50');
    search.searchParams.set('q', query);

    const response = await fetchPolite(search, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Nominatim returned HTTP ${response.status}`);
    const results = await response.json();
    const candidates = results.filter((result) =>
      result.osm_type === 'relation'
      && result.category === 'boundary'
      && result.type === 'administrative'
      && ['Polygon', 'MultiPolygon'].includes(result.geojson?.type),
    );
    const normalizedName = name.toLowerCase();
    const match = candidates.find((result) => result.name?.toLowerCase() === `london borough of ${normalizedName}`)
      ?? candidates.find((result) => result.name?.toLowerCase().includes(normalizedName))
      ?? candidates.find((result) => result.display_name?.toLowerCase().includes(normalizedName));

    if (match) return match;
  }

  throw new Error('No matching administrative boundary polygon found');
}

async function overpassQuery(query, boroughName, layerName) {
  let lastError;

  for (const endpoint of overpassEndpoints) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetchPolite(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ data: query }),
        });
        if (!response.ok) throw new Error(`Overpass returned HTTP ${response.status}`);
        const result = await response.json();
        if (!Array.isArray(result.elements) || result.remark) {
          throw new Error(result.remark ?? 'Overpass response contained no elements');
        }
        if (!result.elements.length) throw new Error('Overpass returned an empty result');
        return result.elements;
      } catch (error) {
        lastError = error;
        await pause(1000 * (attempt + 1));
      }
    }
  }

  throw new Error(`Could not fetch ${boroughName} ${layerName}: ${lastError?.message ?? 'unknown error'}`);
}

async function transportElements(boundingbox, boroughName) {
  const [south, north, west, east] = boundingbox.map(Number);
  const bounds = `${south},${west},${north},${east}`;
  const stopsQuery = `[out:json][timeout:60];(nwr(${bounds})["public_transport"~"^(platform|stop_position|station)$"];node(${bounds})["highway"="bus_stop"];);out center;`;
  const routesQuery = `[out:json][timeout:120];rel(${bounds})["type"="route"]["route"~"^(bus|train|subway|tram|light_rail|ferry)$"];out geom;`;
  const stops = await overpassQuery(stopsQuery, boroughName, 'stops');
  const routes = await overpassQuery(routesQuery, boroughName, 'routes');
  return [...stops, ...routes];
}

function makeFeatures(name, boundary, elements) {
  const routeWays = new Map([['major', new Map()], ['other', new Map()]]);
  const routeRelations = new Map([['major', new Map()], ['other', new Map()]]);
  const stops = new Map();
  const stations = new Map();

  for (const element of elements) {
    const tags = element.tags ?? {};

    if (element.type === 'relation' && tags.type === 'route') {
      const group = tags.route === 'bus' ? 'other' : 'major';
      const memberWays = new Set();
      for (const member of element.members ?? []) {
        if (member.type === 'way' && member.geometry?.length > 1) {
          routeWays.get(group).set(member.ref, member.geometry.map(({ lon, lat }) => [lon, lat]));
          memberWays.add(member.ref);
        }
      }
      routeRelations.get(group).set(element.id, memberWays);
      continue;
    }

    const point = element.type === 'node' && Number.isFinite(element.lon) && Number.isFinite(element.lat)
      ? [element.lon, element.lat]
      : element.center && Number.isFinite(element.center.lon) && Number.isFinite(element.center.lat)
        ? [element.center.lon, element.center.lat]
        : null;
    if (!point || !pointInPolygon(point, boundary.geojson)) continue;

    const coordinateKey = point.map((value) => value.toFixed(6)).join(',');
    const isStation = tags.railway === 'station'
      || tags.railway === 'halt'
      || tags.public_transport === 'station'
      || ['subway', 'light_rail', 'monorail'].includes(tags.station);

    if (isStation) {
      const stationName = tags.name ?? tags['name:en'] ?? tags.ref ?? 'Unnamed station';
      stations.set(`${coordinateKey}:${stationName}`, {
        type: 'Feature',
        properties: { kind: 'station', name: stationName },
        geometry: { type: 'Point', coordinates: point },
      });
    } else if (tags.highway === 'bus_stop'
      || ['platform', 'stop_position'].includes(tags.public_transport)
      || tags.amenity === 'bus_station') {
      stops.set(coordinateKey, point);
    }
  }

  const features = [{
    type: 'Feature',
    properties: { kind: 'boundary' },
    geometry: boundary.geojson,
  }];

  const routeCounts = { major: 0, other: 0 };
  for (const group of ['major', 'other']) {
    const clippedWays = new Map();
    for (const [wayId, line] of routeWays.get(group)) {
      const clipped = clipLineString(line, boundary.geojson);
      if (clipped.length) clippedWays.set(wayId, clipped);
    }

    routeCounts[group] = [...routeRelations.get(group).values()]
      .filter((memberWays) => [...memberWays].some((wayId) => clippedWays.has(wayId))).length;
    const coordinates = [...clippedWays.values()].flat();
    if (coordinates.length) {
      features.push({
        type: 'Feature',
        properties: { kind: 'routes', class: group, routeCount: routeCounts[group] },
        geometry: { type: 'MultiLineString', coordinates },
      });
    }
  }

  const stopCoordinates = [...stops.values()];
  if (stopCoordinates.length) {
    features.push({
      type: 'Feature',
      properties: { kind: 'stops' },
      geometry: { type: 'MultiPoint', coordinates: stopCoordinates },
    });
  }
  features.push(...stations.values());

  return {
    type: 'FeatureCollection',
    properties: {
      borough: name,
      generatedAt: new Date().toISOString(),
      source: '© OpenStreetMap contributors, ODbL 1.0',
      majorRouteCount: routeCounts.major,
      otherRouteCount: routeCounts.other,
      stopCount: stopCoordinates.length,
      stationCount: stations.size,
    },
    features,
  };
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const unknownBoroughs = onlyBoroughs?.filter((name) => !boroughs.includes(name)) ?? [];
if (unknownBoroughs.length) {
  throw new Error(`Unknown boroughs "${unknownBoroughs.join(', ')}". Use one of: ${boroughs.join(', ')}`);
}

if (checkOnly) {
  const failures = [];
  const checkedBoroughs = onlyBoroughs ?? boroughs;

  for (const name of checkedBoroughs) {
    const path = `${outputDirectory}/${slugify(name)}.geojson`;
    try {
      const collection = JSON.parse(await readFile(path, 'utf8'));
      const kinds = new Set(collection.features.map((feature) => feature.properties?.kind));
      const boundary = collection.features.find((feature) => feature.properties?.kind === 'boundary')?.geometry;
      const routeFeatures = collection.features.filter((feature) => feature.properties?.kind === 'routes');
      const pointFeatures = collection.features.filter((feature) => ['stops', 'station'].includes(feature.properties?.kind));
      let outsideRouteLines = 0;
      const routeLineIssues = [];
      for (const feature of routeFeatures) {
        for (const [lineIndex, line] of feature.geometry.coordinates.entries()) {
          const clipped = clipLineString(line, boundary);
          const originalLength = lineLength(line);
          const clippedLength = clipped.reduce((length, part) => length + lineLength(part), 0);
          if (!clipped.length || Math.abs(originalLength - clippedLength) > Math.max(1e-9, originalLength * 1e-8)) {
            outsideRouteLines += 1;
            if (routeLineIssues.length < 4) {
              routeLineIssues.push({
                group: feature.properties.class,
                lineIndex,
                inputLength: line.length,
                clippedLengths: clipped.map((part) => part.length),
                firstInput: line.slice(0, 2),
                firstClipped: clipped[0]?.slice(0, 2),
              });
            }
          }
        }
      }
      let outsidePoints = 0;
      for (const feature of pointFeatures) {
        const points = feature.geometry.type === 'MultiPoint'
          ? feature.geometry.coordinates
          : [feature.geometry.coordinates];
        outsidePoints += points.filter((point) => !pointInPolygon(point, boundary)).length;
      }
      if (collection.type !== 'FeatureCollection'
        || collection.properties?.borough !== name
        || !kinds.has('boundary')
        || !kinds.has('routes')
        || (!kinds.has('stops') && !kinds.has('station'))
        || outsideRouteLines > 0
        || outsidePoints > 0) {
        failures.push(`${name}: ${outsideRouteLines} route lines and ${outsidePoints} points outside borough, or required layers missing`);
        if (routeLineIssues.length) process.stderr.write(`${JSON.stringify(routeLineIssues)}\n`);
      }
    } catch (error) {
      failures.push(`${name}: ${error.code === 'ENOENT' ? 'GeoJSON file is missing' : error.message}`);
    }
  }

  if (failures.length) {
    process.stderr.write(`${failures.join('\n')}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`Validated GeoJSON coverage, layers, and containment for ${checkedBoroughs.length} boroughs.\n`);
  }
} else {
await mkdir(outputDirectory, { recursive: true });
const targets = onlyBoroughs ?? boroughs;
const failures = [];

for (const name of targets) {
  const outputPath = `${outputDirectory}/${slugify(name)}.geojson`;
  if (!force && await fileExists(outputPath)) {
    process.stdout.write(`Skipping ${name}; GeoJSON already exists.\n`);
    continue;
  }

  try {
    process.stdout.write(`Fetching ${name} boundary...\n`);
    const boundary = await boroughBoundary(name);
    process.stdout.write(`Fetching ${name} routes and stops...\n`);
    const elements = await transportElements(boundary.boundingbox, name);
    process.stdout.write(`Received ${elements.length} OSM elements for ${name}.\n`);
    const collection = makeFeatures(name, boundary, elements);
    const { majorRouteCount, otherRouteCount, stopCount, stationCount } = collection.properties;
    if (majorRouteCount + otherRouteCount + stopCount + stationCount === 0) {
      throw new Error('No route or stop geometry was returned');
    }
    await writeFile(outputPath, `${JSON.stringify(collection)}\n`, 'utf8');
    process.stdout.write(`Wrote ${name}: ${majorRouteCount + otherRouteCount} routes, ${stopCount} stops, ${stationCount} stations.\n`);
  } catch (error) {
    failures.push({ name, message: error.message });
    process.stderr.write(`Failed ${name}: ${error.message}\n`);
  }
}

if (failures.length) {
  process.stderr.write(`Failed boroughs: ${failures.map(({ name }) => name).join(', ')}\n`);
  process.exitCode = 1;
}
}