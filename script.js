// Data for dynamic content - Easy to modify
const servicesData = [
    {
        icon: 'fas fa-calendar-check',
        title: 'Instant Booking',
        description: 'Book appointments with top doctors in just a few clicks. Choose your preferred time and date.',
        features: ['Real-time availability', 'Instant confirmation', 'Easy rescheduling']
    },
    {
        icon: 'fas fa-video',
        title: 'Online Consultation',
        description: 'Connect with doctors virtually from the comfort of your home. No travel required.',
        features: ['HD video calls', 'Secure platform', 'Prescription delivery']
    },
    {
        icon: 'fas fa-user-friends',
        title: 'Doctor Recommendations',
        description: 'Get personalized doctor recommendations based on your symptoms and medical history.',
        features: ['AI-powered matching', 'Verified reviews', 'Specialty-based search']
    }
];

const statsData = [
    { icon: 'fas fa-clock', value: '15 min', label: 'Average wait time' },
    { icon: 'fas fa-shield-alt', value: '100%', label: 'Secure platform' },
    { icon: 'fas fa-smile', value: '98%', label: 'Patient satisfaction' }
];

const doctorsData = [
    {
        image: 'images/doctor1.jpg',
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        rating: 4.9,
        reviews: 127,
        experience: '15+ years',
        location: 'New York, NY',
        availability: 'Today 2:30 PM'
    },
    {
        image: 'images/doctor2.jpg',
        name: 'Dr. Michael Chen',
        specialty: 'Neurologist',
        rating: 4.8,
        reviews: 89,
        experience: '12+ years',
        location: 'Los Angeles, CA',
        availability: 'Tomorrow 10:00 AM'
    },
    {
        image: 'images/doctor3.jpg',
        name: 'Dr. Emily Rodriguez',
        specialty: 'Pediatrician',
        rating: 4.9,
        reviews: 203,
        experience: '18+ years',
        location: 'Chicago, IL',
        availability: 'Today 4:15 PM'
    },
    {
        image: 'images/doctor4.jpg',
        name: 'Dr. David Thompson',
        specialty: 'Orthopedic Surgeon',
        rating: 4.7,
        reviews: 156,
        experience: '20+ years',
        location: 'Houston, TX',
        availability: 'Monday 9:00 AM'
    }
];

const stepsData = [
    {
        icon: 'fas fa-search',
        number: '01',
        title: 'Search & Find',
        description: 'Browse through our extensive network of verified doctors and specialists. Use filters to find the perfect match for your needs.'
    },
    {
        icon: 'fas fa-calendar-check',
        number: '02',
        title: 'Book Appointment',
        description: 'Choose your preferred date and time from available slots. Get instant confirmation and calendar reminders.'
    },
    {
        icon: 'fas fa-video',
        number: '03',
        title: 'Consult Online',
        description: 'Join your appointment through our secure video platform. Get professional medical advice from the comfort of your home.'
    },
    {
        icon: 'fas fa-file-medical',
        number: '04',
        title: 'Follow-up Care',
        description: 'Receive digital prescriptions, medical reports, and follow-up recommendations. Track your health journey with us.'
    }
];

const footerData = {
    logo: {
        icon: 'fas fa-heartbeat',
        text: 'MediCare'
    },
    about: 'Your trusted healthcare partner providing quality medical services and connecting you with the best doctors worldwide.',
    quickLinks: ['Find Doctors', 'Book Appointment', 'Online Consultation', 'Health Blog', 'Patient Reviews', 'Emergency Care'],
    specialties: ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Psychiatry'],
    contact: {
        phone: '+1 (555) 123-4567',
        email: 'info@medicare.com',
        address: '123 Health St, Medical City'
    }
};

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    loadServices();
    loadStats();
    loadDoctors();
    loadSteps();
    loadFooter();
    setupEventListeners();
    setupMobileMenu();
});

// Load services section
function loadServices() {
    const servicesGrid = document.querySelector('.services-grid');
    
    servicesData.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        
        serviceCard.innerHTML = `
            <div class="service-icon">
                <i class="${service.icon}"></i>
            </div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            
            <div class="service-features">
                ${service.features.map(feature => `
                    <div class="service-feature">
                        <div class="feature-dot"></div>
                        <span>${feature}</span>
                    </div>
                `).join('')}
            </div>
            
            <button class="btn btn-outline" style="width: 100%;">Learn More</button>
        `;
        
        servicesGrid.appendChild(serviceCard);
    });
}

