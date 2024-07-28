import { Cadre, CombinedUserData } from "@/types/user";

export const fetchUsers = async (
  userId?: string
): Promise<CombinedUserData[] | CombinedUserData> => {
  try {
    const url = userId ? `/api/admin/users/${userId}` : "/api/admin/users";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      console.error("Failed to fetch users");
      throw new Error("Failed to fetch users");
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const fetchCadres = async (): Promise<Cadre[]> => {
  try {
    const res = await fetch("/api/cadre");
    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      console.error("Failed to fetch cadres");
      throw new Error("Failed to fetch cadres");
    }
  } catch (error) {
    console.error("Error fetching cadres:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.error("Failed to delete user");
      throw new Error("Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  data: CombinedUserData
): Promise<CombinedUserData> => {
  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updatedUser = await res.json();
      return updatedUser;
    } else {
      console.error("Failed to update user");
      throw new Error("Failed to update user");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const verifyUser = async (
  userId: string,
  status: boolean
): Promise<void> => {
  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status ? "Verified" : "Pending" }),
    });
    if (!res.ok) {
      console.error("Failed to update verification status");
      throw new Error("Failed to update verification status");
    }
  } catch (error) {
    console.error("Error updating verification status:", error);
    throw error;
  }
};
