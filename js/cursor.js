/* cursor.js - Interactive Custom Cursor Mechanics */

document.addEventListener('DOMContentLoaded', () => {
    const cursorDot = document.querySelector('.custom-cursor');
    const cursorRing = document.querySelector('.custom-cursor-ring');
    
    if (!cursorDot || !cursorRing) return;
    
    let mouseX = 0;
    let mouseY = 0;
    
    let dotX = 0;
    let dotY = 0;
    let ringX = 0;
    let ringY = 0;
    
    // Lerp values for easing
    const dotLerp = 0.25;
    const ringLerp = 0.08;
    
    let isHidden = true;
    
    // Track mouse position
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (isHidden) {
            isHidden = false;
            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '1';
        }
    });
    
    // Animation loop for smooth cursor tracking
    function animateCursor() {
        dotX += (mouseX - dotX) * dotLerp;
        dotY += (mouseY - dotY) * dotLerp;
        
        ringX += (mouseX - ringX) * ringLerp;
        ringY += (mouseY - ringY) * ringLerp;
        
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;
        
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        
        requestAnimationFrame(animateCursor);
    }
    
    requestAnimationFrame(animateCursor);
    
    // Hide cursor when leaving screen
    document.addEventListener('mouseleave', () => {
        isHidden = true;
        cursorDot.style.opacity = '0';
        cursorRing.style.opacity = '0';
    });
    
    // Add hover states for interactive items
    const hoverElements = document.querySelectorAll('a, button, .interactive-hover');
    const projectElements = document.querySelectorAll('.work-card'); // Updated to target .work-card
    
    hoverElements.forEach(el => {
        if (el.classList.contains('work-card')) return;
        
        el.addEventListener('mouseenter', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1.8)';
            cursorRing.style.transform = 'translate(-50%, -50%) scale(0.6)';
            cursorDot.style.backgroundColor = 'var(--accent-color)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorDot.style.backgroundColor = 'var(--text-color)';
        });
    });
    
    // Project specific hover states (EXPLORE cursor over project cards)
    projectElements.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursorDot.classList.add('explore');
            cursorRing.classList.add('explore');
        });
        
        item.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('explore');
            cursorRing.classList.remove('explore');
        });
    });
});
