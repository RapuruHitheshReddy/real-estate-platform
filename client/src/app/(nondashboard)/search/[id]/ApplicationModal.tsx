"use client";

import { CustomFormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ApplicationFormData, applicationSchema } from "@/lib/schemas";
import { useCreateApplicationMutation, useGetAuthUserQuery } from "@/state/api";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number;
}

const ApplicationModal = ({
  isOpen,
  onClose,
  propertyId,
}: ApplicationModalProps) => {
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const { data: authUser } = useGetAuthUserQuery();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      if (!authUser || authUser.userRole !== "tenant") {
        toast.error("You must be logged in as a tenant.");
        return;
      }

      await createApplication({
        ...data,
        applicationDate: new Date().toISOString(),
        status: "Pending",
        propertyId,
        tenantCognitoId: authUser.cognitoInfo.userId,
      }).unwrap();

      toast.success("Application submitted successfully 🎉");

      form.reset();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to submit application");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-lg">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl">
            Submit Application
          </DialogTitle>

          <DialogDescription>
            Fill out the form below to apply for this property.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-2"
          >
            <CustomFormField
              name="name"
              label="Name"
              type="text"
              placeholder="Enter your full name"
            />

            <CustomFormField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email address"
            />

            <CustomFormField
              name="phoneNumber"
              label="Phone Number"
              type="text"
              placeholder="Enter your phone number"
            />

            <CustomFormField
              name="message"
              label="Message (Optional)"
              type="textarea"
              placeholder="Tell the landlord about yourself"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary-700 hover:bg-primary-800 w-full h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;