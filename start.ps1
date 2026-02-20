<#
.SYNOPSIS
Start-Skript für das Projekt. Richtet automatisch die .env-Datei ein, falls sie fehlt.
#>

$envFile = ".env"
$envExampleFile = ".env.example"

if (-not (Test-Path $envFile)) {
    Write-Host "Keine .env Datei gefunden. Erstelle eine neue aus $envExampleFile..." -ForegroundColor Yellow
    
    if (-not (Test-Path $envExampleFile)) {
        Write-Host "Fehler: Die Datei $envExampleFile existiert nicht!" -ForegroundColor Red
        exit 1
    }

    Copy-Item $envExampleFile $envFile
    
    # Generate random passwords/keys
    $randomBytes = [byte[]]::new(32)
    [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($randomBytes)
    $postgresPassword = [System.Convert]::ToBase64String($randomBytes) -replace '[^a-zA-Z0-9]', ''
    
    [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($randomBytes)
    $djangoKey = [System.Convert]::ToBase64String($randomBytes) -replace '[^a-zA-Z0-9]', ''

    # Replace values in the newly created .env
    $envContent = Get-Content $envFile
    $envContent = $envContent -replace 'POSTGRES_PASSWORD=.*', "POSTGRES_PASSWORD=$postgresPassword"
    $envContent = $envContent -replace 'SECRET_KEY=.*', "SECRET_KEY='$djangoKey'"
    $envContent | Set-Content $envFile
    
    Write-Host "✅ .env erfolgreich erstellt und mit sicheren Schlüsseln befüllt." -ForegroundColor Green
} else {
    Write-Host ".env Datei existiert bereits. Überspringe Generierung." -ForegroundColor Cyan
}

Write-Host "Starte Docker Container..." -ForegroundColor Cyan
docker compose up -d --build
