import httpClient from "@/configurations/httpClient";
import { CONFIG } from "@/configurations/configuration";

export interface Room {
  id: string;
  name: string;
  cinemaId: string;
  capacity?: number;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomRequest {
  name: string;
  cinemaId: string;
  capacity?: number;
  type?: string;
}

export interface UpdateRoomRequest {
  name?: string;
  capacity?: number;
  type?: string;
}

export const getAllRooms = async () => {
  return await httpClient.get(`${CONFIG.API}/rooms`);
};

export const getRoomsByCinema = async (cinemaId: string) => {
  return await httpClient.get(`${CONFIG.API}/rooms/cinema/${cinemaId}`);
};

export const getRoomById = async (roomId: string) => {
  return await httpClient.get(`${CONFIG.API}/rooms/${roomId}`);
};

export const createRoom = async (data: CreateRoomRequest) => {
  return await httpClient.post(`${CONFIG.API}/rooms`, data);
};

export const updateRoom = async (roomId: string, data: UpdateRoomRequest) => {
  return await httpClient.put(`${CONFIG.API}/rooms/${roomId}`, data);
};

export const deleteRoom = async (roomId: string) => {
  return await httpClient.delete(`${CONFIG.API}/rooms/${roomId}`);
};
