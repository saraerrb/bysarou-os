# BySarou OS — Testing Guide

This document outlines the testing strategy and manual verification steps for BySarou OS.

## 🧪 Automated Testing
Run the following commands to verify system integrity:

```bash
# Type Checking (Verify no breaking schema changes)
npx tsc --noEmit

# Linting
npm run lint
```

## 🛠️ Manual Verification Checklist

### 1. Multi-Store SaaS Onboarding
- [ ] Visit `/register-admin` (only works on fresh DB).
- [ ] Verify a default store "BySarou" is created.
- [ ] Log in and verify the **Store Switcher** in the sidebar.

### 2. Inventory & Stock Logic
- [ ] Create a Product with variants.
- [ ] Verify `StockMovement` (IN) is recorded in the DB.
- [ ] Confirm an Order → Verify stock is deducted via **Automation Engine**.
- [ ] Check `AutomationLog` table for `ORDER_CONFIRMED_FLOW`.

### 3. Returns & Restocking
- [ ] Mark a delivered order as `RETURNED`.
- [ ] Go to **Returns Management** → Inspect return.
- [ ] Click **Restock** → Verify product stock increases.
- [ ] Verify `AutomationLog` for `ORDER_CONFIRMED_FLOW` is reset to allow re-processing if needed.

### 4. Role-Based Access (RBAC)
- [ ] Create a "Call Agent" user.
- [ ] Log in as Agent → Verify the **Team** and **Finance** menus are hidden.
- [ ] Verify API routes return `401/403` for restricted actions.

### 5. Advanced Analytics
- [ ] Add orders across different dates and cities.
- [ ] Verify charts in the **Analytics** dashboard update correctly.
- [ ] Test the **Dead Stock** warning by adding a product that has no sales.
- [ ] Test **Export CSV** and verify data alignment.

## 🛡️ Data Integrity Rules
- **No Double Deduction**: Handled by `AutomationLog` idempotency check.
- **No Double Restock**: Handled by Return status check (only `RECEIVED` can be restocked).
- **Tenant Isolation**: Every API filters by `getActiveStoreId()` from cookies.
