/* animations.js - GSAP & ScrollTrigger Animations (Including dynamic theme changes) */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    // 1. PRELOADER REVEAL (FADE IN NAME & PULSE THEME)
    const preloader = document.querySelector('.preloader');
    const preloaderName = document.querySelector('.preloader-name');
    
    // Continuously pulse preloader background from dark to light
    const bgPulse = gsap.fromTo(preloader, 
        { backgroundColor: '#070707' },
        {
            backgroundColor: '#ffffff',
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        }
    );
    
    const preloaderTimeline = gsap.timeline({
        onComplete: () => {
            bgPulse.kill(); // Stop pulsing when finished
            preloader.style.display = 'none';
            triggerHeroEntrance();
        }
    });
    
    preloaderTimeline
        .to(preloaderName, {
            opacity: 1,
            scale: 1.05,
            duration: 1.2,
            ease: 'power3.out'
        })
        .to(preloaderName, {
            opacity: 0,
            y: -15,
            duration: 0.8,
            delay: 1.2,
            ease: 'power3.in'
        })
        .to(preloader, {
            yPercent: -100,
            duration: 1.2,
            ease: 'power4.inOut'
        }, '-=0.2');
    
    // 2. HERO ENTRANCE
    function triggerHeroEntrance() {
        const heroTimeline = gsap.timeline();
        
        gsap.set('.logo, .nav-link, .menu-toggle', { y: -20, opacity: 0 });
        gsap.set('.hero-top-left', { y: 30, opacity: 0 });
        gsap.set('.hero-main-title', { scale: 1.1, opacity: 0 });
        gsap.set('.hero-bottom-row', { y: 20, opacity: 0 });
        gsap.set('.header', { opacity: 1 });
        
        heroTimeline
            .to('.logo, .nav-link, .menu-toggle', {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            })
            .to('.hero-top-left', {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.6')
            .to('.hero-main-title', {
                scale: 1,
                opacity: 1,
                duration: 1.5,
                ease: 'power4.out'
            }, '-=0.6')
            .to('.hero-bottom-row', {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=1');
    }
    
    // 3. SCROLL REVEALS FOR SECTION TITLES & PARAGRAPHS
    const scrollRevealSections = document.querySelectorAll('.section');
    
    scrollRevealSections.forEach(section => {
        const titleInner = section.querySelector('.section-title-wrap .line-mask-inner');
        const sectionNum = section.querySelector('.section-num');
        const contents = section.querySelectorAll('.scroll-fade');
        
        if (titleInner) {
            gsap.fromTo(titleInner, 
                { yPercent: 100 },
                { 
                    yPercent: 0,
                    duration: 1.2,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
        
        if (sectionNum) {
            gsap.fromTo(sectionNum,
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
        
        if (contents.length > 0) {
            gsap.fromTo(contents,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 75%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
    });

    // 4. DYNAMIC SECTION THEME CHANGER (Matches noth.in scroll background transitions)
    const themeSections = document.querySelectorAll('[data-theme]');
    themeSections.forEach(section => {
        const theme = section.getAttribute('data-theme');
        
        ScrollTrigger.create({
            trigger: section,
            start: 'top 50%',
            end: 'bottom 50%',
            onEnter: () => {
                document.body.className = `theme-${theme}`;
            },
            onEnterBack: () => {
                document.body.className = `theme-${theme}`;
            }
        });
    });

    // 5. VIDEOS AUTOPLAY ON SCROLL / VIEWPORT ENTRY
    const mediaVideos = document.querySelectorAll('.work-card-media, .showreel-wrap video');
    mediaVideos.forEach(video => {
        ScrollTrigger.create({
            trigger: video,
            start: 'top 80%',
            end: 'bottom 20%',
            onEnter: () => {
                video.play().catch(err => {});
            },
            onLeave: () => {
                video.pause();
            },
            onEnterBack: () => {
                video.play().catch(err => {});
            },
            onLeaveBack: () => {
                video.pause();
            }
        });
    });

    // 6. SKILL TAG MICRO-ANIMATIONS
    const skillsList = document.querySelectorAll('.skill-tag');
    skillsList.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            gsap.to(tag, {
                scale: 1.05,
                borderColor: 'var(--accent-color)',
                boxShadow: '0 5px 15px var(--accent-glow)',
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        tag.addEventListener('mouseleave', () => {
            gsap.to(tag, {
                scale: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: 'none',
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
});
