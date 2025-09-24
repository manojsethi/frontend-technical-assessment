import { DragDrop } from './dragDrop.js';
import { BlogList } from './BlogList.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Drag & Drop
    const dragDropContainer = document.querySelector('.drag-drop-container');
    if (dragDropContainer) {
        const dragDrop = new DragDrop();
        dragDrop.init();
    }

    // Initialize Blog List (partial)
    const blogListContainer = document.querySelector('.blog-list-container');
    if (blogListContainer) {
        const blogList = new BlogList(blogListContainer);
        blogList.init();
    }

    // Initialize Navigation
    initNavigation();
});

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');

    // Handle click events
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToSection(link);
        });
    });

    // Handle keyboard navigation
    navLinks.forEach((link, index) => {
        link.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    navigateToSection(link);
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (index + 1) % navLinks.length;
                    navLinks[nextIndex].focus();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = index === 0 ? navLinks.length - 1 : index - 1;
                    navLinks[prevIndex].focus();
                    break;
                case 'Home':
                    e.preventDefault();
                    navLinks[0].focus();
                    break;
                case 'End':
                    e.preventDefault();
                    navLinks[navLinks.length - 1].focus();
                    break;
            }
        });
    });

    // Handle mobile menu toggle keyboard events
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileMenu();
            }
        });
    }

    // Function to navigate to a section
    function navigateToSection(link) {
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            // Find current active section before changing
            const currentActiveLink = document.querySelector('.nav-link.active');
            const currentActiveSectionId = currentActiveLink ? currentActiveLink.getAttribute('href').substring(1) : null;
            
            // Remove active class from all links and sections
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
                navLink.setAttribute('aria-current', 'false');
            });
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
            
            // Show line on the PREVIOUS section (the one we're leaving)
            if (currentActiveSectionId && currentActiveSectionId !== targetId) {
                const previousSection = document.getElementById(currentActiveSectionId);
                if (previousSection) {
                    previousSection.classList.add('active');
                }
            }
            
            // Smooth scroll to section with offset for navbar
            const navbarHeight = document.querySelector('header').offsetHeight;
            const mainElement = document.querySelector('main');
            const mainMarginTop = mainElement ? parseInt(getComputedStyle(mainElement).marginTop) : 0;
            const targetPosition = targetSection.offsetTop - navbarHeight - mainMarginTop;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Announce navigation to screen readers
            announceToScreenReader(`Navigated to ${link.textContent} section`);
        }
    }

    // Function to toggle mobile menu
    function toggleMobileMenu() {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        
        // Toggle visibility of navigation links (basic implementation)
        navLinks.forEach(link => {
            if (!isExpanded) {
                link.style.display = 'block';
            } else {
                link.style.display = 'none';
            }
        });
        
        announceToScreenReader(isExpanded ? 'Mobile menu closed' : 'Mobile menu opened');
    }

    // Function to announce messages to screen readers
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Handle scroll events for highlighting
    function updateActiveNavLink() {
        let current = '';
        let previous = '';
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            // More precise detection based on viewport
            if (scrollPosition >= (sectionTop - windowHeight * 0.3)) {
                previous = current; // Store previous section
                current = section.getAttribute('id');
            }
        });

        // Update nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-current', 'false');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });

        // Update mobile header title
        updateMobileHeaderTitle();

        // Don't remove active class from sections - keep blue lines persistent
        // Only add new active class if there's a previous section
        if (previous && previous !== current) {
            const previousSection = document.getElementById(previous);
            if (previousSection && !previousSection.classList.contains('active')) {
                previousSection.classList.add('active');
            }
        }
    }

    // Function to update mobile header title
    function updateMobileHeaderTitle() {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            const title = activeLink.textContent;
            nav.style.setProperty('--mobile-title', `"${title}"`);
        }
    }

    // Mobile menu toggle functionality
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            nav.classList.toggle('mobile-menu-open');
            const isOpen = nav.classList.contains('mobile-menu-open');
            mobileMenuToggle.textContent = isOpen ? '✕' : '☰';
        });

        // Close mobile menu when clicking on a nav link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('mobile-menu-open');
                mobileMenuToggle.textContent = '☰';
                // Update mobile header title
                setTimeout(updateMobileHeaderTitle, 100);
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && nav.classList.contains('mobile-menu-open')) {
                nav.classList.remove('mobile-menu-open');
                mobileMenuToggle.textContent = '☰';
            }
        });
    }

    // Listen for scroll events
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Initial call to set correct active state
    updateActiveNavLink();
}
