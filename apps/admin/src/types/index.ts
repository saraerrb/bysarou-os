export interface ProductWithVariants {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
  };
  variants: VariantData[];
}

export interface VariantData {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  sizeId?: string | null;
  colorId?: string | null;
  sku: string;
  stockQuantity: number;
  costPrice?: number | null;
  sellingPrice?: number | null;
  barcode?: string | null;
  active?: boolean;
  createdAt: Date;
  updatedAt: Date;
  sizeRef?: SizeData | null;
  colorRef?: ColorData | null;
}

export interface SizeData {
  id: string;
  name: string;
  displayOrder: number;
  active: boolean;
}

export interface ColorData {
  id: string;
  name: string;
  hexCode: string;
  active: boolean;
}

export interface StockMovementData {
  id: string;
  variantId: string;
  type: "IN" | "OUT" | "RETURN" | "MANUAL_ADJUSTMENT";
  quantity: number;
  reason: string | null;
  createdAt: Date;
  variant: {
    sku: string;
    size: string;
    color: string;
    product: {
      name: string;
    };
  };
}

export interface CategoryData {
  id: string;
  name: string;
  createdAt: Date;
  _count?: {
    products: number;
  };
}

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
  imageUrl?: string;
  variants: {
    size: string;
    color: string;
    sku: string;
    stockQuantity: number;
  }[];
}

export interface UpdateStockInput {
  variantId: string;
  quantity: number;
  type: "IN" | "OUT" | "RETURN" | "MANUAL_ADJUSTMENT";
  reason?: string;
}
