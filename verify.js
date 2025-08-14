document.addEventListener('DOMContentLoaded', () => {
    // --- IMPORTANT --- 
    // 1. Open your Google Sheet.
    // 2. Go to File > Share > Publish to web.
    // 3. In the dialog, select the sheet with your registration data.
    // 4. Select 'Comma-separated values (.csv)' as the format.
    // 5. Click 'Publish'.
    // 6. Copy the generated URL and paste it below, replacing the placeholder.
    const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTYa0Jiz3KZjKJO0d9hE-oLyS1A5DLV1zpVCTx0CtaemuobzcQsm1noMqMH1xfNPSb0IpZCRgR8hiDu/pubhtml';

    const resultElement = document.getElementById('qr-reader-results');
    let registeredEmails = new Set();

    // Fetch and store registered emails
    async function fetchRegisteredEmails() {
        if (GOOGLE_SHEET_CSV_URL === 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTYa0Jiz3KZjKJO0d9hE-oLyS1A5DLV1zpVCTx0CtaemuobzcQsm1noMqMH1xfNPSb0IpZCRgR8hiDu/pubhtml') {
            resultElement.textContent = 'Error: Please configure the Google Sheet URL in verify.js';
            resultElement.className = 'error';
            return;
        }

        try {
            const response = await fetch(GOOGLE_SHEET_CSV_URL);
            const csvText = await response.text();
            const rows = csvText.split('\n').map(row => row.trim());
            
            // Assuming 'Email Address' is a column. Find its index.
            const headers = rows[0].split(',').map(h => h.trim());
            const emailColumnIndex = headers.findIndex(header => header.toLowerCase().includes('email'));

            if (emailColumnIndex === -1) {
                throw new Error('Could not find an Email column in the Google Sheet.');
            }

            // Start from row 1 to skip header
            for (let i = 1; i < rows.length; i++) {
                const columns = rows[i].split(',');
                if (columns[emailColumnIndex]) {
                    registeredEmails.add(columns[emailColumnIndex].trim().toLowerCase());
                }
            }
            console.log(`Loaded ${registeredEmails.size} registered emails.`);
        } catch (error) {
            console.error('Failed to load registered emails:', error);
            resultElement.textContent = 'Error loading registration data.';
            resultElement.className = 'error';
        }
    }

    // QR Code Scanner Success Callback
    function onScanSuccess(decodedText, decodedResult) {
        const scannedEmail = decodedText.trim().toLowerCase();
        console.log(`Scanned QR Code: ${scannedEmail}`);

        if (registeredEmails.has(scannedEmail)) {
            resultElement.textContent = `✅ Verified: ${decodedText}`;
            resultElement.className = 'success';
        } else {
            resultElement.textContent = `❌ Not Registered: ${decodedText}`;
            resultElement.className = 'error';
        }

        // Optional: Stop scanning after a successful scan
        // html5QrcodeScanner.clear();
    }

    // QR Code Scanner Error Callback
    function onScanFailure(error) {
        // This function is called frequently, so keep it clean.
        // console.warn(`Code scan error = ${error}`);
    }

    // Initialize and start the scanner
    async function startScanner() {
        await fetchRegisteredEmails();
        const html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader", 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false);
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }

    startScanner();
});
