// Spark & Scale Registration Form JavaScript
class RegistrationForm {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 4;
        this.formData = {};
        this.registeredData = []; // To store existing registrations

        this.initializeElements();
        this.attachEventListeners();
        this.fetchRegisteredData(); // Fetch data when the form loads
        this.updateProgress();
        this.showPage(this.currentPage);
    }

    initializeElements() {
        this.form = document.getElementById('registrationForm');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.progressFill = document.querySelector('.progress-fill');
        this.formPagesContainer = document.getElementById('form-pages-container');
        this.currentPageSpan = document.getElementById('currentPage');
        this.topicsCount = document.getElementById('topics-counter');
        this.successPage = document.getElementById('successPage');
        this.formNavigation = document.querySelector('.form-navigation');
        this.qrcodeElement = document.getElementById('qrcode');

        this.pages = [
            document.getElementById('page1'),
            document.getElementById('page2'),
            document.getElementById('page3'),
            document.getElementById('page4')
        ];
    }

    attachEventListeners() {
        this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextPage();
        });

        this.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.prevPage();
        });

        this.submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        const topicsCheckboxes = document.querySelectorAll('input[name=\"topics\"]');
        topicsCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateTopicsCounter());
        });

        this.form.addEventListener('input', (e) => this.clearError(e.target));
        this.form.addEventListener('change', (e) => this.clearError(e.target));

        this.form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
    }

    async fetchRegisteredData() {
        const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTYa0Jiz3KZjKJO0d9hE-oLyS1A5DLV1zpVCTx0CtaemuobzcQsm1noMqMH1xfNPSb0IpZCRgR8hiDu/pub?output=csv';

        try {
            const response = await fetch(GOOGLE_SHEET_CSV_URL);
            if (!response.ok) {
                console.error('Failed to fetch registration data.');
                return;
            }
            const csvText = await response.text();
            // Assuming header row, then data. Email in col B (index 1), Phone in col C (index 2)
            const rows = csvText.split('\\n').slice(1); 
            this.registeredData = rows.map(row => {
                const columns = row.split(',').map(col => col.trim().replace(/^\"|\"$/g, ''));
                return {
                    email: columns[1], // Email from the second column
                    phone: columns[2]  // Phone from the third column
                };
            }).filter(row => row.email && row.phone); // Filter out empty rows

        } catch (error) {
            console.error('Error fetching or parsing registration data:', error);
        }
    }

    updateProgress() {
        const progress = (this.currentPage / this.totalPages) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.currentPageSpan.textContent = this.currentPage;
    }

    showPage(pageNumber) {
        this.pages.forEach(page => page.style.display = 'none');
        this.pages[pageNumber - 1].style.display = 'block';

        this.prevBtn.style.display = pageNumber === 1 ? 'none' : 'inline-flex';
        this.nextBtn.style.display = pageNumber === this.totalPages ? 'none' : 'inline-flex';
        this.submitBtn.style.display = pageNumber === this.totalPages ? 'inline-flex' : 'none';

        this.updateProgress();
    }

    nextPage() {
        if (this.validateCurrentPage()) {
            this.saveCurrentPageData();
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.showPage(this.currentPage);
            }
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.showPage(this.currentPage);
        }
    }

    validateCurrentPage() {
        this.clearAllErrors();
        switch (this.currentPage) {
            case 1: return this.validatePage1();
            case 2: return this.validatePage2();
            case 3: return this.validatePage3();
            case 4: return this.validatePage4();
            default: return false;
        }
    }

    validatePage1() {
        let isValid = true;
        const fullName = this.form.querySelector('#fullName');
        const emailInput = this.form.querySelector('#email');
        const whatsappInput = this.form.querySelector('#whatsapp');
        const status = this.form.querySelector('input[name=\"status\"]:checked');

        // --- Duplicate Check ---
        const email = emailInput.value.trim();
        const phone = whatsappInput.value.trim();

        if (this.registeredData.some(row => row.email === email)) {
            this.showError('email', 'This email address is already registered.');
            isValid = false;
        }
        if (this.registeredData.some(row => row.phone === phone)) {
            this.showError('whatsapp', 'This phone number is already registered.');
            isValid = false;
        }
        
        // --- Standard Validation ---
        if (!fullName.value.trim()) {
            this.showError('fullName', 'Please enter your full name');
            isValid = false;
        }
        if (!email) {
            this.showError('email', 'Please enter your email address');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        if (!phone) {
            this.showError('whatsapp', 'Please enter your WhatsApp number');
            isValid = false;
        }
        if (!status) {
            this.showError('status', 'Please select your current status');
            isValid = false;
        }
        return isValid;
    }

    validatePage2() {
        let isValid = true;
        if (!this.form.querySelector('input[name=\"journey\"]:checked')) {
            this.showError('journey', 'Please select your journey stage');
            isValid = false;
        }
        if (!this.form.querySelector('#hurdle').value.trim()) {
            this.showError('hurdle', 'Please share your biggest hurdle');
            isValid = false;
        }
        return isValid;
    }

    validatePage3() {
        let isValid = true;
        if (this.form.querySelectorAll('input[name=\"topics\"]:checked').length !== 3) {
            this.showError('topics', 'Please select exactly 3 topics');
            isValid = false;
        }
        if (!this.form.querySelector('input[name=\"goal\"]:checked')) {
            this.showError('goal', 'Please select your primary goal');
            isValid = false;
        }
        return isValid;
    }

    validatePage4() {
        let isValid = true;
        if (!this.form.querySelector('input[name=\"referral\"]:checked')) {
            this.showError('referral', 'Please tell us how you found out about us');
            isValid = false;
        }
        if (!this.form.querySelector('input[name=\"whatsappGroup\"]:checked')) {
            this.showError('whatsappGroup', 'Please confirm about the WhatsApp group');
            isValid = false;
        }
        return isValid;
    }

    submitForm() {
        if (this.validateCurrentPage()) {
            this.saveCurrentPageData();
            const formData = new FormData(this.form);
            fetch(this.form.action, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            }).catch(error => console.error('Error during form submission:', error));
            this.showSuccessPage();
        }
    }

    showSuccessPage() {
        this.formPagesContainer.style.display = 'none';
        this.successPage.classList.remove('hidden');
        this.formNavigation.style.display = 'none';
        document.querySelector('.progress-container').style.display = 'none';

        // Ensure QR code element exists
        if (!this.qrcodeElement) {
            console.error('QR code container not found');
            return;
        }

        // Clear any existing QR code
        this.qrcodeElement.innerHTML = '';
        
        // Get user data
        const name = this.form.querySelector('#fullName').value;
        const email = this.form.querySelector('#email').value;
        
        if (name && email) {
            const qrText = `Welcome to Beyond Guidance! Name: ${name}, Email: ${email}`;
            try {
                new QRCode(this.qrcodeElement, {
                    text: qrText,
                    width: 180,
                    height: 180,
                });
            } catch (error) {
                console.error('Error generating QR code:', error);
                this.qrcodeElement.innerHTML = '<p>Error generating QR code. Please save this page for reference.</p>';
            }
        } else {
            console.error('Name or email not found in form data.');
            this.qrcodeElement.innerHTML = '<p>Error: Registration information incomplete.</p>';
        }
    }

    // --- Helper Methods ---
    saveCurrentPageData() {
        const inputs = this.pages[this.currentPage - 1].querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (!this.formData[input.name]) this.formData[input.name] = [];
                if (input.checked) {
                    if (!this.formData[input.name].includes(input.value)) {
                        this.formData[input.name].push(input.value);
                    }
                } else {
                    const index = this.formData[input.name].indexOf(input.value);
                    if (index > -1) this.formData[input.name].splice(index, 1);
                }
            } else if (input.type === 'radio') {
                if (input.checked) this.formData[input.name] = input.value;
            } else {
                this.formData[input.name] = input.value;
            }
        });
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearError(field) {
        const fieldName = field.name || field.id;
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    clearAllErrors() {
        this.form.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    }

    updateTopicsCounter() {
        const selected = this.form.querySelectorAll('input[name=\"topics\"]:checked').length;
        if (this.topicsCount) this.topicsCount.textContent = selected;
        const allTopics = this.form.querySelectorAll('input[name=\"topics\"]');
        allTopics.forEach(checkbox => {
            checkbox.disabled = !checkbox.checked && selected >= 3;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RegistrationForm();
});