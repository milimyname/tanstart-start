import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { cn } from "@/app/utils";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { MapSelector } from "./map-selector";

interface PropertyOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProperty: (property: any) => void;
}

export function PropertyOnboarding({
  open,
  onOpenChange,
  onAddProperty,
}: PropertyOnboardingProps) {
  const [step, setStep] = useState(1);
  const [propertyData, setPropertyData] = useState({
    address: "",
    postalCode: "",
    city: "",
    coordinates: [0, 0] as [number, number],
    owner: "",
  });

  const form = useForm({
    defaultValues: propertyData,
    onSubmit: async ({ value }) => {
      const newProperty = {
        ...propertyData,
        ...value,
      };
      onAddProperty(newProperty);
      onOpenChange(false);
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setPropertyData({
        address: "",
        postalCode: "",
        city: "",
        coordinates: [0, 0] as [number, number],
        owner: "",
      });
      form.reset();
    }
  }, [open, form]);

  // Handle address selection from map
  const handleAddressSelect = (addressData: any) => {
    const updatedData = {
      ...propertyData,
      address: addressData.street,
      postalCode: addressData.postalCode,
      city: addressData.city,
      coordinates: addressData.coordinates,
    };
    setPropertyData(updatedData);
    form.reset(updatedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] min-w-[1200px] h-[60vh] p-0 gap-0">
        <div className="flex h-full flex-col">
          <DialogHeader className="flex  justify-between border-b p-4">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setStep(step - 1)}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h2 className="text-xl font-semibold">
                {step === 1
                  ? "Immobilie hinzufügen - Standort auswählen"
                  : "Immobilie hinzufügen - Details"}
              </h2>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {step === 1 ? (
              <div className="">
                <p className="mb-6 text-muted-foreground">
                  Bitte geben Sie die Adresse der Immobilie ein oder wählen Sie einen
                  Standort auf der Karte.
                </p>
                <MapSelector
                  onAddressSelect={handleAddressSelect}
                  selectedAddress={
                    propertyData.address
                      ? {
                          street: propertyData.address,
                          postalCode: propertyData.postalCode,
                          city: propertyData.city,
                        }
                      : undefined
                  }
                />

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!propertyData.address}
                    className="gap-2"
                  >
                    Weiter <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="mx-auto max-w-3xl"
              >
                <div className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <form.Field
                        name="address"
                        validators={{
                          onChange: (value) =>
                            !value ? "Straße ist erforderlich" : undefined,
                        }}
                        children={(field) => (
                          <>
                            <Label htmlFor={field.name}>Straße und Hausnummer</Label>
                            <Input
                              id={field.name}
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              defaultValue={propertyData.address}
                            />
                            {field.state.meta.errors.length > 0 && (
                              <p className="text-sm text-red-500">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <form.Field
                        name="postalCode"
                        validators={{
                          onChange: (value) =>
                            !value ? "PLZ ist erforderlich" : undefined,
                        }}
                        children={(field) => (
                          <>
                            <Label htmlFor={field.name}>Postleitzahl</Label>
                            <Input
                              id={field.name}
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              defaultValue={propertyData.postalCode}
                            />
                            {field.state.meta.errors.length > 0 && (
                              <p className="text-sm text-red-500">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <form.Field
                        name="city"
                        validators={{
                          onChange: (value) =>
                            !value ? "Stadt ist erforderlich" : undefined,
                        }}
                        children={(field) => (
                          <>
                            <Label htmlFor={field.name}>Stadt</Label>
                            <Input
                              id={field.name}
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              defaultValue={propertyData.city}
                            />
                            {field.state.meta.errors.length > 0 && (
                              <p className="text-sm text-red-500">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <form.Field
                        name="owner"
                        validators={{
                          onChange: (value) =>
                            !value ? "Eigentümer ist erforderlich" : undefined,
                        }}
                        children={(field) => (
                          <>
                            <Label htmlFor={field.name}>Eigentümer</Label>
                            <Input
                              id={field.name}
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                            {field.state.meta.errors.length > 0 && (
                              <p className="text-sm text-red-500">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <Button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className="gap-2"
                      >
                        {isSubmitting ? "Wird hinzugefügt..." : "Immobilie hinzufügen"}{" "}
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  />
                </div>
              </form>
            )}
          </div>

          {/* Progress indicator */}
          <div className="border-t p-4">
            <div className="mx-auto flex max-w-3xl items-center gap-2">
              <div
                className={cn(
                  "h-2 w-full rounded-full",
                  step === 1 ? "bg-primary" : "bg-primary/30",
                )}
              />
              <div
                className={cn(
                  "h-2 w-full rounded-full",
                  step === 2 ? "bg-primary" : "bg-primary/30",
                )}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
