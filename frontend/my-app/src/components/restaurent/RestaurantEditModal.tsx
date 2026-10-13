"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import {
  X,
  Upload,
  Loader2,
  ImageIcon,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

import {
  updateRestaurant,
} from "@/redux/slice/restaurentSlice";

import type { AppDispatch, RootState } from "@/redux/store/store";
import type { Restaurant } from "@/types/restaurent";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Label,
} from "@/components/ui/label";

import {
  Separator,
} from "@/components/ui/separator";

import {
  Badge,
} from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RestaurantEditModalProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  restaurant: Restaurant | null;

  onSuccess?: () => void;
}

interface AddressForm {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface BranchOption {
  _id: string;
  name: string;
  branchCode?: string;
}

export default function RestaurantEditModal({
  open,
  onOpenChange,
  restaurant,
  onSuccess,
}: RestaurantEditModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  const {
    updateLoading,
  } = useSelector(
    (state: RootState) => state.restaurant
  );

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [
    name,
    setName,
  ] = useState(restaurant?.name ?? "");

  const [
    description,
    setDescription,
  ] = useState(restaurant?.description ?? "");

  const [
    email,
    setEmail,
  ] = useState(restaurant?.email ?? "");

  const [
    phone,
    setPhone,
  ] = useState(restaurant?.phone ?? "");

  const [
    website,
    setWebsite,
  ] = useState(restaurant?.website ?? "");

  const [
    address,
    setAddress,
  ] = useState<AddressForm>({
    street: restaurant?.address?.street ?? "",
    city: restaurant?.address?.city ?? "",
    state: restaurant?.address?.state ?? "",
    country: restaurant?.address?.country ?? "",
    zipCode: restaurant?.address?.zipCode ?? "",
  });

  const [
    branchIds,
    setBranchIds,
  ] = useState<string[]>(restaurant?.branches ?? []);

  const [availableBranches, setAvailableBranches] =
    useState<BranchOption[]>([]);
  const [branchesLoadedFor, setBranchesLoadedFor] =
    useState<string | null>(null);
  const [branchLoadFailed, setBranchLoadFailed] = useState(false);

  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState<File[]>([]);

  const [
    previewUrls,
    setPreviewUrls,
  ] = useState<string[]>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] =
    useState<FormData | null>(null);

  const restaurantId = restaurant?._id;
  const branchesLoading = Boolean(
    open && restaurantId && branchesLoadedFor !== restaurantId
  );

  useEffect(() => {
    if (!open || !restaurantId) {
      return;
    }

    let isCurrent = true;

    const loadBranches = async () => {
      try {
        const response = await axiosInstance.get<{
          status: boolean;
          data?: BranchOption[];
        }>(endpoints.branch.getByRestaurantId(restaurantId));

        if (isCurrent) {
          setAvailableBranches(response.data.data ?? []);
          setBranchLoadFailed(false);
          setBranchesLoadedFor(restaurantId);
        }
      } catch {
        if (isCurrent) {
          setAvailableBranches([]);
          setBranchLoadFailed(true);
          setBranchesLoadedFor(restaurantId);
        }
      }
    };

    void loadBranches();

    return () => {
      isCurrent = false;
    };
  }, [open, restaurantId]);

