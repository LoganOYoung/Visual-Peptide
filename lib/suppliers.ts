/**
 * Static supplier list for the Suppliers page.
 * No backend; add entries manually when third-party test reports are available.
 */

export interface SupplierEntry {
  name: string;
  region: string;
  reportsLink?: string;
  notes?: string;
}

export const supplierList: SupplierEntry[] = [
  // Entries will be added as we verify third-party test reports (e.g. Janoshik).
  // Example shape: { name: "Lab name", region: "US", reportsLink: "https://...", notes: "HPLC available" }
];
