"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";

import type {
  Branch,
  BranchFormData,
} from "@/types/branch";

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  branch?: Branch | null;

  loading?: boolean;

  onSubmit: (
    data: FormData
  ) => void;
}

export function BranchFormDialog({
  open,
  onOpenChange,
  branch,
  loading = false,
  onSubmit,
}: BranchFormDialogProps) {
  const isEdit = Boolean(branch);

  const [name, setName] = useState("");
  const [branchCode, setBranchCode] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [street, setStreet] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [zipCode, setZipCode] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  useEffect(() => {
    if (!branch) {
      setName("");
      setBranchCode("");
      setPhone("");
      setEmail("");
      setStreet("");
      setCity("");
      setState("");
      setCountry("");
      setZipCode("");
      setIsActive(true);

      return;
    }

    setName(branch.name || "");
    setBranchCode(branch.branchCode || "");

    setPhone(
      branch.contact?.phone || ""
    );

    setEmail(
      branch.contact?.email || ""
    );

    setStreet(
      branch.address?.street || ""
    );

    setCity(
      branch.address?.city || ""
    );

    setState(
      branch.address?.state || ""
    );

    setCountry(
      branch.address?.country || ""
    );

    setZipCode(
      branch.address?.zipCode || ""
    );

    setIsActive(branch.isActive);
  }, [branch, open]);

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append(
      "branchCode",
      branchCode
    );

    formData.append(
      "contact",
      JSON.stringify({
        phone,
        email,
      })
    );

    formData.append(
      "address",
      JSON.stringify({
        street,
        city,
        state,
        country,
        zipCode,
      })
    );

    formData.append(
      "isActive",
      String(isActive)
    );

    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit Branch"
              : "Add Branch"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Branch Name
              </Label>

              <Input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Downtown Bistro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                Branch Code
              </Label>

              <Input
                value={branchCode}
                onChange={(event) =>
                  setBranchCode(
                    event.target.value
                  )
                }
                placeholder="BR-001"
                required
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Contact
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Phone
                </Label>

                <Input
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Email
                </Label>

                <Input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="branch@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Address
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>
                  Street
                </Label>

                <Input
                  value={street}
                  onChange={(event) =>
                    setStreet(
                      event.target.value
                    )
                  }
                  placeholder="18 Park Avenue"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  City
                </Label>

                <Input
                  value={city}
                  onChange={(event) =>
                    setCity(
                      event.target.value
                    )
                  }
                  placeholder="Kolkata"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  State
                </Label>

                <Input
                  value={state}
                  onChange={(event) =>
                    setState(
                      event.target.value
                    )
                  }
                  placeholder="West Bengal"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Country
                </Label>

                <Input
                  value={country}
                  onChange={(event) =>
                    setCountry(
                      event.target.value
                    )
                  }
                  placeholder="India"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  ZIP Code
                </Label>

                <Input
                  value={zipCode}
                  onChange={(event) =>
                    setZipCode(
                      event.target.value
                    )
                  }
                  placeholder="700016"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {isEdit
                ? "Save Changes"
                : "Create Branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}