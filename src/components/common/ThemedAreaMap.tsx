import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ThemedAreaMapProps {
	boroughName: string;
	slug: string;
	latitude: number;
	longitude: number;
}

type MapStatus = 'loading' | 'ready' | 'unavailable';

export default function ThemedAreaMap({ boroughName, slug, latitude, longitude }: ThemedAreaMapProps) {
	const mapElement = useRef<HTMLDivElement>(null);
	const [status, setStatus] = useState<MapStatus>('loading');

	useEffect(() => {
		let cancelled = false;
		let map: L.Map | undefined;

		const loadMap = async () => {
			setStatus('loading');

			try {
				const response = await fetch(`${import.meta.env.BASE_URL}data/transport/${encodeURIComponent(slug.toLowerCase())}.geojson`);
				if (!response.ok) throw new Error('Borough transport geometry is not available');
				const data = await response.json();
				if (cancelled || !mapElement.current) return;

				map = L.map(mapElement.current, { scrollWheelZoom: true, zoomControl: true });
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
					maxZoom: 19,
				}).addTo(map);

				const boundary = L.geoJSON(data, {
					filter: (feature) => feature.properties?.kind === 'boundary',
					style: { color: '#8b0000', weight: 2, fillColor: '#8b0000', fillOpacity: 0.08 },
				});
				const majorRoutes = L.geoJSON(data, {
					filter: (feature) => feature.properties?.kind === 'routes' && feature.properties?.class === 'major',
					style: { color: '#176b87', weight: 2.5, opacity: 0.85 },
					onEachFeature: (feature, layer) => {
						const routeCount = Number(feature.properties?.routeCount ?? 0);
						layer.bindTooltip(`${routeCount} major routes`);
					},
				});
				const otherRoutes = L.geoJSON(data, {
					filter: (feature) => feature.properties?.kind === 'routes' && feature.properties?.class !== 'major',
					style: { color: '#6c9b72', weight: 1.25, opacity: 0.7 },
				});
				const stops = L.geoJSON(data, {
					filter: (feature) => feature.properties?.kind === 'stops',
					pointToLayer: (_feature, latLng) => L.circleMarker(latLng, {
						radius: 2.5,
						color: '#b45309',
						weight: 1,
						fillColor: '#f59e0b',
						fillOpacity: 0.85,
					}),
				});
				const stations = L.geoJSON(data, {
					filter: (feature) => feature.properties?.kind === 'station',
					pointToLayer: (_feature, latLng) => L.circleMarker(latLng, {
						radius: 4,
						color: '#572b69',
						weight: 1,
						fillColor: '#a66bb5',
						fillOpacity: 0.9,
					}),
					onEachFeature: (feature, layer) => {
						if (feature.properties?.name) layer.bindPopup(String(feature.properties.name));
					},
				});

				boundary.addTo(map);
				majorRoutes.addTo(map);
				L.control.layers(undefined, {
					Boundary: boundary,
					'Major routes': majorRoutes,
					'Other routes': otherRoutes,
					Stops: stops,
					Stations: stations,
				}, { collapsed: false }).addTo(map);

				const bounds = boundary.getBounds();
				if (bounds.isValid()) map.fitBounds(bounds, { padding: [18, 18] });
				else map.setView([latitude, longitude], 12);

				setStatus('ready');
				window.requestAnimationFrame(() => map?.invalidateSize());
			} catch {
				if (!cancelled) setStatus('unavailable');
			}
		};

		void loadMap();
		return () => {
			cancelled = true;
			map?.remove();
		};
	}, [slug, latitude, longitude]);

	const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.08}%2C${latitude - 0.05}%2C${longitude + 0.08}%2C${latitude + 0.05}&layer=mapnik&marker=${latitude}%2C${longitude}`;

	return (
		<div>
			{status === 'unavailable' ? (
				<p className="px-6 pt-4 text-sm text-amber-800">Route geometry is not yet available for {boroughName}; showing the OpenStreetMap location view.</p>
			) : null}
			{status === 'unavailable' ? (
				<iframe title={`Transport map for ${boroughName}`} src={mapUrl} className="mt-4 h-80 w-full border-0" loading="lazy" />
			) : (
				<div ref={mapElement} className="mt-5 h-80 w-full bg-slate-100" role="application" aria-label={`Interactive transport map for ${boroughName}`}>
					{status === 'loading' ? <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading transport geometry...</div> : null}
				</div>
			)}
		</div>
	);
}
