/* main.js - Core Setup, Lenis Scroll & Modal Project Details */

// Project Details Data
const projectsData = {
    'home-assistant': {
        title: 'Human Centric Embodied Home Assistant',
        desc: 'Developed a Raspberry Pi-based human-centric home assistant featuring voice interaction, face recognition, radar-based presence detection, and smart home automation, with a primary focus on designing a custom PCB for integrated hardware control and system connectivity.',
        media: [
            { type: 'video', src: 'assets/ha-1.mp4' },
            { type: 'video', src: 'assets/ha-2.mp4' },
            { type: 'video', src: 'assets/ha-3.mp4' }
        ]
    },
    'pcb-design': {
        title: 'Custom Build PCB',
        desc: 'Designed a custom PCB using KiCad for integrated hardware control and power management. Interfaces multiple sensors, routes control signals, and ensures reliable electrical distribution for the Embodied Home Assistant system.',
        media: [
            { type: 'video', src: 'assets/pcb-1.mp4' },
            { type: 'image', src: 'assets/pcb-1.jpg' },
            { type: 'image', src: 'assets/pcb-2.jpg' },
            { type: 'image', src: 'assets/pcb-3.jpg' },
            { type: 'image', src: 'assets/pcb-4.jpg' }
        ]
    },
    'robot': {
        title: 'TSLV',
        desc: 'Implemented a Wi-Fi-controlled robot using ESP32, enabling real-time motion control via a mobile phone interface and OLED-based facial expressions triggered by touch sensors.',
        media: [
            { type: 'video', src: 'assets/robot-1.mp4' },
            { type: 'video', src: 'assets/robot-2.mp4' }
        ]
    },
    'vr-workshop': {
        title: 'Virtual Horizon',
        desc: 'Co-developed a VR game in Unity for a team project and presented its educational/tourism applications to a non-technical audience at Vidyodaya School, Edappally.',
        media: [
            { type: 'video', src: 'assets/vr-1.mp4' }
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE LENIS SMOOTH SCROLL
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false
    });

    lenis.on('scroll', ScrollTrigger.update);

    // Force scroll to top on load/reload to start experience at hero
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Smooth scroll to anchors
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Close mobile menu if open
            const mobMenu = document.querySelector('.mobile-menu-overlay');
            const menuToggle = document.querySelector('.menu-toggle');
            if (mobMenu && mobMenu.classList.contains('active')) {
                mobMenu.classList.remove('active');
                if (menuToggle) {
                    const lines = menuToggle.querySelectorAll('.menu-toggle-line');
                    lines[0].style.transform = 'none';
                    lines[1].style.transform = 'none';
                    lines[1].style.opacity = '1';
                }
            }
            
            if (targetSection) {
                lenis.scrollTo(targetSection, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // 2. MOBILE MENU OVERLAY TOGGLE
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu-overlay');
    
    if (menuToggle && mobileMenu) {
        const lines = menuToggle.querySelectorAll('.menu-toggle-line');
        let isOpen = false;
        
        menuToggle.addEventListener('click', () => {
            isOpen = !isOpen;
            mobileMenu.classList.toggle('active', isOpen);
            
            if (isOpen) {
                lines[0].style.transform = 'translateY(8px) rotate(45deg)';
                lines[1].style.opacity = '0';
                lines[2].style.transform = 'translateY(-8px) rotate(-45deg)';
                
                gsap.fromTo('.mob-nav-link', 
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.4, ease: 'power3.out' }
                );
            } else {
                lines[0].style.transform = 'none';
                lines[1].style.opacity = '1';
                lines[2].style.transform = 'none';
            }
        });
        
        const mobLinks = mobileMenu.querySelectorAll('.mob-nav-link');
        mobLinks.forEach(link => {
            link.addEventListener('click', () => {
                isOpen = false;
                mobileMenu.classList.remove('active');
                lines[0].style.transform = 'none';
                lines[1].style.opacity = '1';
                lines[2].style.transform = 'none';
            });
        });
    }

    // 3. LAZY LOAD RESUME IFRAME ON VIEWPORT ENTRY
    // Prevents browser from auto-scrolling page down to resume section on page load
    const resumeSection = document.querySelector('#resume');
    const resumeIframe = document.querySelector('.resume-preview-embed');
    
    if (resumeSection && resumeIframe) {
        ScrollTrigger.create({
            trigger: resumeSection,
            start: 'top 95%',
            onEnter: () => {
                if (!resumeIframe.getAttribute('src')) {
                    const srcUrl = resumeIframe.getAttribute('data-src');
                    resumeIframe.setAttribute('src', srcUrl);
                }
            }
        });
    }

    // 4. PROJECT POPUP WINDOW (MODAL)
    const modal = document.querySelector('.project-modal');
    const modalTitle = modal ? modal.querySelector('.modal-title') : null;
    const modalDesc = modal ? modal.querySelector('.modal-desc') : null;
    const modalGallery = modal ? modal.querySelector('.modal-gallery') : null;
    const modalClose = modal ? modal.querySelector('.modal-close') : null;
    const workCards = document.querySelectorAll('.work-card');
    
    if (modal && workCards.length > 0) {
        workCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const projectId = card.getAttribute('data-project-id');
                const data = projectsData[projectId];
                if (!data) return;
                
                // Populate Modal Data
                modalTitle.textContent = data.title;
                modalDesc.textContent = data.desc;
                modalGallery.innerHTML = '';
                
                data.media.forEach((item, index) => {
                    let mediaEl;
                    if (item.type === 'video') {
                        mediaEl = document.createElement('video');
                        mediaEl.src = item.src;
                        mediaEl.controls = true;
                        mediaEl.muted = true;
                        mediaEl.autoplay = index === 0; // Autoplay first video
                        mediaEl.loop = true;
                        mediaEl.classList.add('modal-media-item');
                    } else {
                        mediaEl = document.createElement('img');
                        mediaEl.src = item.src;
                        mediaEl.alt = `${data.title} media preview ${index + 1}`;
                        mediaEl.classList.add('modal-media-item');
                    }
                    
                    // Span full grid row if it's the first element in an odd list
                    if (index === 0 && data.media.length % 2 !== 0) {
                        mediaEl.classList.add('full-width');
                    }
                    
                    modalGallery.appendChild(mediaEl);
                });
                
                // Open Modal Window
                modal.classList.add('active');
                
                // Disable background scrolling
                lenis.stop();
            });
        });
        
        // Close Modal Event listeners
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
            
            // Stop playing any videos in the background
            const videos = modalGallery.querySelectorAll('video');
            videos.forEach(v => v.pause());
            
            // Re-enable page scrolling
            lenis.start();
        });
        
        // Close on clicking overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modalClose.click();
            }
        });
    }

    // 5. COPY CONTACT TO CLIPBOARD FUNCTIONALITY
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const copyPhoneBtn = document.getElementById('copy-phone-btn');
    
    function setupCopy(btn, textToCopy, successMsg) {
        if (!btn) return;
        const originalText = btn.innerHTML;
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(textToCopy).then(() => {
                btn.innerHTML = successMsg;
                btn.classList.add('copied');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        });
    }
    
    setupCopy(copyEmailBtn, 'anandhubijua2004@gmail.com', 'EMAIL COPIED!');
    setupCopy(copyPhoneBtn, '+918089063799', 'PHONE COPIED!');

    // 6. FOOTER CLOCK (DIGITAL WATCH)
    const clockElement = document.getElementById('digital-clock');
    if (clockElement) {
        function updateClock() {
            const now = new Date();
            const options = {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            const timeString = new Intl.DateTimeFormat('en-IN', options).format(now);
            clockElement.textContent = `${timeString} IST`;
        }
        
        updateClock();
        setInterval(updateClock, 1000);
    }
});
