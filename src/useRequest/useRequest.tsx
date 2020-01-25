import { useState, Dispatch, SetStateAction } from 'react';

type Data = { [key: string]: any } | any[];
const _concat = (concat: boolean | string, data: Data, response: Data): any => {
  if (typeof concat === 'string') {
    return { ...data, [concat]: [...(data[concat] || []), ...(response[concat] || [])] };
  }

  if (Array.isArray(data) && Array.isArray(response)) {
    return [...data, ...response];
  }

  return null;
};

interface Options {
  loading?: boolean;
  data?: any;
  errors?: any;
}

interface Params {
  concat?: boolean | string;
}

interface RequestResponse<T> {
  request: (fn: { data: T } | Promise<{ data: T }>, params?: Params) => Promise<T>;
  data: T;
  errors: { [key: string]: any };
  loading: boolean;
  setData: Dispatch<any>;
  setErrors: Dispatch<
    SetStateAction<{
      [key: string]: string | string[];
    }>
  >;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export function useRequest<T>(options?: Options): RequestResponse<T> {
  const [data, setData] = useState((options && options.data) || []);
  const [errors, setErrors] = useState<{ [key: string]: string | string[] }>((options && options.errors) || {});
  const [loading, setLoading] = useState<boolean>((options && options.loading) || false);

  const request = async (fn: { data: T } | Promise<{ data: T }>, params?: Params): Promise<T> => {
    setErrors({});
    setLoading(true);

    try {
      const { data: response } = await fn;

      setLoading(false);

      if (params && params.concat) {
        const concatResponse = _concat(params.concat, data, response);
        setData(concatResponse);

        return Promise.resolve(concatResponse);
      }

      setData(response);

      return Promise.resolve(response);
    } catch ({ response = {} }) {
      setErrors(response.data);
      setLoading(false);

      return Promise.reject(response.data);
    }
  };

  return {
    request,
    data,
    errors,
    loading,
    setData,
    setErrors,
    setLoading,
  };
}
