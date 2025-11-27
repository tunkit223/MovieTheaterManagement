import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";
import type { StaffProfile } from "@/types/StaffType/StaffProfile";

export const getMyInfo = async () => {
  return await httpClient.get(API.MY_INFO, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const updateMyInfo = async (
  staffId: string,
  data: {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    cinemaId?: string;
    address?: string;
    gender?: string;
    dob?: string;
    role?: Array<string>;
    avatarUrl?: string;
}) => {
  return await httpClient.put(`/staffs/${staffId}`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const getAllStaffs = async () => {
  const response = await httpClient.get("/staffs", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.data?.result as StaffProfile[];
};

export const getStaffsByCinema = async (cinemaId: string) => {
  const response = await httpClient.get("/staffs", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params: {
      cinemaId,
    },
  });
  const data = (response.data?.result as StaffProfile[]) || [];
  return data.filter((staff) => staff.cinemaId === cinemaId);
};
