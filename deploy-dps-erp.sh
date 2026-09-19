#!/usr/bin/env bash
#
# deploy-dps-erp.sh — clone a new release of dps-erp and point public_html at it
# Run with --help (or see the usage() function below) for full usage.

set -euo pipefail

# ---- CONFIG: edit these for your setup -------------------------------
REPO_URL="https://github.com/dpsghapps-coder/dps-erp.git"
APP_NAME="dps-erp"
BASE_DIR="$HOME/www/webapps"
PUBLIC_HTML="$HOME/www/erp.dpsolutionsgh.com/public_html"
KEEP_RELEASES=5
# A folder with things that should persist across releases (uploaded
# files, etc.) since every deploy is a fresh git clone with an empty
# storage/ directory. Leave empty to skip persistence entirely.
SHARED_DIR="$HOME/www/webapps/shared/dps-erp"
FRESH_INSTALL=false   # set by the "fresh-install" subcommand — do not edit here
# ------------------------------------------------------------------------

log() { echo -e "==> $*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

usage() {
    cat <<'USAGE'
deploy-dps-erp.sh — clone a new release of dps-erp and point public_html at it

Usage:
  ./deploy-dps-erp.sh [branch-or-tag] [version-label]
  ./deploy-dps-erp.sh fresh-install [branch-or-tag] [version-label]
  ./deploy-dps-erp.sh rollback <version-label>
  ./deploy-dps-erp.sh list
  ./deploy-dps-erp.sh --help

Examples:
  ./deploy-dps-erp.sh                       # deploy master, auto version = timestamp
  ./deploy-dps-erp.sh v1.4.0                 # clone tag v1.4.0, version label = v1.4.0
  ./deploy-dps-erp.sh master hotfix-2026-09  # clone master, label it manually
  ./deploy-dps-erp.sh fresh-install v1.4.0   # clone v1.4.0, DROP ALL TABLES, re-migrate
  ./deploy-dps-erp.sh rollback dps-erp-v1.3.0
  ./deploy-dps-erp.sh list

After a successful deploy (run interactively), you're dropped into a
shell already cd'd into the new release directory -- run `exit` to
leave it and return to your previous shell.
USAGE
}

list_releases() {
    log "Existing releases in $BASE_DIR:"
    ls -1dt "$BASE_DIR"/${APP_NAME}-* 2>/dev/null || echo "  (none found)"
    echo
    log "public_html currently points to:"
    readlink -f "$PUBLIC_HTML" || echo "  (not a symlink / not set)"
}

link_release() {
    local release_dir="$1"
    [ -d "$release_dir/public" ] || die "No 'public' folder in $release_dir"
    log "Linking $PUBLIC_HTML -> $release_dir/public"
    ln -sfn "$release_dir/public" "$PUBLIC_HTML"
    log "Done. Live release: $(basename "$release_dir")"
}

cleanup_old_releases() {
    log "Cleaning up old releases (keeping last $KEEP_RELEASES)..."
    ls -1dt "$BASE_DIR"/${APP_NAME}-* 2>/dev/null | tail -n +$((KEEP_RELEASES + 1)) | while read -r old; do
        # never delete the one currently live
        if [ "$(readlink -f "$PUBLIC_HTML")" != "$(readlink -f "$old/public")" ]; then
            log "Removing $old"
            rm -rf "$old"
        fi
    done
}

# Points this release's storage/ at a persistent shared directory so
# uploaded files (avatars, material pictures, backups, ...) survive
# across deploys instead of starting empty with every fresh clone.
# Safe to call repeatedly: removing an old release later only unlinks
# the symlink, it never touches the shared target.
setup_shared_storage() {
    local release_dir="$1"

    [ -n "$SHARED_DIR" ] || return 0

    mkdir -p "$(dirname "$SHARED_DIR")"

    if [ ! -d "$SHARED_DIR/storage" ]; then
        log "First deploy with SHARED_DIR — seeding $SHARED_DIR/storage from this release"
        mkdir -p "$SHARED_DIR"
        cp -a "$release_dir/storage" "$SHARED_DIR/storage"
    fi

    log "Linking $release_dir/storage -> $SHARED_DIR/storage"
    rm -rf "$release_dir/storage"
    ln -sfn "$SHARED_DIR/storage" "$release_dir/storage"

    if [ -f "$SHARED_DIR/.env" ]; then
        log "Linking $release_dir/.env -> $SHARED_DIR/.env"
        ln -sfn "$SHARED_DIR/.env" "$release_dir/.env"
    fi
}

setup_env() {
    local release_dir="$1"
    local env_file="$release_dir/.env"

    log "Writing fresh .env in $env_file"
    cat > "$env_file" <<'ENV_TEMPLATE'
APP_NAME=DPS-ERP
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://192.168.1.130:8000
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US
APP_MAINTENANCE_DRIVER=file
# APP_MAINTENANCE_STORE=database
# PHP_CLI_SERVER_WORKERS=4
BCRYPT_ROUNDS=12
LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3308
DB_DATABASE=dps-erp
DB_USERNAME=root
DB_PASSWORD=
SESSION_DRIVER=database
SESSION_LIFETIME=720
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database
# CACHE_PREFIX=
MEMCACHED_HOST=127.0.0.1
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false
VITE_APP_NAME="${APP_NAME}"
ENV_TEMPLATE

    log "Applying production values to $env_file"
    sed -i \
        -e "s|^APP_ENV=.*|APP_ENV=production|" \
        -e "s|^APP_DEBUG=.*|APP_DEBUG=false|" \
        -e "s|^APP_URL=.*|APP_URL=https://erp.dpsolutionsgh.com/|" \
        -e "s|^DB_PORT=.*|DB_PORT=3306|" \
        -e "s|^DB_DATABASE=.*|DB_DATABASE=dbb0decd3apggv|" \
        -e "s|^DB_USERNAME=.*|DB_USERNAME=ulj5axnazowhk|" \
        -e "s|^DB_PASSWORD=.*|DB_PASSWORD=yfbgfumdno8o|" \
        "$env_file"
}

generate_key_if_missing() {
    local release_dir="$1"
    local env_file="$release_dir/.env"
    [ -f "$env_file" ] || return

    if [ "$FRESH_INSTALL" = true ]; then
        if command -v php >/dev/null 2>&1; then
            log "Fresh install — generating a new APP_KEY"
            php artisan key:generate --force
        else
            log "APP_KEY needs generating but 'php' is not available — skipping"
        fi
        return
    fi

    # Not a fresh install: never generate a new key (that would invalidate
    # existing sessions and encrypted data). Instead, carry over the key
    # from the currently-live release, if there is one.
    if grep -qE '^APP_KEY=\s*$' "$env_file" || ! grep -qE '^APP_KEY=' "$env_file"; then
        local live_public="" live_release="" live_key=""
        live_public=$(readlink -f "$PUBLIC_HTML" 2>/dev/null || true)
        if [ -n "$live_public" ]; then
            live_release=$(dirname "$live_public")
            [ -f "$live_release/.env" ] && live_key=$(grep -E '^APP_KEY=' "$live_release/.env" | cut -d= -f2-)
        fi

        if [ -n "$live_key" ]; then
            log "Reusing APP_KEY from currently live release"
            sed -i "s|^APP_KEY=.*|APP_KEY=${live_key}|" "$env_file"
        elif command -v php >/dev/null 2>&1; then
            log "No existing APP_KEY to reuse (first deploy) — generating one"
            php artisan key:generate --force
        else
            log "No existing APP_KEY to reuse and 'php' is not available — skipping"
        fi
    fi
}

deploy() {
    local ref="${1:-master}"
    local version="${2:-$(date +%Y%m%d%H%M%S)}"
    local release_dir="$BASE_DIR/${APP_NAME}-${version}"

    [ -d "$release_dir" ] && die "Release $release_dir already exists"

    mkdir -p "$BASE_DIR"
    log "Cloning $REPO_URL (ref: $ref) into $release_dir"
    git clone --depth 1 --branch "$ref" "$REPO_URL" "$release_dir" \
        || die "Clone failed — check that '$ref' is a valid branch or tag"

    cd "$release_dir" || die "Could not cd into $release_dir"
    log "Now working inside $(pwd)"

    setup_shared_storage "$release_dir"
    setup_env "$release_dir"
    generate_key_if_missing "$release_dir"

    log "Linking public/storage -> storage/app/public"
    php artisan storage:link --force

    # ---- Optional build steps (uncomment what your app needs) --------
    # Already inside $release_dir, so these can run directly:
    # composer install --no-dev --optimize-autoloader
    # npm ci && npm run build
    # php artisan config:cache

    if [ "$FRESH_INSTALL" = true ]; then
        log "⚠️  FRESH INSTALL requested — this will DROP ALL TABLES in the database and re-run migrations."
        log "    Target DB: $(grep '^DB_DATABASE=' .env 2>/dev/null | cut -d= -f2) on $(grep '^DB_HOST=' .env 2>/dev/null | cut -d= -f2)"
        read -r -p "Type YES (all caps) to confirm, anything else cancels: " confirm
        [ "$confirm" = "YES" ] || die "Fresh install cancelled — no tables were touched."
        php artisan migrate:fresh --force
    else
        php artisan migrate --force
    fi

    # Idempotent reference-data seeders (safe to re-run every deploy —
    # both use updateOrCreate, so existing rows are left alone / updated
    # in place rather than duplicated).
    log "Seeding permissions and CRM dropdown lists"
    php artisan db:seed --class=PermissionSeeder --force
    php artisan db:seed --class=CrmLookupSeeder --force

    link_release "$release_dir"
    cleanup_old_releases

    # A script can't change the directory of the shell that invoked it when
    # run as `./deploy-dps-erp.sh` (only `source`d scripts can do that) --
    # so instead we drop into a fresh interactive shell whose cwd is already
    # $release_dir. Skipped when stdin isn't a TTY (e.g. run non-interactively).
    if [ -t 0 ]; then
        log "Deploy complete. Dropping you into a shell inside $release_dir (type 'exit' to leave it)."
        exec "${SHELL:-/bin/bash}"
    else
        log "Deploy complete: $release_dir"
    fi
}

rollback() {
    local version_label="${1:-}"
    [ -z "$version_label" ] && die "Usage: $0 rollback <folder-name-under-webapps>"
    local release_dir="$BASE_DIR/$version_label"
    [ -d "$release_dir" ] || release_dir="$BASE_DIR/${APP_NAME}-${version_label}"
    [ -d "$release_dir" ] || die "Release not found: $version_label"
    link_release "$release_dir"
}

case "${1:-}" in
    -h|--help|help) usage ;;
    rollback)      rollback "${2:-}" ;;
    list)          list_releases ;;
    fresh-install)
        FRESH_INSTALL=true
        deploy "${2:-master}" "${3:-}"
        ;;
    *)             deploy "${1:-master}" "${2:-}" ;;
esac
