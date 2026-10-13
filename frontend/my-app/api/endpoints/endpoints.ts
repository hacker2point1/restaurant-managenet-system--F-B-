export const endpoints = {
    auth: {
        signIn: "/api/v1/auth/login",
        signUp: "/api/v1/auth/register",
        otp: "/api/v1/auth/verify-otp",
        refreshToken: "/api/v1/auth/refresh-token",
        profileDetails: "/api/v1/auth/profile",
        logout: "/api/v1/auth/logout",
    },

    analytics: {
        // Dashboard
        dashboard: "/api/v1/analytics/dashboard",

        // Overall Summary
        summary: "/api/v1/analytics/summary",

        // Revenue
        revenue: "/api/v1/analytics/revenue",
        dailyRevenue: "/api/v1/analytics/revenue/daily",
        weeklyRevenue: "/api/v1/analytics/revenue/weekly",
        monthlyRevenue: "/api/v1/analytics/revenue/monthly",
        yearlyRevenue: "/api/v1/analytics/revenue/yearly",
        revenueByBranch: "/api/v1/analytics/revenue/by-branch",
        revenueByPaymentMethod:
            "/api/v1/analytics/revenue/by-payment-method",
        revenueComparison:
            "/api/v1/analytics/revenue/comparison",

        // Orders
        orders: "/api/v1/analytics/orders",
        orderStatus:
            "/api/v1/analytics/orders/status",
        paymentStatus:
            "/api/v1/analytics/orders/payment-status",
        peakOrderHours:
            "/api/v1/analytics/orders/peak-hours",
        dailyOrderTrends:
            "/api/v1/analytics/orders/daily-trends",
    },
    restaurant: {
        getAll: "/api/v1/restaurent",

        getById: (id: string) =>
            `/api/v1/restaurent/${id}`,

        create: "/api/v1/restaurent",

        update: (id: string) =>
            `/api/v1/restaurent/${id}`,

        delete: (id: string) =>
            `/api/v1/restaurent/${id}`,

        activate: (id: string) =>
            `/api/v1/restaurent/${id}/activate`,

        deactivate: (id: string) =>
            `/api/v1/restaurent/${id}/deactivate`,

        restore: (id: string) =>
            `/api/v1/restaurent/${id}/restore`,

        hardDelete: (id: string) =>
            `/api/v1/restaurent/${id}/hard-delete`,
    },
    branch: {
      getByRestaurant: (restaurantId: string) =>
        `/api/v1/branch/${restaurantId}`,

      getByRestaurantId: (restaurantId: string) =>
        `/api/v1/branch/${restaurantId}`,

      getAll: (restaurantId: string) =>
        `/api/v1/branch/${restaurantId}`,

      create: (restaurantId: string) =>
        `/api/v1/branch/${restaurantId}`,

      getById: (id: string) =>
        `/api/v1/branch/detail/${id}`,

      update: (id: string) =>
        `/api/v1/branch/detail/${id}`,

      activate: (id: string) =>
        `/api/v1/branch/detail/${id}/activate`,

      deactivate: (id: string) =>
        `/api/v1/branch/detail/${id}/deactivate`,

      softDelete: (id: string) =>
        `/api/v1/branch/detail/${id}/soft-delete`,

      restore: (id: string) =>
        `/api/v1/branch/detail/${id}/restore`,

      hardDelete: (id: string) =>
        `/api/v1/branch/detail/${id}/hard-delete`,
    },
    user: {
    getAll: "/api/v1/user",

    create: "/api/v1/user",

    getById: (id: string) =>
      `/api/v1/user/${id}`,

    update: (id: string) =>
      `/api/v1/user/${id}`,

    delete: (id: string) =>
      `/api/v1/user/${id}`,

    activate: (id: string) =>
      `/api/v1/user/${id}/activate`,

    deactivate: (id: string) =>
      `/api/v1/user/${id}/deactivate`,

    changeRole: (id: string) =>
      `/api/v1/user/${id}/role`,
  },
  table: {
    create: (branchId: string) =>
      `/api/v1/table/branches/${branchId}/tables`,

    getAll: "/api/v1/table/tables",

    getByBranch: (branchId: string) =>
      `/api/v1/table/branches/${branchId}/tables`,

    getAvailable: (branchId: string) =>
      `/api/v1/table/branches/${branchId}/tables/available`,

    checkAvailability: (branchId: string) =>
      `/api/v1/table/branches/${branchId}/tables/check-availability`,

    utilization: (branchId: string) =>
      `/api/v1/table/branches/${branchId}/tables/utilization`,

    getById: (id: string) =>
      `/api/v1/table/tables/${id}`,

    update: (id: string) =>
      `/api/v1/table/tables/${id}`,

    softDelete: (id: string) =>
      `/api/v1/table/tables/${id}/soft-delete`,

    restore: (id: string) =>
      `/api/v1/table/tables/${id}/restore`,

    permanentDelete: (id: string) =>
      `/api/v1/table/tables/${id}/permanent-delete`,

    updateStatus: (id: string) =>
      `/api/v1/table/tables/${id}/status`,

    allocate: (id: string) =>
      `/api/v1/table/tables/${id}/allocate`,

    release: (id: string) =>
      `/api/v1/table/tables/${id}/release`,
  },
  reservation: {
    getAdmin: "/api/v1/branch/admin/reservations",

    getByBranch: (branchId: string) =>
      `/api/v1/branch/branches/${branchId}/reservations`,

    create: (branchId: string) =>
      `/api/v1/branch/branches/${branchId}/reservations`,

    checkAvailability: (branchId: string) =>
      `/api/v1/branch/branches/${branchId}/reservations/check-availability`,

    getById: (id: string) =>
      `/api/v1/branch/reservations/${id}`,

    update: (id: string) =>
      `/api/v1/branch/reservations/${id}`,

    cancel: (id: string) =>
      `/api/v1/branch/reservations/${id}/cancel`,

    confirm: (id: string) =>
      `/api/v1/branch/reservations/${id}/confirm`,

    complete: (id: string) =>
      `/api/v1/branch/reservations/${id}/complete`,

    noShow: (id: string) =>
      `/api/v1/branch/reservations/${id}/no-show`,

    assignTable: (id: string) =>
      `/api/v1/branch/reservations/${id}/assign-table`,
  },


  menuCategory: {
    getAll: (branchId: string) =>
      `/api/v1/menuCategory/branches/${branchId}/menu-categories`,

    create: (branchId: string) =>
      `/api/v1/menuCategory/branches/${branchId}/menu-categories`,

    getById: (id: string) =>
      `/api/v1/menuCategory/menu-categories/${id}`,

    update: (id: string) =>
      `/api/v1/menuCategory/menu-categories/${id}`,

    softDelete: (id: string) =>
      `/api/v1/menuCategory/menu-categories/${id}/soft-delete`,

    restore: (id: string) =>
      `/api/v1/menuCategory/menu-categories/${id}/restore`,

    hardDelete: (id: string) =>
      `/api/v1/menuCategory/menu-categories/${id}/hard-delete`,

    activate: (id: string) =>
      `/api/v1/menuCategory/menu-categories/${id}/activate`,

    deactivate: (id: string) =>
      `/api/v1/menuCategory/menu-categories/${id}/deactivate`,

    getMenuItems: (id: string) =>
      `/api/v1/menuCategory/menu-categories/${id}/menu-items`,
  },
  menuItems: {
    getAll: "/api/v1/menuItems/menu-items",

    search: "/api/v1/menuItems/menu-items/search",

    getById: (id: string) =>
      `/api/v1/menuItems/menu-items/${id}`,

    create: (branchId: string) =>
      `/api/v1/menuItems/branches/${branchId}/menu-items`,

    update: (id: string) =>
      `/api/v1/menuItems/menu-items/${id}`,

    softDelete: (id: string) =>
      `/api/v1/menuItems/menu-items/${id}/soft-delete`,

    restore: (id: string) =>
      `/api/v1/menuItems/menu-items/${id}/restore`,

    hardDelete: (id: string) =>
      `/api/v1/menuItems/menu-items/${id}/hard-delete`,

    toggleAvailability: (id: string) =>
      `/api/v1/menuItems/menu-items/${id}/toggle-availability`,

    toggleFeatured: (id: string) =>
      `/api/v1/menuItems/menu-items/${id}/toggle-featured`,
  },
  inventoryItem: {
    getByBranch: (branchId: string) =>
      `/api/v1/inventoryItem/branches/${branchId}/inventory`,
  },
  inventory: {
  getAll: (branchId: string) =>
    `/api/v1/inventoryItem/branches/${branchId}/inventory`,

  getDeleted: (branchId: string) =>
    `/api/v1/inventoryItem/branches/${branchId}/inventory/deleted`,

  getById: (id: string) =>
    `/api/v1/inventoryItem/inventory/${id}`,

  create: (branchId: string) =>
    `/api/v1/inventoryItem/branches/${branchId}/inventory`,

  update: (id: string) =>
    `/api/v1/inventoryItem/inventory/${id}`,

  softDelete: (id: string) =>
    `/api/v1/inventoryItem/inventory/${id}/soft-delete`,

  restore: (id: string) =>
    `/api/v1/inventoryItem/inventory/${id}/restore`,

  hardDelete: (id: string) =>
    `/api/v1/inventoryItem/inventory/${id}/hard-delete`,

  activate: (id: string) =>
    `/api/v1/inventoryItem/inventory/${id}/activate`,

  deactivate: (id: string) =>
    `/api/v1/inventoryItem/inventory/${id}/deactivate`,

  updateStock: (id: string) =>
    `/api/v1/inventoryItem/inventory/${id}/stock`,

  lowStock: (branchId: string) =>
    `/api/v1/inventoryItem/branches/${branchId}/inventory/low-stock`,

  expiring: (branchId: string) =>
    `/api/v1/inventoryItem/branches/${branchId}/inventory/expiring`,
},
inventoryTransaction: {
  getAll: "/api/v1/inventoryTransaction/inventory-transactions",

  getById: (id: string) =>
    `/api/v1/inventoryTransaction/inventory-transactions/${id}`,

  stockIn:
    "/api/v1/inventoryTransaction/inventory-transactions/stock-in",

  stockOut:
    "/api/v1/inventoryTransaction/inventory-transactions/stock-out",

  purchase:
    "/api/v1/inventoryTransaction/inventory-transactions/purchase",

  wastage:
    "/api/v1/inventoryTransaction/inventory-transactions/wastage",

  returnStock:
    "/api/v1/inventoryTransaction/inventory-transactions/return",

  adjustment:
    "/api/v1/inventoryTransaction/inventory-transactions/adjust",

  consumption:
    "/api/v1/inventoryTransaction/inventory-transactions/consumption",

  report:
    "/api/v1/inventoryTransaction/inventory-transactions/report",
},
coupon: {
  getAll:
    "/api/v1/coupon/coupons",

  getDeleted:
    "/api/v1/coupon/coupons/deleted",

  getById: (id: string) =>
    `/api/v1/coupon/coupons/${id}`,

  create:
    "/api/v1/coupon/coupons",

  update: (id: string) =>
    `/api/v1/coupon/coupons/${id}`,

  activate: (id: string) =>
    `/api/v1/coupon/coupons/${id}/activate`,

  deactivate: (id: string) =>
    `/api/v1/coupon/coupons/${id}/deactivate`,

  restore: (id: string) =>
    `/api/v1/coupon/coupons/${id}/restore`,

  delete: (id: string) =>
    `/api/v1/coupon/coupons/${id}`,

  permanentDelete: (id: string) =>
    `/api/v1/coupon/coupons/${id}/permanent`,

  statistics:
    "/api/v1/coupon/coupons/statistics",

  usage: (id: string) =>
    `/api/v1/coupon/coupons/${id}/usage`,
},
review: {
  getAll: "/api/v1/review/reviews",
  getById: (id: string) => `/api/v1/review/reviews/${id}`,

  approve: (id: string) => `/api/v1/review/reviews/${id}/approve`,
  reject: (id: string) => `/api/v1/review/reviews/${id}/reject`,

  softDelete: (id: string) => `/api/v1/review/reviews/${id}`,
  restore: (id: string) => `/api/v1/review/reviews/${id}/restore`,
  hardDelete: (id: string) => `/api/v1/review/reviews/${id}/permanent`,

  averageRating: (restaurantId: string) =>
    `/api/v1/review/restaurants/${restaurantId}/reviews/average-rating`,

  ratingDistribution: (restaurantId: string) =>
    `/api/v1/review/restaurants/${restaurantId}/reviews/rating-distribution`,
},
customer: {
    getAll: "/api/v1/customer/customers",
    getDeleted: "/api/v1/customer/customers/deleted",
    getById: (id: string) => `/api/v1/customer/customers/${id}`,
    create: "/api/v1/customer/customers",
    update: (id: string) => `/api/v1/customer/customers/${id}`,
    softDelete: (id: string) =>
      `/api/v1/customer/customers/${id}/soft-delete`,
    restore: (id: string) =>
      `/api/v1/customer/customers/${id}/restore`,
    hardDelete: (id: string) =>
      `/api/v1/customer/customers/${id}/hard-delete`,
     search: "/api/v1/customer/customers/search",
  },

};

export const endpoint = [
    // Auth
    endpoints.auth.signIn,
    endpoints.auth.signUp,
    endpoints.auth.refreshToken,

    // Analytics
    endpoints.analytics.dashboard,
    endpoints.analytics.summary,
    endpoints.analytics.revenue,
    endpoints.analytics.dailyRevenue,
    endpoints.analytics.weeklyRevenue,
    endpoints.analytics.monthlyRevenue,
    endpoints.analytics.yearlyRevenue,
    endpoints.analytics.revenueByBranch,
    endpoints.analytics.revenueByPaymentMethod,
    endpoints.analytics.revenueComparison,
    endpoints.analytics.orders,
    endpoints.analytics.orderStatus,
    endpoints.analytics.paymentStatus,
    endpoints.analytics.peakOrderHours,
    endpoints.analytics.dailyOrderTrends,
];