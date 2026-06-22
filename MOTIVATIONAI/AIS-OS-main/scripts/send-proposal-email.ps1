# send-proposal-email.ps1 -- Invia la cover email con proposta PDF allegata
#
# Uso normale:  .\scripts\send-proposal-email.ps1 -To "agency@example.com" -AgencyName "Smith Travel" -TravelerName "The Smith Family" -Destination "Amalfi · Rome · Venice" -TravelDates "Sept 12–20, 2026" -PdfPath "templates/proposals/proposal-smith-2026.pdf"
# Uso test:     aggiungi -TestMode  (manda a GMAIL_ADDRESS invece del destinatario reale)
#
# Prerequisiti: GMAIL_ADDRESS e GMAIL_APP_PASSWORD in .env

param(
    [Parameter(Mandatory)][string]$To,
    [Parameter(Mandatory)][string]$AgencyName,
    [Parameter(Mandatory)][string]$TravelerName,
    [Parameter(Mandatory)][string]$Destination,
    [Parameter(Mandatory)][string]$TravelDates,
    [Parameter(Mandatory)][string]$PdfPath,
    [string]$SenderName = "Davide Lamanna",
    [switch]$TestMode
)

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
    Write-Error "GMAIL_ADDRESS o GMAIL_APP_PASSWORD non trovati in .env."
    exit 1
}

# PDF
$resolvedPdf = $PdfPath
if (-not [System.IO.Path]::IsPathRooted($PdfPath)) {
    $resolvedPdf = Join-Path (Split-Path $PSScriptRoot) $PdfPath
}
if (-not (Test-Path $resolvedPdf)) {
    Write-Error "PDF non trovato: $resolvedPdf"
    exit 1
}

# Template HTML
$templatePath = Join-Path (Split-Path $PSScriptRoot) "templates\email-proposal-cover.html"
if (-not (Test-Path $templatePath)) {
    Write-Error "Template non trovato: $templatePath"
    exit 1
}

$htmlBody = Get-Content $templatePath -Raw -Encoding UTF8
$htmlBody = $htmlBody -replace '\{\{AGENCY_NAME\}\}',   $AgencyName
$htmlBody = $htmlBody -replace '\{\{TRAVELER_NAME\}\}', $TravelerName
$htmlBody = $htmlBody -replace '\{\{DESTINATION\}\}',   $Destination
$htmlBody = $htmlBody -replace '\{\{TRAVEL_DATES\}\}',  $TravelDates
$htmlBody = $htmlBody -replace '\{\{SENDER_NAME\}\}',   $SenderName

# Destinatario
$recipient = if ($TestMode) { $gmailAddress } else { $To }
if ($TestMode) {
    Write-Host "[TEST MODE] Invio a $gmailAddress (originale: $To)"
}

$subject = "Travel Proposal: $Destination | Re: $TravelerName"
$pdfName = [System.IO.Path]::GetFileName($resolvedPdf)

# Invio
try {
    $smtp = New-Object Net.Mail.SmtpClient("smtp.gmail.com", 587)
    $smtp.EnableSsl   = $true
    $smtp.Credentials = New-Object Net.NetworkCredential($gmailAddress, $gmailPassword)

    $msg            = New-Object Net.Mail.MailMessage
    $msg.From       = $gmailAddress
    $msg.To.Add($recipient)
    $msg.Subject    = $subject
    $msg.Body       = $htmlBody
    $msg.IsBodyHtml = $true

    $att = New-Object Net.Mail.Attachment($resolvedPdf)
    $att.Name = $pdfName
    $msg.Attachments.Add($att)

    $smtp.Send($msg)
    $att.Dispose()

    Write-Host "OK  Email inviata → $recipient"
    Write-Host "    Oggetto:  $subject"
    Write-Host "    Allegato: $pdfName"
} catch {
    Write-Host "ERRORE: $($_.Exception.Message)"
    exit 1
}
