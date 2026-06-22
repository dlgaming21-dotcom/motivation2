# airtable-setup.ps1 -- Crea le 5 tabelle TravelAgencyDB via Airtable Metadata API
# Uso: .\scripts\airtable-setup.ps1
# Prerequisiti: AIRTABLE_API_KEY e AIRTABLE_BASE_ID in .env

$envFile = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
        }
    }
}

$apiKey = $env:AIRTABLE_API_KEY
$baseId = $env:AIRTABLE_BASE_ID

if (-not $apiKey -or -not $baseId) {
    Write-Error "AIRTABLE_API_KEY o AIRTABLE_BASE_ID non trovati in .env"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
}

$url = "https://api.airtable.com/v0/meta/bases/$baseId/tables"

function New-AirtableTable {
    param($name, $fields)
    $body = @{ name = $name; fields = $fields } | ConvertTo-Json -Depth 10
    try {
        $resp = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
        Write-Host "OK  $name"
        return $resp.id
    } catch {
        $msg = $_.ErrorDetails.Message
        if ($msg -match "DUPLICATE_TABLE_NAME") {
            Write-Host "SKP $name (gia esistente)"
        } else {
            Write-Host "ERR $name -- $msg"
        }
        return $null
    }
}

Write-Host ""
Write-Host "=== Creazione tabelle TravelAgencyDB ==="
Write-Host ""

New-AirtableTable "Clients" @(
    @{ name = "Name";                   type = "singleLineText" }
    @{ name = "Email";                  type = "email" }
    @{ name = "Phone";                  type = "phoneNumber" }
    @{ name = "Tier";                   type = "singleSelect"; options = @{ choices = @(
        @{ name = "economy" }
        @{ name = "standard" }
        @{ name = "luxury" }
        @{ name = "ultra-luxury" }
    )}}
    @{ name = "Preferred Destinations"; type = "multipleSelects"; options = @{ choices = @(
        @{ name = "Roma" }
        @{ name = "Toscana" }
        @{ name = "Costiera Amalfitana" }
        @{ name = "Venezia" }
        @{ name = "Sicilia" }
        @{ name = "Portofino" }
        @{ name = "Lago di Como" }
        @{ name = "Puglia" }
        @{ name = "Sardegna" }
    )}}
    @{ name = "Notes"; type = "multilineText" }
)

New-AirtableTable "Suppliers" @(
    @{ name = "Name";              type = "singleLineText" }
    @{ name = "Region";            type = "singleLineText" }
    @{ name = "Category";          type = "singleSelect"; options = @{ choices = @(
        @{ name = "hotel" }
        @{ name = "DMC" }
        @{ name = "transfer" }
        @{ name = "experiences" }
        @{ name = "restaurant" }
        @{ name = "guide" }
    )}}
    @{ name = "Contact";           type = "email" }
    @{ name = "Phone";             type = "phoneNumber" }
    @{ name = "Contract Validity"; type = "date"; options = @{ dateFormat = @{ name = "iso" } } }
    @{ name = "Notes";             type = "multilineText" }
)

New-AirtableTable "Properties" @(
    @{ name = "Name";     type = "singleLineText" }
    @{ name = "Country";  type = "singleLineText" }
    @{ name = "Region";   type = "singleLineText" }
    @{ name = "Category"; type = "singleSelect"; options = @{ choices = @(
        @{ name = "hotel" }
        @{ name = "resort" }
        @{ name = "villa" }
        @{ name = "cruise" }
        @{ name = "lodge" }
        @{ name = "restaurant" }
    )}}
    @{ name = "Rating";   type = "number"; options = @{ precision = 1 } }
    @{ name = "Website";  type = "url" }
    @{ name = "Notes";    type = "multilineText" }
)

New-AirtableTable "Bookings" @(
    @{ name = "Title";        type = "singleLineText" }
    @{ name = "Destination";  type = "singleLineText" }
    @{ name = "Travel Start"; type = "date"; options = @{ dateFormat = @{ name = "iso" } } }
    @{ name = "Travel End";   type = "date"; options = @{ dateFormat = @{ name = "iso" } } }
    @{ name = "PAX";          type = "number"; options = @{ precision = 0 } }
    @{ name = "Value (EUR)";  type = "currency"; options = @{ precision = 2; symbol = "EUR" } }
    @{ name = "Status";       type = "singleSelect"; options = @{ choices = @(
        @{ name = "pending" }
        @{ name = "confirmed" }
        @{ name = "completed" }
        @{ name = "cancelled" }
    )}}
    @{ name = "Agency";  type = "singleLineText" }
    @{ name = "Notes";   type = "multilineText" }
)

New-AirtableTable "Invoices" @(
    @{ name = "Invoice Number"; type = "singleLineText" }
    @{ name = "Amount (EUR)";   type = "currency"; options = @{ precision = 2; symbol = "EUR" } }
    @{ name = "Invoice Date";   type = "date"; options = @{ dateFormat = @{ name = "iso" } } }
    @{ name = "Due Date";       type = "date"; options = @{ dateFormat = @{ name = "iso" } } }
    @{ name = "Status";         type = "singleSelect"; options = @{ choices = @(
        @{ name = "pending" }
        @{ name = "paid" }
        @{ name = "overdue" }
    )}}
    @{ name = "Notes"; type = "multilineText" }
)

Write-Host ""
Write-Host "=== Fatto ==="
Write-Host "Apri airtable.com per aggiungere le relazioni tra tabelle."
