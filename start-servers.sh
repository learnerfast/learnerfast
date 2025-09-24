#!/bin/bash

echo "Starting Dashboard server (port 5173)..."
npm run dev &

echo "Starting Next.js landing page (port 3000)..."
cd "softec-next-js 2" && npm run dev &

echo "Both servers are starting..."
echo "Landing page: http://localhost:3000"
echo "Dashboard: http://localhost:3000/dashboard (after login)"

wait