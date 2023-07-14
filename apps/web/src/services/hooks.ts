import { useCallback, useEffect, useRef, useState } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import api from "./api";
import { setUser } from "./auth";
import type { RootState, AppDispatch } from "./store";
import { User } from "./auth/auth.types";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const feedback = {
  connection: "There was an issue connection to the server",
  server: "There was an issue on the server. Our bad",
};

export const useMountedState = () => {
  const isMountedRef = useRef<boolean>(false);
  const isMounted = useCallback(() => isMountedRef.current, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMounted;
};

export const useAccount = () => {
  const dispatch = useDispatch();
  const reqRef = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [account, setAccount] = useState<User | null>(null);

  const getProfile = useCallback(async () => {
    if (reqRef.current) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      reqRef.current = true;
      const response = await api.get("/me");
      dispatch(setUser(response.data));
      setAccount(response.data);
    } catch (err: any) {
      // eslint-disable-line
      setError(err.statusCode === 0 ? feedback.connection : feedback.server);
    } finally {
      reqRef.current = false;
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  return { loading, error, account, getProfile };
};
