# HRM Employee Module - Code Review Fixes

## Bugs — FIXED ✅

### 1. PHP `charAt()` does not exist — `Employee.php:92`

```php
// BROKEN
return "{$this->first_name?->charAt(0)}{$this->last_name?->charAt(0)}";

// FIX
return ($this->first_name ? $this->first_name[0] : '') . ($this->last_name ? $this->last_name[0] : '');
```

---

### 2. Avatar upload silently broken — `HrmController store/update`

The `$request->merge(collect($request->all())->mapWithKeys(...))` line moves UploadedFile from Laravel's **file bag** to the **input bag**. `$request->hasFile()` checks the file bag — finds nothing — returns false. Avatar always saved as null.

`ConvertEmptyStringsToNull` middleware already handles this globally. Merge line was redundant AND destructive.

```php
// BROKEN — destroys file uploads
$request->merge(collect($request->all())->mapWithKeys(fn ($value, $key) => [$key => $value === '' ? null : $value])->toArray());

// FIX — removed. Middleware handles it.
```

---

### 3. Display pictures not rendered on employee pages

**Files:** `Employees.tsx:165-168`, `Employees.tsx:277-278`, `Show.tsx:29-31`

All three views hardcode initials, never check `employee.avatar`. Fixed with avatar-first pattern matching `AppLayout.tsx`.

---

### 4. Old avatar not deleted on update — `HrmController update()`

Old avatar files were never cleaned from storage. Now deletes old file before storing new one (same pattern as `ProfileController`).

---

### 5. Storage symlink missing

`public/storage` symlink did not exist. Ran `php artisan storage:link`.

---

### 6. Avatars directory missing

`storage/app/public/avatars/` did not exist. Created manually.

---

### 7. Empty-to-null conversion removed — `HrmController store/update`

The duplicate `$request->merge()` lines (code smell #7) were the same lines causing bug #2. Removed entirely.

---

## Bugs — FIXED ✅ (continued)

### 8. `approveLeave` references renamed column — `HrmController.php:293`

`leave_balance` column was renamed to `leave_days`. This always fell back to hardcoded `20`. Now reads/writes `leave_days`.

---

### 9. Show.tsx uses wrong field names for attendance — `Show.tsx:167-168`

`attendance_logs` table uses `check_in`/`check_out`, template referenced `clock_in`/`clock_out`. Fixed.

---

### 10. Dashboard `absent` count is wrong — `HrmController.php:41-52`

Was counting all employees minus today's logs, ignoring employees on approved leave. Now excludes both present and on-leave employee IDs, and only counts active (non-terminated) employees.

---

## Code Smells — FIXED ✅

### 11. Dead mock data in Employees.tsx

`EMPLOYEES_MOCK` and `DEPARTMENTS_MOCK` removed; fallback is now `[]`.

---

### 12. Employee number generation race condition — `HrmController.php:create()`

Switched from parsing the last employee's number string to `Employee::max('id') + 1`. This is a display suggestion only (form field remains editable); actual creation is still protected by the `unique:employees` validation rule, so a collision just surfaces as a validation error rather than a silent duplicate.

---

### 13. Manager self-exclusion filtered twice — `Edit.tsx` + `HrmController.php`

Backend already filters `->where('id', '!=', $employee->id)`. Removed the redundant frontend `.filter()`.

---

### 14. Search input not escaped for LIKE wildcards — `HrmController.php:employees()`

User input containing `%` or `_` now has those characters escaped before being used in a `LIKE` clause.

---

### 15. Delete methods don't check for dependents — `SettingController.php`

`destroyDepartment`, `destroyEmploymentType`, `destroyLeaveType`, `destroyStaffLevel` now check for references before deleting and return a validation error instead of orphaning data or hitting an FK constraint:
- Department → assigned employees
- EmploymentType → assigned employees
- LeaveType → existing leave requests (matched by lowercased name, since `leave_requests.leave_type` is a string column, not a FK)
- StaffLevel → assigned employees or leave types
