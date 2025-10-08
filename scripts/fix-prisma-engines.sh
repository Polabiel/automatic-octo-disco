#!/usr/bin/env bash
set -euo pipefail

# Script para unificar @prisma/client/prisma no workspace, gerar client e garantir query engine para Next.js
# Uso: bash ./scripts/fix-prisma-engines.sh [TARGET_VERSION]
# Se TARGET_VERSION não for passado, tenta detectar ou usa 6.17.0 como fallback.

TARGET_VERSION="${1:-}"
FALLBACK_VERSION="6.17.0"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Repo root: $REPO_ROOT"
cd "$REPO_ROOT"

get_version_from_pkg() {
  local pkg_path="$1"
  if [ -f "$pkg_path" ]; then
    if command -v jq >/dev/null 2>&1; then
      jq -r '.dependencies["@prisma/client"] // .devDependencies["@prisma/client"] // empty' "$pkg_path" || true
    else
      node -e "const p=require('$pkg_path'); console.log((p.dependencies && p.dependencies['@prisma/client']) || (p.devDependencies && p.devDependencies['@prisma/client']) || '');" 2>/dev/null || true
    fi
  fi
}

node_module_version() {
  local path="$1"
  if [ -f "$path/package.json" ]; then
    node -e "const p=require('$path/package.json'); console.log(p.version || '');" 2>/dev/null || true
  fi
}

ROOT_PKG="$REPO_ROOT/package.json"
DB_PKG="$REPO_ROOT/packages/db/package.json"
PRISMA_PKG="$REPO_ROOT/packages/prisma/package.json"

ROOT_VER="$(get_version_from_pkg "$ROOT_PKG" || true)"
DB_VER="$(get_version_from_pkg "$DB_PKG" || true)"
PRISMA_VER="$(get_version_from_pkg "$PRISMA_PKG" || true)"

echo "Detected package.json @prisma/client versions:"
echo "  root:    ${ROOT_VER:-<none>}"
echo "  packages/db: ${DB_VER:-<none>}"
echo "  packages/prisma: ${PRISMA_VER:-<none>}"

NODE_ROOT_VER="$(node_module_version "$REPO_ROOT/node_modules/@prisma/client" || true)"
NODE_DB_VER="$(node_module_version "$REPO_ROOT/packages/db/node_modules/@prisma/client" || true)"

echo "Detected installed @prisma/client versions in node_modules:"
echo "  node root: ${NODE_ROOT_VER:-<none>}"
echo "  node packages/db: ${NODE_DB_VER:-<none>}"

if [ -z "$TARGET_VERSION" ]; then
  if [ -n "$NODE_ROOT_VER" ]; then
    TARGET_VERSION="$NODE_ROOT_VER"
  elif [ -n "$NODE_DB_VER" ]; then
    TARGET_VERSION="$NODE_DB_VER"
  elif [ -n "$ROOT_VER" ]; then
    TARGET_VERSION="$ROOT_VER"
  elif [ -n "$DB_VER" ]; then
    TARGET_VERSION="$DB_VER"
  else
    TARGET_VERSION="$FALLBACK_VERSION"
  fi
fi

# remove ^ ~ prefixes
TARGET_VERSION="${TARGET_VERSION#^}"
TARGET_VERSION="${TARGET_VERSION#~}"

echo "Using TARGET_VERSION=${TARGET_VERSION}"

echo "Installing @prisma/client and prisma@${TARGET_VERSION} at workspace root (pnpm workspace)..."
pnpm -w add -W --no-frozen-lockfile "@prisma/client@${TARGET_VERSION}" "prisma@${TARGET_VERSION}" --save-exact

echo "Installing workspace dependencies..."
pnpm install

# gerar cliente prisma (schema principal)
SCHEMA_PATHS=(
  "packages/prisma/schema.prisma"
  "packages/db/schema.prisma"
)

for schema in "${SCHEMA_PATHS[@]}"; do
  if [ -f "$schema" ]; then
    echo "Running prisma generate for schema: $schema"
    pnpm -w exec prisma generate --schema="$schema" || true
  fi
done

echo "Procurando engines geradas em node_modules/.prisma/client..."
ENGINES_FOUND=()
while IFS= read -r -d '' file; do
  ENGINES_FOUND+=("$file")
done < <(find . -type f -path "*/node_modules/.prisma/client/*libquery_engine*.so.node" -print0 2>/dev/null || true)

if [ ${#ENGINES_FOUND[@]} -eq 0 ]; then
  echo "Nenhuma engine encontrada automaticamente. Verifique se prisma generate foi executado corretamente."
else
  echo "Engines encontradas:"
  for e in "${ENGINES_FOUND[@]}"; do
    echo "  $e"
  done
fi

NEXTJS_CLIENT_DIR="$REPO_ROOT/apps/nextjs/node_modules/.prisma/client"
mkdir -p "$NEXTJS_CLIENT_DIR"

COPIED=0
for src in "${ENGINES_FOUND[@]}"; do
  base="$(basename "$src")"
  dest="$NEXTJS_CLIENT_DIR/$base"
  if [ ! -f "$dest" ]; then
    echo "Copiando $src -> $dest"
    cp "$src" "$dest" && COPIED=$((COPIED+1))
  fi
done

if [ $COPIED -gt 0 ]; then
  echo "Copiadas $COPIED engines para $NEXTJS_CLIENT_DIR"
else
  echo "Nenhuma cópia necessária."
fi

echo "Verificando node_modules/.prisma/client presence at packages/db and root..."
for dir in "$REPO_ROOT/node_modules/.prisma/client" "$REPO_ROOT/packages/db/node_modules/.prisma/client" "$NEXTJS_CLIENT_DIR"; do
  if [ -d "$dir" ]; then
    echo "  OK: $dir exists"
  else
    echo "  MISSING: $dir"
  fi
done

echo "Concluído. Se erro persistir, rode manualmente: pnpm -w exec prisma generate --schema=packages/prisma/schema.prisma e verifique se libquery_engine-debian-openssl-3.0.x.so.node está presente em apps/nextjs/node_modules/.prisma/client"
exit 0
