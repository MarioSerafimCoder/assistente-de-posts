@echo off
setlocal
set "NODE_BIN=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
set "NODE_EXE=%NODE_BIN%\node.exe"
set "PNPM_CLI=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.cjs"
if not exist "%NODE_EXE%" (
  echo Runtime local nao encontrado. Abra este projeto no Codex e execute a preparacao novamente.
  pause
  exit /b 1
)
set "PATH=%NODE_BIN%;%PATH%"
start "" http://localhost:3000/create
"%NODE_EXE%" "%PNPM_CLI%" dev
endlocal
