#!/bin/sh
set -eu
cd "$(dirname "$0")"
node tools/verify-mathverse-final.mjs
node --test integration-tests/wonder-park-final-mathml.test.mjs integration-tests/wonder-park-v9-full-bank.test.mjs >/dev/null
DUAL_PORT=4190 node server/host.mjs
