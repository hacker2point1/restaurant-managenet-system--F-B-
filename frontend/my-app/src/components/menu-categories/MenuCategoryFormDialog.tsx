"use client";

import { useEffect, useState } from "react";

import {
  Loader2,
  ImagePlus,
} from "lucide-react";

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
  Textarea,
} from "@/components/ui/textarea";

import {
  Label,
} from "@/components/ui/label";

import {
  Switch,
} from "@/components/ui/switch";

import {
  Button,
} from "@/components/ui/button";

import {
  MenuCategory,
} from "@/types/menuCategory";

interface Props {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  category?: MenuCategory | null;

  loading?: boolean;

  onSubmit: (data: {
    name: string;
    description: string;
    displayOrder: number;
    isActive: boolean;
    image: File | null;
  }) => void;
}

export default function MenuCategoryFormDialog({
  open,
  onOpenChange,
  category,
  loading = false,
  onSubmit,
}: Props) {
  const isEdit = Boolean(category);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [displayOrder, setDisplayOrder] =
    useState("0");
  const [isActive, setIsActive] =
    useState(true);
  const [image, setImage] =
    useState<File | null>(null);

  useEffect(() => {
    if (!open) return;

    setName(category?.name || "");

    setDescription(
      category?.description || ""
    );

    setDisplayOrder(
      String(category?.displayOrder ?? 0)
    );

    setIsActive(
      category?.isActive ?? true
    );

    setImage(null);
  }, [open, category]);

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    onSubmit({
      name,
      description,
      displayOrder: Number(displayOrder) || 0,
      isActive,
      image,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit category"
              : "Add category"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update the category information below."
              : "Create a new menu category for this branch."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* NAME */}
          <div className="space-y-2">
            <Label htmlFor="category-name">
              Category name
            </Label>

            <Input
              id="category-name"
              placeholder="e.g. Starters"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Label htmlFor="category-description">
              Description
            </Label>

            <Textarea
              id="category-description"
              placeholder="Small plates and appetizers"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={3}
            />
          </div>

          {/* DISPLAY ORDER */}
          <div className="space-y-2">
            <Label htmlFor="display-order">
              Display order
            </Label>

            <Input
              id="display-order"
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) =>
                setDisplayOrder(e.target.value)
              }
            />
          </div>

          {/* IMAGE */}
          <div className="space-y-2">
            <Label>
              Category image
            </Label>

            <label
              htmlFor="category-image"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 p-4 hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <ImagePlus className="h-5 w-5 text-slate-500" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  {image
                    ? image.name
                    : "Choose an image"}
                </p>

                <p className="text-xs text-slate-400">
                  PNG, JPG or WEBP
                </p>
              </div>
            </label>

            <Input
              id="category-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                setImage(
                  e.target.files?.[0] || null
                )
              }
            />

            {isEdit &&
              category?.image?.url &&
              !image && (
                <img
                  src={category.image.url}
                  alt={category.name}
                  className="mt-2 h-20 w-20 rounded-lg object-cover"
                />
              )}
          </div>

          {/* ACTIVE */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">
                Active category
              </p>

              <p className="text-xs text-slate-500">
                Customers can see active categories.
              </p>
            </div>

            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* FOOTER */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-[#8b632f] hover:bg-[#765329]"
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {isEdit
                ? "Save changes"
                : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}