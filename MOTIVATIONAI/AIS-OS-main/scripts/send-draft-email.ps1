# send-draft-email.ps1 -- Invia una bozza email via Gmail SMTP
# Uso normale:  .\scripts\send-draft-email.ps1 -DraftFile "templates/supplier-requests/.../file.txt"
# Uso test:     .\scripts\send-draft-email.ps1 -DraftFile "..." -TestMode
#
# Prerequisiti: GMAIL_ADDRESS e GMAIL_APP_PASSWORD in .env
# Per generare l'app password: Google Account → Sicurezza → Password per le app

param(
    [Parameter(Mandatory)][string]$DraftFile,
    [switch]$TestMode
)

$TEST_ADDRESS = "davidelamanna1109@gmail.com"

# Carica .env
$envPath = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envPath) {
    Get-Content $envPath | Where-Object { $_ -match '^\s*([^#][^=]+)=(.+)$' } | ForEach-Object {
        [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim())
    }
}

$gmailAddress  = $env:GMAIL_ADDRESS
$gmailPassword = $env:GMAIL_APP_PASSWORD

if (-not $gmailAddress -or -not $gmailPassword) {
    Write-Error @"
GMAIL_ADDRESS o GMAIL_APP_PASSWORD non trovati in .env.

Per abilitare l'invio:
1. Vai su myaccount.google.com → Sicurezza → Password per le app
2. Crea una password per "Motivation AIOS"
3. Aggiungi al .env:
   GMAIL_ADDRESS=tuamail@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
"@
    exit 1
}

# Leggi e parsa la bozza
if (-not (Test-Path $DraftFile)) {
    Write-Error "File non trovato: $DraftFile"
    exit 1
}

$content = Get-Content $DraftFile -Raw
$lines   = $content -split "`n"

$toLine      = ($lines | Where-Object { $_ -match '^TO:\s*(.+)' } | Select-Object -First 1)
$subjectLine = ($lines | Where-Object { $_ -match '^SUBJECT:\s*(.+)' } | Select-Object -First 1)

if ($toLine -match '^TO:\s*(.+)') { $originalTo = $Matches[1].Trim() }
if ($subjectLine -match '^SUBJECT:\s*(.+)') { $subject = $Matches[1].Trim() }

# Corpo: tutto dopo il separatore ---
$bodyStart = $content.IndexOf("---`n")
if ($bodyStart -ge 0) {
    $body = $content.Substring($bodyStart + 4).Trim()
} else {
    $body = $content
}

# Destinatario
if ($TestMode) {
    $to = $TEST_ADDRESS
    Write-Host "[TEST MODE] Email inviata a $TEST_ADDRESS (originale: $originalTo)"
} else {
    if ($originalTo -match '\[CONTATTO DA VERIFICARE\]') {
        Write-Error "Il campo TO contiene '[CONTATTO DA VERIFICARE]'. Aggiorna il file con l'email reale prima di inviare."
        exit 1
    }
    $to = $originalTo
}

# Invio via Gmail SMTP
try {
    $smtpClient = New-Object Net.Mail.SmtpClient("smtp.gmail.com", 587)
    $smtpClient.EnableSsl   = $true
    $smtpClient.Credentials = New-Object Net.NetworkCredential($gmailAddress, $gmailPassword)

    $msg           = New-Object Net.Mail.MailMessage
    $msg.From      = $gmailAddress
    $msg.To.Add($to)
    $msg.Subject   = $subject
    $msg.Body      = $body
    $msg.IsBodyHtml = $false

    $smtpClient.Send($msg)

    Write-Host "OK  Email inviata → $to"
    Write-Host "    Oggetto: $subject"
} catch {
    Write-Error "Errore invio: $($_.Exception.Message)"
    exit 1
}
