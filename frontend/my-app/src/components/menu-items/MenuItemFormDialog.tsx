"use client";

import { useEffect, useState } from "react";

import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store/store";
import { createMenuItem, updateMenuItem } from "@/redux/slice/menuItemSlice";
import { getRestaurants } from "@/redux/slice/restaurentSlice";
import type { MenuItem, MenuItemFormData } from "@/types/menuItem";
import type { MenuCategory } from "@/types/menuCategory";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  item?: MenuItem;
  onSaved?: () => void;
}

interface BranchOption {
  _id: string;
  name: string;
  restaurantName: string;
}

interface CategoryListResponse {
  data?: MenuCategory[];
}

interface InventoryOption {
  _id: string;
  name: string;
  unit: string;
  currentQuantity: number;
}

interface InventoryListResponse {
  data?: InventoryOption[];
}

const emptyForm: MenuItemFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  foodType: "vegetarian",
  preparationTime: "",
  ingredients: [],
  tags: [],
  isAvailable: true,
  isFeatured: false,
  images: [],
};

const getReferenceId = (
  reference: string | { _id: string } | undefined
) => (typeof reference === "string" ? reference : reference?._id || "");

export default function MenuItemFormDialog({
  open,
  onOpenChange,
  mode,
  item,
  onSaved,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const restaurants = useSelector(
    (state: RootState) => state.restaurant.restaurants
  );
  const actionLoading = useSelector(
    (state: RootState) => state.menuItems.actionLoading
  );

  const [form, setForm] = useState<MenuItemFormData>(() => ({
    ...emptyForm,
    name: item?.name || "",
    description: item?.description || "",
    price: item ? String(item.price) : "",
    category: getReferenceId(item?.category),
    foodType: item?.foodType || "vegetarian",
    preparationTime: item?.preparationTime ? String(item.preparationTime) : "",
    ingredients: (item?.ingredients || []).map((entry) =>
      typeof entry === "string" ? entry : entry._id
    ),
    tags: item?.tags || [],
    isAvailable: item?.isAvailable ?? true,
    isFeatured: item?.isFeatured ?? false,
  }));
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchId, setBranchId] = useState(() => getReferenceId(item?.branch));
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryOption[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(mode === "create");
  const [categoriesLoading, setCategoriesLoading] = useState(Boolean(getReferenceId(item?.branch)));
  const [inventoryLoading, setInventoryLoading] = useState(Boolean(getReferenceId(item?.branch)));

  useEffect(() => {
    if (mode !== "create") return;
    if (restaurants.length === 0) {
      dispatch(getRestaurants());
      return;
    }

    let current = true;

    Promise.all(
      restaurants.map(async (restaurant) => {
        try {
          const response = await axiosInstance.get<{ data?: { _id: string; name: string }[] }>(
            endpoints.branch.getByRestaurantId(restaurant._id)
          );
          return (response.data?.data || []).map((branch) => ({
            ...branch,
            restaurantName: restaurant.name,
          }));
        } catch {
          return [];
        }
      })
    )
      .then((results) => {
        if (current) setBranches(results.flat());
      })
      .catch(() => {
        if (current) setBranches([]);
      })
      .finally(() => {
        if (current) setBranchesLoading(false);
      });

    return () => {
      current = false;
    };
  }, [dispatch, mode, restaurants]);

  useEffect(() => {
    let current = true;
    Promise.resolve().then(async () => {
      if (!branchId) {
        if (current) {
          setCategories([]);
          setInventoryItems([]);
          setCategoriesLoading(false);
          setInventoryLoading(false);
        }
        return;
      }

      setCategoriesLoading(true);
      setInventoryLoading(true);
      try {
        const [categoryResponse, inventoryResponse] = await Promise.all([
          axiosInstance.get<CategoryListResponse>(
            endpoints.menuCategory.getAll(branchId),
            { params: { limit: 1000 } }
          ),
          axiosInstance.get<InventoryListResponse>(
            endpoints.inventoryItem.getByBranch(branchId),
            { params: { limit: 100, isActive: true } }
          ),
        ]);
        if (current) {
          setCategories(categoryResponse.data?.data || []);
          setInventoryItems(inventoryResponse.data?.data || []);
        }
      } catch {
        if (current) {
          setCategories([]);
          setInventoryItems([]);
        }
      } finally {
        if (current) {
          setCategoriesLoading(false);
          setInventoryLoading(false);
        }
      }
    });

    return () => {
      current = false;
    };
  }, [branchId]);

  const updateField = <K extends keyof MenuItemFormData>(
    key: K,
    value: MenuItemFormData[K]
  ) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "edit" && item) {
      const result = await dispatch(updateMenuItem({ id: item._id, data: form }));
      if (updateMenuItem.fulfilled.match(result)) {
        onSaved?.();
        onOpenChange(false);
      }
      return;
    }

    if (!branchId) return;

    const result = await dispatch(createMenuItem({ branchId, data: form }));
    if (createMenuItem.fulfilled.match(result)) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit menu item" : "Add menu item"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update the menu item details." : "Add an item to a branch menu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="menu-item-branch">Branch</Label>
              <select
                id="menu-item-branch"
                value={branchId}
                onChange={(event) => {
                  setBranchId(event.target.value);
                  updateField("category", "");
                }}
                required
                disabled={branchesLoading}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  {branchesLoading ? "Loading branches..." : "Select branch"}
                </option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.restaurantName} · {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="menu-item-name">Name</Label>
              <Input id="menu-item-name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-item-price">Price</Label>
              <Input id="menu-item-price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateField("price", event.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-item-description">Description</Label>
            <Textarea id="menu-item-description" value={form.description} onChange={(event) => updateField("description", event.target.value)} rows={3} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="menu-item-category">Category</Label>
              <select
                id="menu-item-category"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                required
                disabled={!branchId || categoriesLoading}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  {categoriesLoading ? "Loading categories..." : "Select category"}
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-item-food-type">Food type</Label>
              <select
                id="menu-item-food-type"
                value={form.foodType}
                onChange={(event) => updateField("foodType", event.target.value as MenuItemFormData["foodType"])}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="menu-item-preparation">Preparation time (minutes)</Label>
              <Input id="menu-item-preparation" type="number" min="0" value={form.preparationTime} onChange={(event) => updateField("preparationTime", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-item-images">Images</Label>
              <Input id="menu-item-images" type="file" accept="image/*" multiple onChange={(event) => updateField("images", Array.from(event.target.files || []))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ingredients from branch inventory</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
              {inventoryLoading ? (
                <p className="text-sm text-muted-foreground">Loading inventory...</p>
              ) : inventoryItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active inventory items are available for this branch.
                </p>
              ) : (
                inventoryItems.map((ingredient) => (
                  <label
                    key={ingredient._id}
                    htmlFor={`menu-item-ingredient-${ingredient._id}`}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      id={`menu-item-ingredient-${ingredient._id}`}
                      type="checkbox"
                      checked={form.ingredients.includes(ingredient._id)}
                      onChange={(event) => {
                        const nextIngredients = event.target.checked
                          ? [...new Set([...form.ingredients, ingredient._id])]
                          : form.ingredients.filter((id) => id !== ingredient._id);
                        updateField("ingredients", nextIngredients);
                      }}
                    />
                    <span>{ingredient.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {ingredient.currentQuantity} {ingredient.unit}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-item-tags">Tags</Label>
            <Input id="menu-item-tags" value={form.tags.join(", ")} onChange={(event) => updateField("tags", event.target.value.split(",").map((value) => value.trim()).filter(Boolean))} placeholder="Popular, spicy" />
          </div>

          <div className="flex flex-wrap gap-6 rounded-md border p-4">
            <label className="flex items-center gap-3 text-sm">
              <span>Available</span>
              <Switch checked={form.isAvailable} onCheckedChange={(checked) => updateField("isAvailable", checked)} />
            </label>
            <label className="flex items-center gap-3 text-sm">
              <span>Featured</span>
              <Switch checked={form.isFeatured} onCheckedChange={(checked) => updateField("isFeatured", checked)} />
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={actionLoading}>Cancel</Button>
            <Button type="submit" disabled={actionLoading || !form.name.trim() || !branchId || !form.category}>
              {actionLoading ? "Saving..." : mode === "edit" ? "Save changes" : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}