// Load stats section
function loadStats() {
    const statsContainer = document.querySelector('.stats');
    
    statsData.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        
        statCard.innerHTML = `
            <div class="stat-icon">
                <i class="${stat.icon}"></i>
            </div>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        `;
        
        statsContainer.appendChild(statCard);
    });
}

// Load doctors section
function loadDoctors() {
    const doctorsGrid = document.querySelector('.doctors-grid');
    
    doctorsData.forEach(doctor => {
        const doctorCard = document.createElement('div');
        doctorCard.className = 'doctor-card';
        
        doctorCard.innerHTML = `
            <div class="doctor-header">
                <div class="doctor-image">
                    <img src="${doctor.image}" alt="${doctor.name}">
                    <div class="verified-badge">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                <h3 class="doctor-name">${doctor.name}</h3>
                <p class="doctor-specialty">${doctor.specialty}</p>
            </div>
            <div class="doctor-body">
                <div class="doctor-rating">
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span class="rating-value">${doctor.rating}</span>
                        <span class="rating-count">(${doctor.reviews})</span>
                    </div>
                    <div class="experience">${doctor.experience}</div>
                </div>
                <div class="doctor-details">
                    <div class="doctor-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${doctor.location}</span>
                    </div>
                    <div class="doctor-detail">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Next: ${doctor.availability}</span>
                    </div>
                </div>
                <div class="doctor-actions">
                    <button class="btn btn-primary btn-small">Book Now</button>
                    <button class="btn btn-outline btn-small">View Profile</button>
                </div>
            </div>
        `;
        
        doctorsGrid.appendChild(doctorCard);
    });
}

// Load how it works section
function loadSteps() {
    const stepsContainer = document.querySelector('.steps');
    
    stepsData.forEach(step => {
        const stepCard = document.createElement('div');
        stepCard.className = 'step-card';
        
        stepCard.innerHTML = `
            <div class="step-icon">
                <i class="${step.icon}"></i>
                <div class="step-number">${step.number}</div>
            </div>
            <h3>${step.title}</h3>
            <p>${step.description}</p>
        `;
        
        stepsContainer.appendChild(stepCard);
    });
}

// Load footer
function loadFooter() {
    const footerContent = document.querySelector('.footer-content');
    
    footerContent.innerHTML = `
        <div class="footer-about">
            <div class="footer-logo">
                <i class="${footerData.logo.icon}"></i>
                <span>${footerData.logo.text}</span>
            </div>
            <p class="footer-about">${footerData.about}</p>
            <div class="social-links">
                <a href="#" class="social-link">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="social-link">
                    <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="social-link">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="#" class="social-link">
                    <i class="fab fa-linkedin-in"></i>
                </a>
            </div>
        </div>
        
        <div class="footer-links-section">
            <h3 class="footer-heading">Quick Links</h3>
            <div class="footer-links">
                ${footerData.quickLinks.map(link => `<a href="#" class="footer-link">${link}</a>`).join('')}
            </div>
        </div>
        
        <div class="footer-links-section">
            <h3 class="footer-heading">Specialties</h3>
            <div class="footer-links">
                ${footerData.specialties.map(specialty => `<a href="#" class="footer-link">${specialty}</a>`).join('')}
            </div>
        </div>
        
        <div class="footer-contact">
            <h3 class="footer-heading">Contact Info</h3>
            <div class="contact-info">
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <span>${footerData.contact.phone}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>${footerData.contact.email}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${footerData.contact.address}</span>
                </div>
            </div>
            
            <div class="newsletter">
                <h3 class="footer-heading">Newsletter</h3>
                <div class="newsletter-input">
                    <input type="email" placeholder="Your email">
                    <button class="btn btn-primary btn-small">Subscribe</button>
                </div>
            </div>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Button ripple effect
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            createRippleEffect(e, this);
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input input');
    const searchButton = document.querySelector('.search-input button');
    
    searchButton.addEventListener('click', function() {
        performSearch(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch(this.value);
        }
    });
}

// Create ripple effect on buttons
function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Perform search
function performSearch(query) {
    if (query.trim() !== '') {
        alert(`Searching for: ${query}`);
        // In a real application, you would implement actual search logic here
    }
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.innerHTML = nav.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
}

// Add CSS for active mobile menu
const mobileMenuCSS = `
    @media (max-width: 768px) {
        .nav.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            gap: 16px;
        }
    }
`;

const style = document.createElement('style');
style.textContent = mobileMenuCSS;
document.head.appendChild(style);