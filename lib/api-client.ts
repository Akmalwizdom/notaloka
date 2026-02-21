export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let data: { data?: T; error?: { message?: string; code?: string } } | null = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    if (!response.ok) {
      throw new ApiError(
        "Server returned a non-JSON error response",
        response.status
      );
    }

    throw new ApiError(
      "Server returned an invalid response format",
      response.status
    );
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error?.message || response.statusText,
      response.status,
      data?.error?.code
    );
  }

  if (!data || typeof data !== "object" || !("data" in data)) {
    throw new ApiError(
      "Server response is missing expected data field",
      response.status
    );
  }

  return data.data as T;
}

export const apiClient = {
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },

  async post<T>(url: string, body: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async patch<T>(url: string, body: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },
};
