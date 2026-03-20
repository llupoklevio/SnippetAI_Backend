#!/bin/sh
npm run migration:generate:prod
node dist/server.js