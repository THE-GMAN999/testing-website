// ============================================
// Theme Management
// ============================================

class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    }

    updateThemeIcon() {
        // Icon update is handled by CSS
    }

    init() {
        this.setTheme(this.theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// ============================================
// Navigation
// ============================================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navMenu = document.getElementById('navMenu');
        this.mobileToggle = document.getElementById('mobileMenuToggle');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        // Mobile menu toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMobileMenu();
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Active section highlighting
        window.addEventListener('scroll', () => this.updateActiveSection());
        
        // Smooth scroll for anchor links
        this.setupSmoothScroll();
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.mobileToggle.classList.toggle('active');
    }

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.mobileToggle.classList.remove('active');
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                this.navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ============================================
// Animations
// ============================================

class AnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.animateStats();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, this.observerOptions);

        // Observe elements with fade-in class
        document.querySelectorAll('.service-card, .feature-item, .gallery-item, .pricing-card').forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    }

    animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        
        const animateValue = (element, start, end, duration) => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const value = Math.floor(progress * (end - start) + start);
                element.textContent = value + (element.dataset.target.includes('%') ? '%' : '+');
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    element.textContent = end + (element.dataset.target.includes('%') ? '%' : '+');
                }
            };
            window.requestAnimationFrame(step);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.target);
                    animateValue(entry.target, 0, target, 2000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }
}

// ============================================
// Testimonials Slider
// ============================================

class TestimonialSlider {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.testimonial-card');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.getElementById('prevTestimonial');
        this.nextBtn = document.getElementById('nextTestimonial');
        this.init();
    }

    init() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Auto-play testimonials
        this.startAutoPlay();
    }

    showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        this.currentSlide = index;
    }

    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(next);
        this.resetAutoPlay();
    }

    prevSlide() {
        const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prev);
        this.resetAutoPlay();
    }

    goToSlide(index) {
        this.showSlide(index);
        this.resetAutoPlay();
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    resetAutoPlay() {
        clearInterval(this.autoPlayInterval);
        this.startAutoPlay();
    }
}

// ============================================
// Contact Form
// ============================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span>';

        try {
            // API placeholder - Replace with actual API endpoint
            const response = await this.submitToAPI(data);
            
            if (response.success) {
                this.showMessage('Thank you! Your message has been sent successfully.', 'success');
                this.form.reset();
            } else {
                throw new Error(response.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    async submitToAPI(data) {
        // Placeholder for API call
        // Replace this with your actual API endpoint
        // Example:
        // return await fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // }).then(res => res.json());

        // Simulate API call for demo
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data:', data);
                resolve({ success: true, message: 'Message sent successfully' });
            }, 1000);
        });
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `form-message form-message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 0.5rem;
            background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            font-weight: 500;
            animation: fadeIn 0.3s ease-out;
        `;

        this.form.appendChild(messageEl);

        // Remove message after 5 seconds
        setTimeout(() => {
            messageEl.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => messageEl.remove(), 300);
        }, 5000);
    }
}

// ============================================
// Gallery Lightbox (Optional Enhancement)
// ============================================

class GalleryLightbox {
    constructor() {
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.init();
    }

    init() {
        this.galleryItems.forEach(item => {
            const viewBtn = item.querySelector('.gallery-view');
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Placeholder for lightbox functionality
                    // You can integrate a lightbox library here
                    console.log('Gallery item clicked - implement lightbox here');
                });
            }
        });
    }
}

// ============================================
// Parallax Effects
// ============================================

class ParallaxManager {
    constructor() {
        this.init();
    }

    init() {
        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroContent = document.querySelector('.hero-content');
            const heroImage = document.querySelector('.hero-image');
            
            if (heroContent && scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                if (heroImage) {
                    heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
                }
            }
        });
    }
}

// ============================================
// Initialize Everything
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager
    const themeManager = new ThemeManager();
    
    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => themeManager.toggleTheme());
    }

    // Initialize navigation
    const navigation = new Navigation();

    // Initialize animations
    const animations = new AnimationManager();

    // Initialize testimonial slider
    const testimonialSlider = new TestimonialSlider();

    // Initialize contact form
    const contactForm = new ContactForm();

    // Initialize gallery lightbox
    const galleryLightbox = new GalleryLightbox();

    // Initialize parallax effects
    const parallax = new ParallaxManager();

    // Add fade-in animation to hero elements
    const heroElements = document.querySelectorAll('.hero-text, .hero-image');
    heroElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
    });
});

// ============================================
// Utility Functions
// ============================================

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        Navigation,
        AnimationManager,
        TestimonialSlider,
        ContactForm
    };
}

