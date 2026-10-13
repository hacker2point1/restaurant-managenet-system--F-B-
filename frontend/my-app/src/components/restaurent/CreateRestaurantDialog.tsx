"use client";

import React, { useState } from "react";

import {
  Loader2,
  Upload,
  X,
  ImagePlus,
  GitBranch,
} from "lucide-react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  AppDispatch,
  RootState,
} from "@/redux/store/store";

import {
  createRestaurant,
} from "@/redux/slice/restaurentSlice";


interface CreateRestaurantDialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  onSuccess?: () => void;
}


export default function CreateRestaurantDialog({
  open,

  onOpenChange,

  onSuccess,
}: CreateRestaurantDialogProps) {

  const dispatch =
    useDispatch<AppDispatch>();


  const createLoading =
    useSelector(
      (state: RootState) =>
        state.restaurant.createLoading
    );


  // ==========================================================
  // FORM
  // ==========================================================

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    street,
    setStreet,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    stateName,
    setStateName,
  ] = useState("");

  const [
    country,
    setCountry,
  ] = useState("");

  const [
    zipCode,
    setZipCode,
  ] = useState("");

  const [
    images,
    setImages,
  ] = useState<File[]>([]);


  const [
    imagePreviews,
    setImagePreviews,
  ] = useState<string[]>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] =
    useState<FormData | null>(null);


  // ==========================================================
  // RESET
  // ==========================================================

  const resetForm = () => {

    setName("");

    setDescription("");

    setEmail("");

    setPhone("");

    setStreet("");

    setCity("");

    setStateName("");

    setCountry("");

    setZipCode("");

    setImages([]);

    setImagePreviews([]);
  };


  // ==========================================================
  // IMAGE SELECT
  // ==========================================================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const files =
      Array.from(
        event.target.files || []
      );

    if (!files.length) {
      return;
    }


    const validFiles =
      files.filter(
        (file) =>
          file.type.startsWith("image/")
      );


    const combined = [
      ...images,
      ...validFiles,
    ].slice(0, 10);


    setImages(combined);


    const previews =
      combined.map((file) =>
        URL.createObjectURL(file)
      );

    setImagePreviews(previews);
  };


  // ==========================================================
  // REMOVE IMAGE
  // ==========================================================

  const removeImage = (
    index: number
  ) => {

    const newImages =
      images.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );


    setImages(newImages);


    const newPreviews =
      newImages.map((file) =>
        URL.createObjectURL(file)
      );


    setImagePreviews(newPreviews);
  };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();


    if (!name.trim()) {
      return;
    }


    if (!images.length) {
      return;
    }


    const formData =
      new FormData();


    // Basic fields
    formData.append(
      "name",
      name.trim()
    );


    if (description.trim()) {

      formData.append(
        "description",
        description.trim()
      );

    }


    if (email.trim()) {

      formData.append(
        "email",
        email.trim()
      );

    }


    if (phone.trim()) {

      formData.append(
        "phone",
        phone.trim()
      );

    }


    // ========================================================
    // ADDRESS
    // ========================================================

    const address = {
      street: street.trim(),

      city: city.trim(),

      state: stateName.trim(),

      country: country.trim(),

      zipCode: zipCode.trim(),
    };


    const hasAddress =
      Object.values(address).some(
        Boolean
      );


    if (hasAddress) {

      formData.append(
        "address",
        JSON.stringify(address)
      );

    }


    // ========================================================
    // IMAGES
    // ========================================================

    images.forEach((file) => {

      formData.append(
        "images",
        file
      );

    });


    setPendingFormData(formData);
    setConfirmOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!pendingFormData || createLoading) {
      return;
    }

    try {
      const result = await dispatch(
        createRestaurant(pendingFormData)
      ).unwrap();

      if (result.status) {
        resetForm();
        setConfirmOpen(false);
        setPendingFormData(null);
        onOpenChange(false);
        onSuccess?.();
      }
    } catch {
      // Error toast handled in Redux slice.
    }
  };


  return (
    <>
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
          setConfirmOpen(false);
          setPendingFormData(null);
        }
        onOpenChange(nextOpen);
      }}
    >

      <DialogContent
        className="
          max-h-[90vh]
          overflow-y-auto
          sm:max-w-[760px]
        "
      >

        <DialogHeader>

          <DialogTitle className="text-xl">
            Add Restaurant
          </DialogTitle>

          <DialogDescription>
            Create a new restaurant and upload
            its restaurant images.
          </DialogDescription>

        </DialogHeader>


        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ================================================= */}
          {/* BASIC INFORMATION */}
          {/* ================================================= */}

          <div className="space-y-4">

            <div>

              <Label htmlFor="restaurant-name">
                Restaurant name *
              </Label>

              <Input
                id="restaurant-name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Downtown Bistro"
                className="mt-2"
                required
              />

            </div>


            <div>

              <Label htmlFor="description">
                Description
              </Label>

              <Textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe your restaurant..."
                className="mt-2 min-h-[90px]"
              />

            </div>

          </div>


          <Separator />


          {/* ================================================= */}
          {/* CONTACT */}
          {/* ================================================= */}

          <div>

            <h3 className="mb-4 text-sm font-semibold">
              Contact Information
            </h3>


            <div className="grid gap-4 md:grid-cols-2">

              <div>

                <Label htmlFor="email">
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="restaurant@example.com"
                  className="mt-2"
                />

              </div>


              <div>

                <Label htmlFor="phone">
                  Phone
                </Label>

                <Input
                  id="phone"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="+91 9876543210"
                  className="mt-2"
                />

              </div>

            </div>

          </div>


          <Separator />


          {/* ================================================= */}
          {/* ADDRESS */}
          {/* ================================================= */}

          <div>

            <h3 className="mb-4 text-sm font-semibold">
              Address
            </h3>


            <div className="space-y-4">

              <div>

                <Label htmlFor="street">
                  Street
                </Label>

                <Input
                  id="street"
                  value={street}
                  onChange={(event) =>
                    setStreet(
                      event.target.value
                    )
                  }
                  placeholder="18 Park Avenue"
                  className="mt-2"
                />

              </div>


              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <Label htmlFor="city">
                    City
                  </Label>

                  <Input
                    id="city"
                    value={city}
                    onChange={(event) =>
                      setCity(
                        event.target.value
                      )
                    }
                    placeholder="Kolkata"
                    className="mt-2"
                  />

                </div>


                <div>

                  <Label htmlFor="state">
                    State
                  </Label>

                  <Input
                    id="state"
                    value={stateName}
                    onChange={(event) =>
                      setStateName(
                        event.target.value
                      )
                    }
                    placeholder="West Bengal"
                    className="mt-2"
                  />

                </div>


                <div>

                  <Label htmlFor="country">
                    Country
                  </Label>

                  <Input
                    id="country"
                    value={country}
                    onChange={(event) =>
                      setCountry(
                        event.target.value
                      )
                    }
                    placeholder="India"
                    className="mt-2"
                  />

                </div>


                <div>

                  <Label htmlFor="zipCode">
                    ZIP Code
                  </Label>

                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(event) =>
                      setZipCode(
                        event.target.value
                      )
                    }
                    placeholder="700001"
                    className="mt-2"
                  />

                </div>

              </div>

            </div>

          </div>


          <Separator />


          {/* ================================================= */}
          {/* BRANCHES */}
          {/* ================================================= */}

          <section className="space-y-2">
            <Label>Branches</Label>
            <div className="flex items-start gap-3 rounded-lg border border-dashed p-4">
              <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  No branches right now
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create the restaurant first; branches can be added afterward.
                </p>
              </div>
            </div>
          </section>


          {/* ================================================= */}
          {/* IMAGES */}
          {/* ================================================= */}

          <div>

            <div className="flex items-center justify-between">

              <Label>
                Restaurant Images *
              </Label>

              <span className="text-xs text-gray-500">
                {images.length}/10
              </span>

            </div>


            <label
              htmlFor="restaurant-images"
              className="
                mt-2
                flex
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                bg-gray-50
                px-5
                py-8
                text-center
                transition
                hover:bg-gray-100
              "
            >

              <ImagePlus
                size={30}
                className="text-gray-400"
              />

              <p className="mt-3 text-sm font-medium">
                Click to upload images
              </p>

              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, JPEG — up to 10 images
              </p>


              <input
                id="restaurant-images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={
                  handleImageChange
                }
              />

            </label>


            {/* IMAGE PREVIEW */}

            {images.length > 0 && (

              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">

                {images.map(
                  (file, index) => (

                    <div
                      key={`${file.name}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100"
                    >

                      <img
                        src={
                          imagePreviews[index]
                        }
                        alt={
                          file.name
                        }
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />


                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        className="
                          absolute
                          right-1
                          top-1
                          flex
                          h-6
                          w-6
                          items-center
                          justify-center
                          rounded-full
                          bg-black/70
                          text-white
                          opacity-0
                          transition
                          group-hover:opacity-100
                        "
                      >

                        <X size={13} />

                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div className="flex justify-end gap-3 border-t pt-5">

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              disabled={createLoading}
            >
              Cancel
            </Button>


            <Button
              type="submit"
              disabled={
                createLoading ||
                !name.trim() ||
                images.length === 0
              }
              className="
                min-w-[150px]
                bg-[#9b6b2f]
                hover:bg-[#825823]
              "
            >

              {createLoading ? (

                <>
                  <Loader2
                    className="mr-2 animate-spin"
                    size={16}
                  />

                  Creating...
                </>

              ) : (

                <>
                  <Upload
                    className="mr-2"
                    size={16}
                  />

                  Create Restaurant
                </>

              )}

            </Button>

          </div>

        </form>

      </DialogContent>

    </Dialog>

    <Dialog
      open={confirmOpen}
      onOpenChange={(nextOpen) => {
        if (!createLoading) {
          setConfirmOpen(nextOpen);
          if (!nextOpen) {
            setPendingFormData(null);
          }
        }
      }}
    >
      <DialogContent
        showCloseButton={!createLoading}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Confirm restaurant creation</DialogTitle>
          <DialogDescription>
            Create {name.trim()} with the information and images you entered?
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={createLoading}
            onClick={() => {
              setConfirmOpen(false);
              setPendingFormData(null);
            }}
          >
            Back to form
          </Button>
          <Button
            type="button"
            disabled={createLoading}
            onClick={handleConfirmCreate}
            className="bg-[#9b6b2f] hover:bg-[#825823]"
          >
            {createLoading ? "Creating..." : "Confirm create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}