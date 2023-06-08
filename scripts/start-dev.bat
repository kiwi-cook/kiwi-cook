@echo off

REM Start backend
cd backend
start "" /B cmd /c "go run . serve -m dev"

REM Start frontend
cd ../frontend
start "" /B cmd /c "npm run serve"