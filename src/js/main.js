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

    // Handle click events
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Remove active class from all links
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                // Add active class to clicked link
                link.classList.add('active');
                
                
                // Smooth scroll to section with offset for navbar
                const navbarHeight = document.querySelector('header').offsetHeight;
                const mainElement = document.querySelector('main');
                const mainMarginTop = mainElement ? parseInt(getComputedStyle(mainElement).marginTop) : 0;
                const targetPosition = targetSection.offsetTop - navbarHeight - mainMarginTop;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle scroll events for highlighting
    function updateActiveNavLink() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const scrollPosition = window.pageYOffset;
            const windowHeight = window.innerHeight;
            
            // More precise detection based on viewport
            if (scrollPosition >= (sectionTop - windowHeight * 0.3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

    }

    // Listen for scroll events
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Initial call to set correct active state
    updateActiveNavLink();
}