  // ==========================================================
  // CLEANUP PREVIEW URLS
  // ==========================================================

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [previewUrls]);

  // ==========================================================
  // FILE SELECTION
  // ==========================================================

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    if (files.length > 10) {
      event.target.value = "";

      return;
    }

    const urls = files.map((file) =>
      URL.createObjectURL(file)
    );

    setSelectedFiles(files);
    setPreviewUrls(urls);
  };

  // ==========================================================
  // REMOVE SELECTED NEW IMAGE
  // ==========================================================

  const removeSelectedImage = (
    index: number
  ) => {
    const updatedFiles =
      selectedFiles.filter(
        (_, fileIndex) =>
          fileIndex !== index
      );

    const removedUrl =
      previewUrls[index];

    if (removedUrl) {
      URL.revokeObjectURL(
        removedUrl
      );
    }

    const updatedUrls =
      previewUrls.filter(
        (_, urlIndex) =>
          urlIndex !== index
      );

    setSelectedFiles(
      updatedFiles
    );

    setPreviewUrls(
      updatedUrls
    );

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  };

  // ==========================================================
  // ADDRESS UPDATE
  // ==========================================================

  const updateAddressField = (
    field: keyof AddressForm,
    value: string
  ) => {
    setAddress((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!restaurant?._id) {
      return;
    }

    if (!name.trim()) {
      return;
    }

    try {
      const formData =
        new FormData();

      // Basic fields
      formData.append(
        "name",
        name.trim()
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "email",
        email
      );

      formData.append(
        "phone",
        phone
      );

      // Address
      formData.append(
        "address",
        JSON.stringify(address)
      );

      // Branches
      formData.append(
        "branches",
        JSON.stringify(branchIds)
      );

      // IMPORTANT:
      // Backend only replaces existing images
      // when new images are uploaded.
      selectedFiles.forEach(
        (file) => {
          formData.append(
            "images",
            file
          );
        }
      );

      setPendingFormData(formData);
      setConfirmOpen(true);
    } catch {
      // Redux already handles the error toast.
    }
  };

  const handleConfirmUpdate = async () => {
    if (!restaurant?._id || !pendingFormData || updateLoading) {
      return;
    }

    try {
      await dispatch(
        updateRestaurant({
          id: restaurant._id,
          formData: pendingFormData,
        })
      ).unwrap();

      setConfirmOpen(false);
      setPendingFormData(null);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Redux already handles the error toast.
    }
  };

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = () => {
    if (updateLoading) {
      return;
    }

    onOpenChange(false);
  };

  return (
    <>
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent
        className="
          max-w-4xl
          overflow-hidden
          p-0
        "
      >
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-xl">
            Edit Restaurant
          </DialogTitle>

          <DialogDescription>
            Update restaurant information and
            optionally replace its images.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
        >
          <div className="max-h-[75vh] overflow-y-auto">
            <div className="space-y-6 p-6">

              {/* ================================================= */}
              {/* BASIC INFORMATION */}
              {/* ================================================= */}

              <section className="space-y-4">
                <div>
                  <h3 className="font-semibold">
                    Basic Information
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Update the basic restaurant
                    information.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  {/* NAME */}

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-name">
                      Restaurant Name *
                    </Label>

                    <Input
                      id="restaurant-name"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      placeholder="Enter restaurant name"
                      disabled={
                        updateLoading
                      }
                    />
                  </div>

                  {/* EMAIL */}

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-email">
                      Email
                    </Label>

                    <Input
                      id="restaurant-email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="restaurant@example.com"
                      disabled={
                        updateLoading
                      }
                    />
                  </div>

                  {/* PHONE */}

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-phone">
                      Phone
                    </Label>

                    <Input
                      id="restaurant-phone"
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value
                        )
                      }
                      placeholder="+91 9876543210"
                      disabled={
                        updateLoading
                      }
                    />
                  </div>

                  {/* WEBSITE */}

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-website">
                      Website
                    </Label>

                    <Input
                      id="restaurant-website"
                      value={website}
                      onChange={(event) =>
                        setWebsite(
                          event.target.value
                        )
                      }
                      placeholder="https://example.com"
                      disabled={
                        updateLoading
                      }
                    />

                    <p className="text-xs text-muted-foreground">
                      Displayed here for reference.
                      Your current backend update
                      controller does not save this
                      field.
                    </p>
                  </div>

                </div>

                {/* DESCRIPTION */}

                <div className="space-y-2">
                  <Label htmlFor="restaurant-description">
                    Description
                  </Label>

                  <Textarea
                    id="restaurant-description"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    placeholder="Enter restaurant description"
                    rows={4}
                    disabled={
                      updateLoading
                    }
                  />
                </div>
              </section>

              <Separator />

              {/* ================================================= */}
              {/* ADDRESS */}
              {/* ================================================= */}

              <section className="space-y-4">
                <div>
                  <h3 className="font-semibold">
                    Address
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Update the restaurant address.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street">
                      Street
                    </Label>

                    <Input
                      id="street"
                      value={
                        address.street
                      }
                      onChange={(event) =>
                        updateAddressField(
                          "street",
                          event.target.value
                        )
                      }
                      placeholder="Street address"
                      disabled={
                        updateLoading
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City
                    </Label>

                    <Input
                      id="city"
                      value={
                        address.city
                      }
                      onChange={(event) =>
                        updateAddressField(
                          "city",
                          event.target.value
                        )
                      }
                      placeholder="City"
                      disabled={
                        updateLoading
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State
                    </Label>

                    <Input
                      id="state"
                      value={
                        address.state
                      }
                      onChange={(event) =>
                        updateAddressField(
                          "state",
                          event.target.value
                        )
                      }
                      placeholder="State"
                      disabled={
                        updateLoading
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Country
                    </Label>

                    <Input
                      id="country"
                      value={
                        address.country
                      }
                      onChange={(event) =>
                        updateAddressField(
                          "country",
                          event.target.value
                        )
                      }
                      placeholder="Country"
                      disabled={
                        updateLoading
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">
                      ZIP Code
                    </Label>

                    <Input
                      id="zipCode"
                      value={
                        address.zipCode
                      }
                      onChange={(event) =>
                        updateAddressField(
                          "zipCode",
                          event.target.value
                        )
                      }
                      placeholder="ZIP Code"
                      disabled={
                        updateLoading
                      }
                    />
                  </div>

                </div>
              </section>

              <Separator />

              {/* ================================================= */}
              {/* BRANCHES */}
              {/* ================================================= */}

              <section className="space-y-4">
                <div>
                  <h3 className="font-semibold">
                    Branches
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Choose one or more available branches by name.
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        disabled={updateLoading || branchesLoading}
                      >
                        {branchesLoading
                          ? "Loading branches..."
                          : branchIds.length
                            ? `${branchIds.length} branch${branchIds.length === 1 ? "" : "es"} selected`
                            : "Select branches"}
                      </Button>
                    }
                  />

                  <DropdownMenuContent
                    align="start"
                    className="max-h-64 w-80 overflow-y-auto"
                  >
                    {branchesLoading ? (
                      <DropdownMenuItem disabled>
                        Loading branches...
                      </DropdownMenuItem>
                    ) : branchLoadFailed ? (
                      <DropdownMenuItem disabled>
                        Could not load branches
                      </DropdownMenuItem>
                    ) : availableBranches.length === 0 ? (
                      <DropdownMenuItem disabled>
                        No other branches available
                      </DropdownMenuItem>
                    ) : (
                      availableBranches.map((branch) => (
                        <DropdownMenuCheckboxItem
                          key={branch._id}
                          checked={branchIds.includes(branch._id)}
                          onCheckedChange={(checked) =>
                            setBranchIds((currentIds) =>
                              checked
                                ? currentIds.includes(branch._id)
                                  ? currentIds
                                  : [...currentIds, branch._id]
                                : currentIds.filter(
                                    (id) => id !== branch._id
                                  )
                            )
                          }
                          disabled={updateLoading}
                        >
                          <span>{branch.name}</span>
                          {branch.branchCode && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {branch.branchCode}
                            </span>
                          )}
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex flex-wrap gap-2">
                  {branchesLoading ? (
                    <span className="text-sm text-muted-foreground">
                      Loading branch names...
                    </span>
                  ) : branchIds.length ? (
                    branchIds.map((id) => {
                      const branch = availableBranches.find(
                        (item) => item._id === id
                      );

                      return (
                        <Badge key={id} variant="outline">
                          {branch?.name ?? "Unavailable branch"}
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No branches selected.
                    </span>
                  )}
                </div>
              </section>

              <Separator />

              {/* ================================================= */}
              {/* IMAGES */}
              {/* ================================================= */}

              <section className="space-y-4">
                <div>
                  <h3 className="font-semibold">
                    Restaurant Images
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Upload new images only if you
                    want to replace the current
                    gallery.
                  </p>
                </div>

                {/* CURRENT IMAGES */}

                {restaurant?.images?.length ? (
                  <div>
                    <p className="mb-2 text-sm font-medium">
                      Current Images
                    </p>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {restaurant.images.map(
                        (image, index) => (
                          <div
                            key={
                              image.publicId ||
                              `${image.url}-${index}`
                            }
                            className="relative overflow-hidden rounded-lg border"
                          >
                            <div className="relative aspect-video">
                              <Image
                                src={image.url}
                                alt={`Current restaurant image ${
                                  index + 1
                                }`}
                                fill
                                sizes="200px"
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />

                      <p className="text-sm">
                        No existing images
                      </p>
                    </div>
                  </div>
                )}

                {/* UPLOAD */}

                <div className="rounded-xl border border-dashed p-5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={
                      handleFileChange
                    }
                  />

                  <div className="flex flex-col items-center gap-3 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />

                    <div>
                      <p className="font-medium">
                        Replace restaurant images
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Select up to 10 images.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={
                        updateLoading
                      }
                    >
                      Choose Images
                    </Button>
                  </div>
                </div>

                {/* NEW IMAGE PREVIEWS */}

                {previewUrls.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">
                        New Images
                      </p>

                      <Badge>
                        {
                          selectedFiles.length
                        }{" "}
                        selected
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {previewUrls.map(
                        (url, index) => (
                          <div
                            key={url}
                            className="group relative overflow-hidden rounded-lg border"
                          >
                            <div className="relative aspect-video">
                              <Image
                                src={url}
                                alt={`New image ${
                                  index + 1
                                }`}
                                fill
                                sizes="200px"
                                className="object-cover"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeSelectedImage(
                                  index
                                )
                              }
                              className="
                                absolute
                                right-2
                                top-2
                                rounded-full
                                bg-black/70
                                p-1
                                text-white
                                opacity-0
                                transition
                                group-hover:opacity-100
                              "
                              disabled={
                                updateLoading
                              }
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    Saving these new images will
                    replace all existing restaurant
                    images.
                  </div>
                )}
              </section>

            </div>
          </div>

          {/* =================================================== */}
          {/* FOOTER */}
          {/* =================================================== */}

          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={
                updateLoading
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                updateLoading ||
                !name.trim()
              }
            >
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog
      open={confirmOpen}
      onOpenChange={(nextOpen) => {
        if (!updateLoading) {
          setConfirmOpen(nextOpen);
          if (!nextOpen) {
            setPendingFormData(null);
          }
        }
      }}
    >
      <DialogContent
        showCloseButton={!updateLoading}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Confirm restaurant update</DialogTitle>
          <DialogDescription>
            Save the changes to {restaurant?.name ?? "this restaurant"}?
            {selectedFiles.length > 0 &&
              " The new images will replace its current gallery."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={updateLoading}
            onClick={() => {
              setConfirmOpen(false);
              setPendingFormData(null);
            }}
          >
            Back to editing
          </Button>
          <Button
            type="button"
            disabled={updateLoading}
            onClick={handleConfirmUpdate}
          >
            {updateLoading ? "Saving..." : "Confirm update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}