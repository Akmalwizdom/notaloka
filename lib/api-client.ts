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
    throw new ApiError(
      `Server returned an invalid response format: ${raw.slice(0, 100)}...`,
      response.status
    );
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error?.message || response.statusText || "An unexpected error occurred",
      response.status,
      data?.error?.code
    );
  }

  if (!data || typeof data !== "object" || !("data" in data)) {
    // If it's a successful response but missing 'data', it might be a different format
    // or a 204 No Content. If response is OK, we might return null or the data itself.
    // However, for this project, the pattern seems to be { data: T }
    return data as T;
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
