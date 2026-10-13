"use client";

import {
  Loader2,
  UserPlus,
} from "lucide-react";

import {
  useForm,
  Controller,
} from "react-hook-form";

import {
  yupResolver,
} from "@hookform/resolvers/yup";

import * as yup from "yup";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  User,
  UserRole,
} from "@/types/user";


/* =========================================================
   FORM DATA
========================================================= */

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}


/* =========================================================
   PROPS
========================================================= */

interface UserFormDialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  user?: User | null;

  loading?: boolean;

  onSubmit: (
    data: UserFormData
  ) => Promise<void> | void;
}


/* =========================================================
   COMPONENT
========================================================= */

export default function UserFormDialog({
  open,
  onOpenChange,
  user,
  loading = false,
  onSubmit,
}: UserFormDialogProps) {

  /* =======================================================
     EDIT MODE
  ======================================================= */

  const isEdit = Boolean(user);


  /* =======================================================
     YUP VALIDATION SCHEMA
  ======================================================= */

  const schema = yup.object({
    name: yup
      .string()
      .trim()
      .required(
        "Full name is required"
      )
      .min(
        2,
        "Name must be at least 2 characters"
      )
      .max(
        100,
        "Name cannot exceed 100 characters"
      ),

    email: yup
      .string()
      .trim()
      .required(
        "Email address is required"
      )
      .email(
        "Please enter a valid email address"
      ),

    phone: yup
      .string()
      .trim()
      .defined()
      .test(
        "phone-format",
        "Please enter a valid phone number",
        (value) => {

          /*
           * Phone is optional.
           *
           * If the user doesn't enter anything,
           * validation passes.
           */

          if (!value) {
            return true;
          }

          return /^[+]?[0-9\s()-]{7,20}$/.test(
            value
          );
        }
      ),

    /*
     * Password is required only when
     * creating a new user.
     *
     * During edit it is optional because
     * we are not changing the password here.
     */

    password: isEdit
      ? yup
          .string()
          .defined()
      : yup
          .string()
          .required(
            "Password is required"
          )
          .min(
            6,
            "Password must be at least 6 characters"
          ),

    role: yup
      .mixed<UserRole>()
      .oneOf(
        [
          "admin",
          "manager",
          "staff",
          "customer",
        ],
        "Please select a valid role"
      )
      .required(
        "Role is required"
      ),
  });


  /* =======================================================
     DEFAULT VALUES
  ======================================================= */

  const defaultValues: UserFormData = {
    name:
      user?.name || "",

    email:
      user?.email || "",

    phone:
      user?.phone || "",

    password:
      "",

    role:
      user?.role || "customer",
  };


  /* =======================================================
     REACT HOOK FORM
  ======================================================= */

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: {
      errors,
    },
  } = useForm<UserFormData>({
    resolver:
      yupResolver(schema),

    defaultValues,
  });


  /* =======================================================
     HANDLE DIALOG CLOSE
  ======================================================= */

  const handleDialogChange = (
    value: boolean
  ) => {

    if (!value) {

      reset(
        defaultValues
      );

    }

    onOpenChange(
      value
    );
  };


  /* =======================================================
     FORM SUBMIT
  ======================================================= */

  const handleFormSubmit = async (
    data: UserFormData
  ) => {

    await onSubmit(
      data
    );

  };


  /* =======================================================
     UI
  ======================================================= */

  return (
    <Dialog
      open={open}
      onOpenChange={
        loading
          ? undefined
          : handleDialogChange
      }
    >

      <DialogContent
        className="
          max-h-[90vh]
          overflow-y-auto
          rounded-2xl
          sm:max-w-[540px]
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <DialogHeader>

          <div
            className="
              mb-2
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-amber-50
            "
          >

            <UserPlus
              className="
                h-5
                w-5
                text-amber-700
              "
            />

          </div>

          <DialogTitle
            className="text-xl"
          >

            {isEdit
              ? "Edit user"
              : "Add new user"}

          </DialogTitle>

          <DialogDescription>

            {isEdit
              ? "Update the user's account information."
              : "Create a new account and assign the appropriate role."}

          </DialogDescription>

        </DialogHeader>


        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={
            handleSubmit(
              handleFormSubmit
            )
          }
          className="
            mt-2
            space-y-5
          "
        >

          {/* =================================================
              NAME
          ================================================= */}

          <div className="space-y-2">

            <Label
              htmlFor="user-name"
            >
              Full name
            </Label>

            <Input
              id="user-name"
              placeholder="Enter full name"
              disabled={loading}
              {...register(
                "name"
              )}
            />

            {errors.name && (

              <p
                className="
                  text-sm
                  text-red-500
                "
              >
                {errors.name.message}
              </p>

            )}

          </div>


          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="space-y-2">

            <Label
              htmlFor="user-email"
            >
              Email address
            </Label>

            <Input
              id="user-email"
              type="email"
              placeholder="name@example.com"
              disabled={loading}
              {...register(
                "email"
              )}
            />

            {errors.email && (

              <p
                className="
                  text-sm
                  text-red-500
                "
              >
                {errors.email.message}
              </p>

            )}

          </div>


          {/* =================================================
              PHONE
          ================================================= */}

          <div className="space-y-2">

            <Label
              htmlFor="user-phone"
            >
              Phone number
            </Label>

            <Input
              id="user-phone"
              placeholder="+91 98765 43210"
              disabled={loading}
              {...register(
                "phone"
              )}
            />

            {errors.phone && (

              <p
                className="
                  text-sm
                  text-red-500
                "
              >
                {errors.phone.message}
              </p>

            )}

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

          {!isEdit && (

            <div className="space-y-2">

              <Label
                htmlFor="user-password"
              >
                Password
              </Label>

              <Input
                id="user-password"
                type="password"
                placeholder="Minimum 6 characters"
                disabled={loading}
                {...register(
                  "password"
                )}
              />

              {errors.password && (

                <p
                  className="
                    text-sm
                    text-red-500
                  "
                >
                  {errors.password.message}
                </p>

              )}

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                The password must contain
                at least 6 characters.
              </p>

            </div>

          )}


          {/* =================================================
              ROLE
          ================================================= */}

          {!isEdit && (

            <div className="space-y-2">

              <Label>
                Role
              </Label>

              <Controller
                name="role"
                control={control}
                render={({
                  field,
                }) => (

                  <Select
                    value={
                      field.value
                    }
                    onValueChange={
                      field.onChange
                    }
                    disabled={
                      loading
                    }
                  >

                    <SelectTrigger>

                      <SelectValue
                        placeholder="Select role"
                      />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem
                        value="admin"
                      >
                        Admin
                      </SelectItem>

                      <SelectItem
                        value="manager"
                      >
                        Manager
                      </SelectItem>

                      <SelectItem
                        value="staff"
                      >
                        Staff
                      </SelectItem>

                      <SelectItem
                        value="customer"
                      >
                        Customer
                      </SelectItem>

                    </SelectContent>

                  </Select>

                )}
              />

              {errors.role && (

                <p
                  className="
                    text-sm
                    text-red-500
                  "
                >
                  {errors.role.message}
                </p>

              )}

            </div>

          )}


          {/* =================================================
              FOOTER
          ================================================= */}

          <DialogFooter
            className="
              border-t
              pt-5
            "
          >

            <Button
              type="button"
              variant="outline"
              disabled={
                loading
              }
              onClick={() =>
                handleDialogChange(
                  false
                )
              }
            >
              Cancel
            </Button>


            <Button
              type="submit"
              disabled={
                loading
              }
              className="
                bg-[#8b642d]
                text-white
                hover:bg-[#765323]
              "
            >

              {loading && (

                <Loader2
                  className="
                    mr-2
                    h-4
                    w-4
                    animate-spin
                  "
                />

              )}

              {isEdit
                ? "Save changes"
                : "Create user"}

            </Button>

          </DialogFooter>

        </form>

      </DialogContent>

    </Dialog>
  );
}