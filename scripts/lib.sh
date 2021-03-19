#!/bin/bash
# Module containing code shared across various shell scripts
# Execute functions from this module via the script do.sh

alias pip="python -m pip --disable-pip-version-check"

# Check if a command is available
require() {
    command -v "$1" >/dev/null 2>&1
}

query_big_sur() {
    if require sw_vers && sw_vers -productVersion | grep -E "11\." > /dev/null; then
        return 0
    fi
    return 1
}

ensure-venv() {
    eval "${HERE}/ensure-venv.sh"
}

upgrade-pip() {
    # pip versions before 20.1 do not have `pip cache` as a command which is necessary for the CI
    pip install --no-cache-dir --upgrade "pip>=20.1"
    # The Python version installed via pyenv does not come with wheel pre-installed
    # Installing wheel will speed up installation of Python dependencies
    require wheel || pip install wheel
}

install-py-dev() {
    ensure-venv
    upgrade-pip
    # It places us within top src dir to be at the same path as setup.py
    # This helps when getsentry calls into this script
    cd "${HERE}/.." || exit
    echo "--> Installing Sentry (for development)"
    # In Big Sur, versions of pip before 20.3 require SYSTEM_VERSION_COMPAT set
    if query_big_sur && python -c 'from sys import exit; import pip; from pip._vendor.packaging.version import parse; exit(1 if parse(pip.__version__) < parse("20.3") else 0)'; then
        SENTRY_LIGHT_BUILD=1 SYSTEM_VERSION_COMPAT=1 pip install -e '.[dev]'
    else
        # SENTRY_LIGHT_BUILD=1 disables webpacking during setup.py.
        # Webpacked assets are only necessary for devserver (which does it lazily anyways)
        # and acceptance tests, which webpack automatically if run.
        SENTRY_LIGHT_BUILD=1 pip install -e '.[dev]'
    fi
}

setup-git-config() {
    git config --local branch.autosetuprebase always
    git config --local core.ignorecase false
    git config --local blame.ignoreRevsFile .git-blame-ignore-revs
}

setup-git() {
    echo "--> Installing git hooks"
    mkdir -p .git/hooks && cd .git/hooks && ln -sf ../../config/hooks/* ./ && cd - || exit
    # shellcheck disable=SC2016
    python3 -c '' || (echo 'Please run `make setup-pyenv` to install the required Python 3 version.'; exit 1)
    pip install -r requirements-pre-commit.txt
    pre-commit install --install-hooks
    echo ""
}

install-js-dev() {
    echo "--> Installing Yarn packages (for development)"
    # Use NODE_ENV=development so that yarn installs both dependencies + devDependencies
    NODE_ENV=development yarn install --frozen-lockfile
    # A common problem is with node packages not existing in `node_modules` even though `yarn install`
    # says everything is up to date. Even though `yarn install` is run already, it doesn't take into
    # account the state of the current filesystem (it only checks .yarn-integrity).
    # Add an additional check against `node_modules`
    yarn check --verify-tree || yarn install --check-files
}

init-config() {
    sentry init --dev
}

run-dependent-services() {
    sentry devservices up
}

create-db() {
    local CREATEDB
    CREATEDB=$(command -v createdb 2> /dev/null)
    if [ -z "${CREATEDB:+}" ]; then
        # This command works when sentry devservices have first been started
        CREATEDB=$(docker exec sentry_postgres createdb)
    fi
    echo "--> Creating 'sentry' database"
    "$CREATEDB" -h 127.0.0.1 -U postgres -E utf-8 sentry || true
}

apply-migrations() {
    echo "--> Applying migrations"
    sentry upgrade
}

build-platform-assets() {
    echo "--> Building platform assets"
    echo "from sentry.utils.integrationdocs import sync_docs; sync_docs(quiet=True)" | sentry exec
}
