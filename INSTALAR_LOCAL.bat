@echo off
setlocal
set "NODE_BIN=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
set "NODE_EXE=%NODE_BIN%\node.exe"
set "PNPM_CLI=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.cjs"
if not exist "%NODE_EXE%" (
  echo Runtime local nao encontrado. Nenhuma instalacao administrativa sera tentada.
  pause
  exit /b 1
)
set "PATH=%NODE_BIN%;%PATH%"
"%NODE_EXE%" "%PNPM_CLI%" install --config.manage-package-manager-versions=false
"%NODE_EXE%" "%PNPM_CLI%" rebuild sharp unrs-resolver puppeteer
pause
endlocal
