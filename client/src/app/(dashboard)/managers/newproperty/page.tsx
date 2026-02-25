"use client";

import { CustomFormField } from "@/components/FormField";
import Header from "@/components/Header";
import { Form } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyFormData, propertySchema } from "@/lib/schemas";
import { useCreatePropertyMutation, useGetAuthUserQuery } from "@/state/api";
import { AmenityEnum, HighlightEnum, PropertyTypeEnum } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Home,
  DollarSign,
  MapPin,
  ImageIcon,
  Sparkles,
  Building,
  Loader2,
} from "lucide-react";

const NewProperty = () => {
  const router = useRouter();

  const [createProperty, { isLoading }] = useCreatePropertyMutation();
  const { data: authUser } = useGetAuthUserQuery();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      description: "",
      pricePerMonth: 1000,
      securityDeposit: 500,
      applicationFee: 100,
      isPetsAllowed: true,
      isParkingIncluded: true,
      photoUrls: [],
      amenities: [],
      highlights: [],
      beds: 1,
      baths: 1,
      squareFeet: 1000,
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    try {
      if (!authUser?.cognitoInfo?.userId) {
        toast.error("Manager authentication missing");
        return;
      }

      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "photoUrls") {
          const files = value as File[];
          files.forEach((file) => formData.append("photos", file));
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      formData.append("managerCognitoId", authUser.cognitoInfo.userId);

      await createProperty(formData).unwrap();

      toast.success("Property created successfully");

      form.reset();

      router.push("/managers/properties");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create property");
    }
  };

  const toggleArrayValue = (
    field: "amenities" | "highlights",
    value: string
  ) => {
    const current = form.getValues(field) || [];

    if (current.includes(value)) {
      form.setValue(
        field,
        current.filter((v) => v !== value)
      );
    } else {
      form.setValue(field, [...current, value]);
    }
  };

  return (
    <div className="dashboard-container">
      <Header
        title="Add New Property"
        subtitle="Create a new property listing with detailed information"
      />

      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-14"
          >
            {/* Basic Info */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Home size={20} />
                <h2 className="text-xl font-semibold">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <CustomFormField name="name" label="Property Name" />
                <CustomFormField
                  name="description"
                  label="Description"
                  type="textarea"
                />
              </div>
            </section>

            {/* Fees */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <DollarSign size={20} />
                <h2 className="text-xl font-semibold">Fees</h2>
              </div>

              <CustomFormField
                name="pricePerMonth"
                label="Price per Month"
                type="number"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <CustomFormField
                  name="securityDeposit"
                  label="Security Deposit"
                  type="number"
                />

                <CustomFormField
                  name="applicationFee"
                  label="Application Fee"
                  type="number"
                />
              </div>
            </section>

            {/* Property Details */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Building size={20} />
                <h2 className="text-xl font-semibold">Property Details</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <CustomFormField name="beds" label="Beds" type="number" />
                <CustomFormField name="baths" label="Baths" type="number" />
                <CustomFormField
                  name="squareFeet"
                  label="Square Feet"
                  type="number"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <CustomFormField
                  name="isPetsAllowed"
                  label="Pets Allowed"
                  type="switch"
                />

                <CustomFormField
                  name="isParkingIncluded"
                  label="Parking Included"
                  type="switch"
                />
              </div>

              <div className="mt-6">
                <CustomFormField
                  name="propertyType"
                  label="Property Type"
                  type="select"
                  options={Object.keys(PropertyTypeEnum).map((type) => ({
                    value: type,
                    label: type,
                  }))}
                />
              </div>
            </section>

            {/* Amenities */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} />
                <h2 className="text-xl font-semibold">Amenities</h2>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(AmenityEnum).map((amenity) => {
                  const selected = form.watch("amenities")?.includes(amenity);

                  return (
                    <label
                      key={amenity}
                      className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${
                        selected
                          ? "border-primary-600 bg-primary-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() =>
                          toggleArrayValue("amenities", amenity)
                        }
                      />

                      <span className="text-sm font-medium">{amenity}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Highlights */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} />
                <h2 className="text-xl font-semibold">Highlights</h2>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(HighlightEnum).map((highlight) => {
                  const selected =
                    form.watch("highlights")?.includes(highlight);

                  return (
                    <label
                      key={highlight}
                      className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${
                        selected
                          ? "border-primary-600 bg-primary-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() =>
                          toggleArrayValue("highlights", highlight)
                        }
                      />

                      <span className="text-sm font-medium">{highlight}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Photos */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon size={20} />
                <h2 className="text-xl font-semibold">Photos</h2>
              </div>

              <CustomFormField
                name="photoUrls"
                label="Property Photos"
                type="file"
                accept="image/*"
              />
            </section>

            {/* Address */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={20} />
                <h2 className="text-xl font-semibold">Property Location</h2>
              </div>

              <CustomFormField name="address" label="Address" />

              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <CustomFormField name="city" label="City" />
                <CustomFormField name="state" label="State" />
                <CustomFormField name="postalCode" label="Postal Code" />
              </div>

              <div className="mt-4">
                <CustomFormField name="country" label="Country" />
              </div>
            </section>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base bg-primary-700 hover:bg-primary-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Creating Property...
                </>
              ) : (
                "Create Property"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewProperty;