#!/usr/bin/env bash
set -euo pipefail

trap 'echo "post-create: failed at line $LINENO (exit $?). See the error above." >&2' ERR

export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"
export NPM_CONFIG_PREFIX="${NPM_CONFIG_PREFIX:-$HOME/.local}"
export PATH="$PNPM_HOME:$HOME/.local/bin:$PATH"

retry() {
  local attempt=0
  local max_attempts=5

  until "$@"; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge "$max_attempts" ]; then
      echo "post-create: command failed after $max_attempts attempts: $*" >&2
      return 1
    fi

    echo "post-create: retry $attempt/$max_attempts in 3s: $*" >&2
    sleep 3
  done
}

append_once() {
  local line="$1"
  local file="$2"

  touch "$file"
  if ! grep -Fqx "$line" "$file"; then
    printf '\n%s\n' "$line" >> "$file"
  fi
}

install_eza() {
  local arch asset temp_dir

  arch="$(uname -m)"
  case "$arch" in
    x86_64)
      asset="eza_x86_64-unknown-linux-gnu.tar.gz"
      ;;
    aarch64 | arm64)
      asset="eza_aarch64-unknown-linux-gnu.tar.gz"
      ;;
    *)
      echo "post-create: unsupported architecture for eza: $arch" >&2
      return 1
      ;;
  esac

  temp_dir="$(mktemp -d)"
  retry curl -fsSL \
    "https://github.com/eza-community/eza/releases/latest/download/$asset" \
    -o "$temp_dir/eza.tar.gz"
  tar -xzf "$temp_dir/eza.tar.gz" -C "$temp_dir"
  sudo install -m 0755 "$temp_dir/eza" /usr/local/bin/eza
  rm -rf "$temp_dir"
}

prepare_claude_state() {
  local state_dir="$HOME/.claude"
  local state_file="$HOME/.claude.json"
  local persisted_state_file="$state_dir/.claude.json"

  mkdir -p "$state_dir"

  if [ -e "$state_file" ] && [ ! -L "$state_file" ]; then
    if [ ! -e "$persisted_state_file" ]; then
      mv "$state_file" "$persisted_state_file"
    else
      mv "$state_file" "$state_file.backup.$(date +%s)"
    fi
  fi

  if [ ! -e "$persisted_state_file" ]; then
    printf '{}\n' > "$persisted_state_file"
  fi

  ln -sfn "$persisted_state_file" "$state_file"
}

install_agent_clis() {
  npm config set prefix "$NPM_CONFIG_PREFIX" --location=user

  retry npm install --global --no-audit --no-fund \
    @openai/codex@latest \
    @anthropic-ai/claude-code@latest \
    opencode-ai@latest

  command -v codex >/dev/null
  command -v claude >/dev/null
  command -v opencode >/dev/null
}

print_tooling_check() {
  local loc tool

  echo "post-create: tooling check ==============================" >&2
  for tool in node npm pnpm git jq curl rg fd bat eza tree tmux fzf htop codex claude opencode; do
    if loc=$(command -v "$tool" 2>/dev/null); then
      printf '  ok   %-10s %s\n' "$tool" "$loc" >&2
    else
      printf '  MISS %-10s (not on PATH)\n' "$tool" >&2
    fi
  done
}

retry sudo apt-get update
retry sudo apt-get install -y --no-install-recommends \
  bat \
  ca-certificates \
  curl \
  fd-find \
  fzf \
  git \
  htop \
  jq \
  ripgrep \
  tmux \
  tree \
  xz-utils

sudo ln -sf /usr/bin/fdfind /usr/local/bin/fd
sudo ln -sf /usr/bin/batcat /usr/local/bin/bat

sudo mkdir -p \
  "$HOME/.cache" \
  "$HOME/.claude" \
  "$HOME/.config/opencode" \
  "$HOME/.codex" \
  "$HOME/.local/bin" \
  "$HOME/.local/share/pnpm/store"

mkdir -p node_modules

sudo chown -R "$(id -u):$(id -g)" \
  "$HOME/.cache" \
  "$HOME/.claude" \
  "$HOME/.config" \
  "$HOME/.codex" \
  "$HOME/.local" \
  node_modules

prepare_claude_state
install_eza

retry sudo corepack enable
retry corepack prepare pnpm@latest --activate

pnpm config set store-dir "$HOME/.local/share/pnpm/store" --location=user

install_agent_clis

if [ ! -f .env.local ] && [ -f .env.example ]; then
  cp .env.example .env.local
fi

retry pnpm install --frozen-lockfile

append_once "alias dev='pnpm run dev'" "$HOME/.bashrc"
append_once "alias build='pnpm run build'" "$HOME/.bashrc"
append_once "alias lint='pnpm run lint'" "$HOME/.bashrc"
append_once "alias typecheck='pnpm run typecheck'" "$HOME/.bashrc"
append_once "alias ls='eza --icons --group-directories-first'" "$HOME/.bashrc"
append_once "alias ll='eza -lah --icons --group-directories-first'" "$HOME/.bashrc"
append_once 'export PATH="$HOME/.local/share/pnpm:$HOME/.local/bin:$PATH"' "$HOME/.bashrc"

if [ -f .devcontainer/post-create.local.sh ]; then
  bash .devcontainer/post-create.local.sh
else
  echo "post-create: no local hook found at .devcontainer/post-create.local.sh"
fi

print_tooling_check
