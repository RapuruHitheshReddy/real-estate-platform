"use client";

import { useGetPropertyQuery } from "@/state/api";
import { Compass, MapPin } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef } from "react";

mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const PropertyLocation = ({ propertyId }: PropertyDetailsProps) => {
  const { data: property, isError, isLoading } =
    useGetPropertyQuery(propertyId);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  /* ================= Map Initialization ================= */
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!property?.location?.coordinates) return;
    if (!mapboxgl.accessToken) return;

    const { longitude, latitude } = property.location.coordinates;

    if (longitude == null || latitude == null) return;

    // Prevent re-initializing map
    if (mapRef.current) return;

    const center: [number, number] = [longitude, latitude];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    new mapboxgl.Marker({ color: "#111827" })
      .setLngLat(center)
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [property]);

  /* ================= Loading State ================= */
  if (isLoading) {
    return (
      <div className="py-16 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-[300px] bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="py-16 text-center text-gray-500">
        Location information not available
      </div>
    );
  }

  const address =
    property.location?.address ||
    "Address not available";

  const googleMapsLink = `https://maps.google.com/?q=${encodeURIComponent(
    address
  )}`;

  return (
    <section className="py-16 space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-semibold mb-2">
            Location
          </h3>

          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-gray-700" />
            <span className="font-medium">{address}</span>
          </div>
        </div>

        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition text-sm font-medium"
        >
          <Compass className="w-4 h-4" />
          Get Directions
        </a>
      </div>

      {/* Map Container */}
      {mapboxgl.accessToken ? (
        <div
          ref={mapContainerRef}
          className="h-[350px] rounded-2xl overflow-hidden shadow-sm border"
        />
      ) : (
        <div className="h-[350px] flex items-center justify-center border rounded-2xl bg-gray-50 text-gray-500">
          Map unavailable (Missing Mapbox token)
        </div>
      )}
    </section>
  );
};

export default PropertyLocation;