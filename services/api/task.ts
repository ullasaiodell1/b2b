import { TaskFilterState, TaskRecord } from '@/types/task';
import axios from './httpRequest';

export const getTasks = (params?: Partial<TaskFilterState>) => {
  return axios({
    method: 'GET',
    url: `/tasks`,
    params
  }) as Promise<TaskRecord[]>;
};

export const getTaskDetails = (id: string) => {
  return axios({
    method: 'GET',
    url: `/tasks/${id}`
  }) as Promise<TaskRecord>;
};

export const createTask = (data: Partial<TaskRecord>) => {
  return axios({
    method: 'POST',
    url: `/tasks`,
    data
  }) as Promise<TaskRecord>;
};

export const updateTask = (id: string, data: Partial<TaskRecord>) => {
  return axios({
    method: 'PUT',
    url: `/tasks/${id}`,
    data
  }) as Promise<TaskRecord>;
};

export const deleteTask = (id: string) => {
  return axios({
    method: 'DELETE',
    url: `/tasks/${id}`
  });
};
