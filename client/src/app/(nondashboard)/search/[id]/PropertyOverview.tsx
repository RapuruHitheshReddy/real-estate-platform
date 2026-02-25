"use client";

import { useGetPropertyQuery } from "@/state/api";
import {
  MapPin,
  Star,
  BedDouble,
  Bath,
  Ruler,
  PawPrint,
  Car,
  Building,
} from "lucide-react";
import React from "react";

const PropertyOverview = ({ propertyId }: PropertyOverviewProps) => {
  const { data: property, isLoading, isError } =
    useGetPropertyQuery(propertyId);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="text-center py-16 text-gray-500">
        Property not found
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* LOCATION BREADCRUMB */}
      <div className="text-sm text-gray-500">
        {property.location?.country} / {property.location?.state} /{" "}
        <span className="font-semibold text-gray-700">
          {property.location?.city}
        </span>
      </div>

      {/* TITLE */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">
          {property.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            {property.location?.city}, {property.location?.state}
          </div>

          <div className="flex items-center text-yellow-500">
            <Star className="w-4 h-4 mr-1 fill-yellow-500" />
            {property.averageRating?.toFixed(1) || "0.0"} (
            {property.numberOfReviews || 0})
          </div>

          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
            Verified Listing
          </span>

          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* KEY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BedDouble size={18} />}
          label="Bedrooms"
          value={`${property.beds} bd`}
        />

        <StatCard
          icon={<Bath size={18} />}
          label="Bathrooms"
          value={`${property.baths} ba`}
        />

        <StatCard
          icon={<Ruler size={18} />}
          label="Area"
          value={`${property.squareFeet.toLocaleString()} sqft`}
        />

        <StatCard
          icon={<Building size={18} />}
          label="Type"
          value={property.propertyType}
        />
      </div>

      {/* PRICE CARD */}
      <div className="border rounded-2xl p-6 bg-white shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-gray-500 text-sm">Monthly Rent</div>
          <div className="text-3xl font-bold text-primary-700">
            ${property.pricePerMonth.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          {property.isPetsAllowed && (
            <div className="flex items-center gap-1">
              <PawPrint size={16} />
              Pets Allowed
            </div>
          )}

          {property.isParkingIncluded && (
            <div className="flex items-center gap-1">
              <Car size={16} />
              Parking
            </div>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">About this property</h2>

        <p className="text-gray-600 leading-7 whitespace-pre-line">
          {property.description ||
            "No description provided for this property."}
        </p>
      </div>
    </div>
  );
};

export default PropertyOverview;



/* Small reusable stat card */
const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="border rounded-xl p-4 flex items-center gap-3 bg-white hover:shadow-sm transition">
      <div className="text-primary-700">{icon}</div>

      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
};