import axios, { AxiosError, type AxiosRequestConfig } from "axios";

interface ApiError {
  message: string;
  error?: string;
  details?: Record<string, string>;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public data: ApiError,
    message?: string
  ) {
    super(message || data.message || "An error occurred");
    this.name = "ApiClientError";
  }
}

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

export async function apiClient<T>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axiosInstance.request<T>({
      url,
      ...options,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      const status = axiosError.response?.status || 500;
      const data = axiosError.response?.data || {
        message: axiosError.message || "An error occurred",
      };

      throw new ApiClientError(status, data as ApiError, data.message);
    }

    throw new ApiClientError(500, { message: "An unexpected error occurred" });
  }
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  return apiClient<T>(url, {
    method: "POST",
    data: body,
  });
}

export async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  return apiClient<T>(url, {
    method: "PATCH",
    data: body,
  });
}

export async function apiGet<T>(url: string): Promise<T> {
  return apiClient<T>(url, {
    method: "GET",
  });
}

export async function apiDelete<T>(url: string): Promise<T> {
  return apiClient<T>(url, {
    method: "DELETE",
  });
}
