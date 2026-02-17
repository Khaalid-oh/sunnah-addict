"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ProductPreviewContextValue = {
  previewHandle: string | null;
  openPreview: (handle: string) => void;
  closePreview: () => void;
};

const ProductPreviewContext = createContext<ProductPreviewContextValue | null>(null);

export function ProductPreviewProvider({ children }: { children: React.ReactNode }) {
  const [previewHandle, setPreviewHandle] = useState<string | null>(null);

  const openPreview = useCallback((handle: string) => {
    setPreviewHandle(handle);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewHandle(null);
  }, []);

  return (
    <ProductPreviewContext.Provider
      value={{
        previewHandle,
        openPreview,
        closePreview,
      }}
    >
      {children}
    </ProductPreviewContext.Provider>
  );
}

export function useProductPreview() {
  const ctx = useContext(ProductPreviewContext);
  if (!ctx) throw new Error("useProductPreview must be used within ProductPreviewProvider");
  return ctx;
}
