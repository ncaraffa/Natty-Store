// DADO MOCK INTERNO. Este módulo só pode ser importado por código server-side.
import "server-only";

export const mockInventory: Readonly<Record<string, number>> = {
  "mock-mm2-1": 5,
  "mock-ftf-1": 2,
  "mock-adopt-1": 0,
  "mock-order-1": 0,
  "mock-backorder-1": 0,
};
