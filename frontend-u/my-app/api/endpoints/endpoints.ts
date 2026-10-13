export const endpoints = {
    auth:{
        signIn:"/api/v1/auth/login",
        signUp:"/api/v1/auth/register",
        verifyOtp:"/api/v1/auth/verify-otp",
        refreshToken:"/api/v1/auth/refresh-token",
        logout:"/api/v1/auth/logout",
        profile:"/api/v1/auth/profile",
        updateProfile:"/api/v1/auth/profile-update",

    },
    public: {
    homepageStats: "/api/v1/public/homepage-stats",
  },
   menuCategory: {
    getPublic: "/api/v1/menuCategory/public/menu-categories",
    getPublicMenuItems: (categoryId: string) =>
      `/api/v1/menuCategory/public/menu-categories/${categoryId}/menu-items`,
    getByBranch: (branchId: string) =>
      `/api/v1/menuCategory/branches/${branchId}/menu-categories`,

    getById: (id: string) =>
      `/api/v1/menuCategory/menu-categories/${id}`,

    getMenuItems: (id: string) =>
      `/api/v1/menuCategory/menu-categories/${id}/menu-items`,
    
  },
  restaurant: {
    getPublicList: "/api/v1/restaurent/public",
    getPublicById: (id: string) => `/api/v1/restaurent/public/${id}`,
  },
  reservation: {
    getAdminQueue: "/api/v1/branch/admin/reservations",
    confirm: (id: string) => `/api/v1/branch/reservations/${id}/confirm`,
    reject: (id: string) => `/api/v1/branch/reservations/${id}/reject`,
    getMyHistory: "/api/v1/branch/customers/me/reservations/history",
    cancel: (id: string) => `/api/v1/branch/reservations/${id}/cancel`,
    checkPublicAvailability: (branchId: string) =>
      `/api/v1/branch/public/branches/${branchId}/reservations/check-availability`,
    createForBranch: (branchId: string) =>
      `/api/v1/branch/branches/${branchId}/reservations`,
  },
  customer: {
    getAll: "/api/v1/branch/customers",
    create: "/api/v1/branch/customers",
  },

}