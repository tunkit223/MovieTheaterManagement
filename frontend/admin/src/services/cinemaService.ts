import httpClient from "@/configurations/httpClient";
import { CONFIG } from "@/configurations/configuration";

export interface Cinema {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCinemaRequest {
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateCinemaRequest {
  name?: string;
  address?: string;
  phone?: string;
}

export const getAllCinemas = async () => {
  return await httpClient.get(`${CONFIG.API}/cinemas`);
};

export const getCinemaById = async (cinemaId: string) => {
  return await httpClient.get(`${CONFIG.API}/cinemas/${cinemaId}`);
};

export const createCinema = async (data: CreateCinemaRequest) => {
  return await httpClient.post(`${CONFIG.API}/cinemas`, data);
};

export const updateCinema = async (cinemaId: string, data: UpdateCinemaRequest) => {
  return await httpClient.put(`${CONFIG.API}/cinemas/${cinemaId}`, data);
};

export const deleteCinema = async (cinemaId: string) => {
  return await httpClient.delete(`${CONFIG.API}/cinemas/${cinemaId}`);
};
