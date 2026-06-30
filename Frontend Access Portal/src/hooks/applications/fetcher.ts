export type ErrorWithStatus = Error & { status?: number };

export function getFetcher(fallbackErrorMessage: string) {
  return async (url: string) => {
    const res = await fetch(url);
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const error = new Error(
        (data as { message?: string })?.message || fallbackErrorMessage
      ) as ErrorWithStatus;
      error.status = res.status;
      throw error;
    }
    return data;
  };
}

export function postFetcher<T = unknown>(fallbackErrorMessage: string) {
  return async (url: string, { arg }: { arg: T }) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(arg, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      ),
    });

    const data = await res.json();

    if (!res.ok) {
      const error = new Error(
        (data as { message?: string })?.message || fallbackErrorMessage
      ) as ErrorWithStatus;
      error.status = res.status;
      throw error;
    }

    return data;
  };
}

export function putFetcher<T = unknown>(fallbackErrorMessage: string) {
  return async (url: string, { arg }: { arg: T }) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(arg, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      ),
    });

    const data = await res.json();

    if (!res.ok) {
      const error = new Error(
        (data as { message?: string })?.message || fallbackErrorMessage
      ) as ErrorWithStatus;
      error.status = res.status;
      throw error;
    }

    return data;
  };
}

export function deleteFetcher(fallbackErrorMessage: string) {
  return async (url: string) => {
    const res = await fetch(url, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      const error = new Error(
        (data as { message?: string })?.message || fallbackErrorMessage
      ) as ErrorWithStatus;
      error.status = res.status;
      throw error;
    }

    return true;
  };
}

export function formDataPostFetcher(fallbackErrorMessage: string) {
  return async (url: string, { arg }: { arg: FormData }) => {
    const res = await fetch(url, {
      method: "POST",
      body: arg,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        (data as { message?: string })?.message || fallbackErrorMessage
      );
    }

    return data;
  };
}

export function formDataPutFetcher(fallbackErrorMessage: string) {
  return async (url: string, { arg }: { arg: FormData }) => {
    const res = await fetch(url, {
      method: "PUT",
      body: arg,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        (data as { message?: string })?.message || fallbackErrorMessage
      );
    }

    return data;
  };
}
