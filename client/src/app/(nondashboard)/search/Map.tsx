"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const filters = useAppSelector((state) => state.global.filters);

  const { data: properties, isLoading, isError } =
    useGetPropertiesQuery(filters);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (isLoading || isError || !properties) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const center =
      Array.isArray(filters.coordinates) && filters.coordinates.length === 2
        ? filters.coordinates
        : [-74.5, 40];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/r-hithesh-reddy/cmlz9z86f000x01s77pyx705m",
      center,
      zoom: 9,
    });

    mapRef.current = map;

    addMarkers(map, properties);

    setTimeout(() => map.resize(), 500);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [properties, filters.coordinates, isLoading, isError]);

  if (isLoading) return <>Loading...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        ref={mapContainerRef}
        className="rounded-xl"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

/* ---------------- MARKERS ---------------- */

function addMarkers(map: mapboxgl.Map, properties: Property[]) {
  const groups: Record<string, Property[]> = {};

  // group by identical coordinates
  properties.forEach((p) => {
    const lng = p?.location?.coordinates?.longitude;
    const lat = p?.location?.coordinates?.latitude;

    if (lng == null || lat == null) return;

    const key = `${lng}_${lat}`;

    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  Object.values(groups).forEach((group) => {
    if (group.length === 1) {
      createMarker(group[0], map, 0, 1);
    } else {
      group.forEach((property, index) => {
        createMarker(property, map, index, group.length);
      });
    }
  });
}

/* ---------------- SINGLE MARKER ---------------- */

function createMarker(
  property: Property,
  map: mapboxgl.Map,
  index: number,
  total: number
) {
  const baseLng = Number(property.location.coordinates.longitude);
  const baseLat = Number(property.location.coordinates.latitude);

  if (Number.isNaN(baseLng) || Number.isNaN(baseLat)) return;

  let lng = baseLng;
  let lat = baseLat;

  if (total > 1) {
    const angle = (index / total) * Math.PI * 2;
    const distance = 0.002;

    lng = baseLng + Math.cos(angle) * distance;
    lat = baseLat + Math.sin(angle) * distance;
  }

  const marker = new mapboxgl.Marker({ color: "#000000" })
    .setLngLat([lng, lat])
    .setPopup(
      new mapboxgl.Popup().setHTML(`
        <div class="marker-popup">
          <div>
            <a href="/search/${property.id}" target="_blank" class="marker-popup-title">
              ${property.name}
            </a>
            <p class="marker-popup-price">
              $${property.pricePerMonth}
              <span> / month</span>
            </p>
          </div>
        </div>
      `)
    )
    .addTo(map);

  return marker;
}