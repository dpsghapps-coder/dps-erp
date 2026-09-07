#!/usr/bin/env bash
#
# Updates specific keys in the server's .env file to the values this app
# needs in production, based on issues found deploying this app:
#   - APP_DEBUG must be false in production (true leaks stack traces,
#     file paths, and config values — including DB credentials — to
#     anyone who triggers an error page).
#   - SESSION_DRIVER=file avoids sessions sharing the same MySQL
#     connection/table as business data (was causing session writes to
#     silently collide with other DB activity).
#   - SESSION_LIFETIME=720 (12h) so sessions don't expire mid-workday.
#
# This script does NOT touch DB_*, APP_KEY, or any other credential —
# those are left exactly as they already are on the server. It only
# updates the keys listed in TARGET_KEYS below, backing up .env first.
#
# Run this ON THE SERVER, from the app's root directory:
#   bash deploy/update-production-env.sh
#
set -euo pipefail

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found. Run this from the app's root directory." >&2
    exit 1
fi

# key=value pairs to enforce. Edit here, not by hand-editing .env, so re-runs stay consistent.
declare -A TARGET_KEYS=(
    [APP_ENV]="production"
    [APP_DEBUG]="false"
    [SESSION_DRIVER]="file"
    [SESSION_LIFETIME]="720"
    [SESSION_SECURE_COOKIE]="true"
)

BACKUP_FILE="${ENV_FILE}.backup-$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
echo "Backed up current .env to $BACKUP_FILE"

for key in "${!TARGET_KEYS[@]}"; do
    value="${TARGET_KEYS[$key]}"
    if grep -qE "^${key}=" "$ENV_FILE"; then
        # Key exists — replace its value in place.
        sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        echo "Updated ${key}=${value}"
    else
        # Key missing — append it.
        echo "${key}=${value}" >> "$ENV_FILE"
        echo "Added ${key}=${value}"
    fi
done

echo ""
echo "Done. Diff against backup:"
diff "$BACKUP_FILE" "$ENV_FILE" || true

echo ""
echo "Next: php artisan config:clear"
