# Procurement Bulk Supplier Assignment Plan

## Objective
Implement a bulk supplier assignment feature in the Purchase Order (PO) creation process, allowing users to select multiple items and assign a common supplier to them in one action.

## Implementation Steps
1.  **UI Updates (`Procurement/Create.tsx`):**
    -   Add checkboxes to each item row in the PO creation table.
    -   Add a "Select All" checkbox in the table header.
    -   Display a "Bulk Assign Supplier" button when one or more items are selected.
    -   Implement state management for selected item indices.
2.  **Logic Integration:**
    -   Create a computed property (`commonSuppliersForSelection`) that filters suppliers based on intersection of suppliers available for all currently selected items.
3.  **Bulk Assignment Modal:**
    -   Create a modal that opens when "Bulk Assign Supplier" is clicked.
    -   Populate the modal with the filtered list of common suppliers.
    -   On assignment, update the main `supplier_id` field in the form state with the chosen supplier.
4.  **Testing/Verification:**
    -   Verify that checkbox selection works.
    -   Verify that bulk assignment correctly filters and applies the supplier.

## Verification
- Confirm that the assignment modal appears only when items are selected.
- Confirm that the supplier list accurately reflects the common suppliers for the selected combination of items.
