"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmenityIcons, HighlightIcons } from "@/lib/constants";
import { formatEnumString } from "@/lib/utils";
import { useGetPropertyQuery } from "@/state/api";
import { HelpCircle, PawPrint, Car, DollarSign } from "lucide-react";
import React from "react";

const PropertyDetails = ({ propertyId }: PropertyDetailsProps) => {
  const { data: property, isError, isLoading } =
    useGetPropertyQuery(propertyId);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 mt-10">
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="py-10 text-gray-500 text-center">
        Property details not available
      </div>
    );
  }

  return (
    <div className="space-y-14 mt-10">

      {/* ================= Amenities ================= */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">
          Amenities
        </h2>

        {property.amenities.length === 0 ? (
          <p className="text-gray-500">No amenities listed</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {property.amenities.map((amenity: AmenityEnum) => {
              const Icon =
                AmenityIcons[amenity as AmenityEnum] || HelpCircle;

              return (
                <div
                  key={amenity}
                  className="flex items-center gap-3 border rounded-xl p-4 bg-white hover:shadow-sm transition"
                >
                  <Icon className="w-5 h-5 text-primary-700" />
                  <span className="text-sm font-medium">
                    {formatEnumString(amenity)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= Highlights ================= */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">
          Highlights
        </h2>

        {property.highlights.length === 0 ? (
          <p className="text-gray-500">No highlights available</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {property.highlights.map((highlight: HighlightEnum) => {
              const Icon =
                HighlightIcons[highlight as HighlightEnum] ||
                HelpCircle;

              return (
                <div
                  key={highlight}
                  className="flex items-center gap-3 border rounded-xl p-4 bg-white hover:shadow-sm transition"
                >
                  <Icon className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium">
                    {formatEnumString(highlight)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= Fees & Policies ================= */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">
          Fees & Policies
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Fees are estimates and may vary depending on lease terms.
        </p>

        <Tabs defaultValue="fees" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-[500px]">
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="pets">Pets</TabsTrigger>
            <TabsTrigger value="parking">Parking</TabsTrigger>
          </TabsList>

          {/* Fees */}
          <TabsContent value="fees" className="mt-6">
            <div className="border rounded-xl divide-y bg-white">
              <Row
                icon={<DollarSign size={16} />}
                label="Application Fee"
                value={`$${property.applicationFee}`}
              />
              <Row
                icon={<DollarSign size={16} />}
                label="Security Deposit"
                value={`$${property.securityDeposit}`}
              />
            </div>
          </TabsContent>

          {/* Pets */}
          <TabsContent value="pets" className="mt-6">
            <div className="border rounded-xl p-5 flex items-center gap-3 bg-white">
              <PawPrint size={18} />
              <span className="font-medium">
                Pets are{" "}
                {property.isPetsAllowed
                  ? "allowed"
                  : "not allowed"}
              </span>
            </div>
          </TabsContent>

          {/* Parking */}
          <TabsContent value="parking" className="mt-6">
            <div className="border rounded-xl p-5 flex items-center gap-3 bg-white">
              <Car size={18} />
              <span className="font-medium">
                Parking is{" "}
                {property.isParkingIncluded
                  ? "included"
                  : "not included"}
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default PropertyDetails;



/* ---------------- Row Component ---------------- */

const Row = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        {label}
      </div>

      <div className="font-semibold">{value}</div>
    </div>
  );
};