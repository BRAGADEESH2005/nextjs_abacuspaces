"use client";

import NextLink from "next/link";
import {
  usePathname,
  useRouter,
  useParams as useNextParams,
} from "next/navigation";
import React from "react";

export function useLocation() {
  const pathname = usePathname();
  const hash = typeof window !== "undefined" ? window.location.hash : "";

  return {
    pathname,
    search:
      typeof window !== "undefined" && window.location.search
        ? window.location.search
        : "",
    hash,
  };
}

export function useNavigate() {
  const router = useRouter();

  return React.useCallback(
    (to, options = {}) => {
      if (typeof to === "number") {
        if (to < 0) {
          router.back();
        } else if (to > 0) {
          router.forward();
        }
        return;
      }

      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router],
  );
}

export function useParams() {
  return useNextParams();
}

export function BrowserRouter({ children }) {
  return children;
}

export function Routes({ children }) {
  return children;
}

export function Route({ element }) {
  return element;
}

export function Link({ to, children, ...props }) {
  return (
    <NextLink href={to} {...props}>
      {children}
    </NextLink>
  );
}
