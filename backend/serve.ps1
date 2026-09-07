# Arranca la API con un PHP >= 8.4 (el proyecto lo exige: vendor/composer/platform_check.php).
# Uso:  pwsh ./serve.ps1            -> solo el servidor en :8001
#       pwsh ./serve.ps1 -Full     -> servidor + queue + pail + vite (equivalente a "composer run dev")
param([switch]$Full, [int]$Port = 8001)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Get-Php84 {
  $candidates = @()
  $cmd = Get-Command php -ErrorAction SilentlyContinue
  if ($cmd) { $candidates += $cmd.Source }
  $candidates += Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\PHP.PHP.*\php.exe" -ErrorAction SilentlyContinue | ForEach-Object FullName
  $candidates += @("C:\php\php.exe", "C:\Program Files\php\php.exe", "C:\tools\php\php.exe")
  foreach ($p in $candidates | Select-Object -Unique) {
    if ($p -and (Test-Path $p)) {
      $v = & $p -r "echo PHP_VERSION_ID;" 2>$null
      if ($v -and [int]$v -ge 80400) { return $p }
    }
  }
  return $null
}

$php = Get-Php84
if (-not $php) {
  Write-Error "No se encontro PHP >= 8.4. Instala uno (winget install PHP.PHP.8.4) o ajusta el PATH."
  exit 1
}
Write-Host "PHP: $php ($(& $php -r 'echo PHP_VERSION;'))" -ForegroundColor Green

if ($Full) {
  $dir = Split-Path $php
  $env:PATH = "$dir;$env:PATH"   # que 'php' dentro de concurrently tambien sea 8.4
  npx concurrently -c "#93c5fd,#c4b5fd,#fb7185" `
    "`"$php`" artisan serve --host=127.0.0.1 --port=$Port" `
    "`"$php`" artisan queue:listen --tries=1 --timeout=0" `
    "`"$php`" artisan pail --timeout=0" `
    --names=server,queue,logs --kill-others
} else {
  & $php artisan serve --host=127.0.0.1 --port=$Port
}
