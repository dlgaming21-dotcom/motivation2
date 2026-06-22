# ragie-retrieve.ps1 — Chiama la Ragie API senza Node.js / MCP
# Uso: .\ragie-retrieve.ps1 -Query "Cosa ha richiesto il cliente Rossi?"
#      .\ragie-retrieve.ps1 -Query "hotel Maldive 2023" -TopK 8
#      .\ragie-retrieve.ps1 -Action list

param(
    [string]$Query      = "",
    [int]   $TopK       = 4,
    [bool]  $Rerank     = $true,
    [string]$Partition  = "default",
    [string]$Action     = "retrieve"   # retrieve | list
)

# Carica la chiave dal .env nella stessa cartella padre
$envPath = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envPath) {
    Get-Content $envPath | Where-Object { $_ -match '^\s*RAGIE_API_KEY\s*=\s*(.+)' } | ForEach-Object {
        $env:RAGIE_API_KEY = $Matches[1].Trim()
    }
}

if (-not $env:RAGIE_API_KEY) {
    Write-Error "RAGIE_API_KEY non trovata. Controlla il file .env"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $env:RAGIE_API_KEY"
    "Content-Type"  = "application/json"
}

# --- LIST DOCUMENTS ---
if ($Action -eq "list") {
    $url = "https://api.ragie.ai/documents?partition=$Partition"
    try {
        $res = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
        $res | ConvertTo-Json -Depth 5
    } catch {
        Write-Error "Errore API: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            Write-Error $reader.ReadToEnd()
        }
    }
    exit
}

# --- RETRIEVE (semantic search) ---
if (-not $Query) {
    Write-Error "Specifica -Query oppure -Action list"
    exit 1
}

$body = @{
    query     = $Query
    top_k     = $TopK
    rerank    = $Rerank
    partition = $Partition
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "https://api.ragie.ai/retrievals" -Method POST -Headers $headers -Body $body
    $res | ConvertTo-Json -Depth 10
} catch {
    Write-Error "Errore API: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Error $reader.ReadToEnd()
    }
}
