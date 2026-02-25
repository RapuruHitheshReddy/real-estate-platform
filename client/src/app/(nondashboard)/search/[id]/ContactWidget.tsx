"use client";

import { Button } from "@/components/ui/button";
import { useGetAuthUserQuery, useGetPropertyQuery } from "@/state/api";
import { Phone, CalendarDays, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

type ContactWidgetProps = {
  propertyId: number;
  onOpenModal: () => void;
};

const ContactWidget = ({ onOpenModal, propertyId }: ContactWidgetProps) => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: property } = useGetPropertyQuery(propertyId);
  const router = useRouter();

  const handleButtonClick = () => {
    if (authUser) {
      onOpenModal();
    } else {
      router.push("/signin");
    }
  };
  
 console.log("PROPERTY DATA:", property);
console.log("MANAGER:", property?.manager);

  const managerPhone =
    property?.manager?.phoneNumber?.trim() ||
    property?.manager?.phone?.trim() ||
    "Contact via application";

  const managerName =
    property?.manager?.name ||
    property?.manager?.fullName ||
    "Property Manager";

  return (
    <aside className="sticky top-24 w-full md:min-w-[340px]">
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-6">

        {/* Contact Box */}
        <div className="flex items-center gap-4 border rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary-700">
            <Phone className="text-white" size={16} />
          </div>

          <div className="leading-tight">
            <p className="font-semibold text-gray-900">
              {managerName}
            </p>

            <p className="text-sm text-gray-600">
              Call: {managerPhone}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleButtonClick}
          className="w-full h-12 text-base font-semibold bg-primary-700 hover:bg-primary-600 text-white shadow-sm"
        >
          {authUser ? "Apply for this Property" : "Sign in to Apply"}
        </Button>

        {/* Trust */}
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-600" />
            Verified listing
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays size={16} />
            Open by appointment
          </div>
        </div>

        <hr />

        <div className="text-sm text-gray-500 space-y-1">
          <p>
            Languages: <span className="text-gray-700">English, Bahasa</span>
          </p>
          <p>
            Available: <span className="text-gray-700">Mon – Sun</span>
          </p>
        </div>

      </div>
    </aside>
  );
};

export default ContactWidget;