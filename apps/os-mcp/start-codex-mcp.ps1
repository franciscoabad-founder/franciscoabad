$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envFile = Join-Path $repoRoot 'apps\web\.env'

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "No se encontro el archivo de entorno del OS: $envFile"
}

$tokenLine = Get-Content -LiteralPath $envFile | Where-Object { $_ -match '^OS_API_TOKEN=' } | Select-Object -Last 1
if (-not $tokenLine) {
  throw 'OS_API_TOKEN no esta configurado en apps/web/.env.'
}

$env:OS_API_URL = 'https://www.franciscoabad.com'
$env:OS_API_TOKEN = $tokenLine.Substring('OS_API_TOKEN='.Length).Trim('"').Trim("'")

& node (Join-Path $PSScriptRoot 'dist\index.js')
