/* hero-reveal.js - "Wipe the smoke" cursor reveal for the hero background image
   Moving the mouse over the hero section grows a soft circular hole in the
   smoke layer around the cursor, revealing the background image underneath.
   Moving the mouse away from the hero closes the hole again, restoring the
   smoke exactly as it looked before. */

document.addEventListener('DOMContentLoaded', () => {
    const hero = document.getElementById('hero');
    const smoke = document.querySelector('.hero-bg-smoke');

    if (!hero || !smoke) return;

    // Tunable feel
    const REVEAL_SIZE = 260;      // px radius of the fully-open hole
    const GROW_DURATION = 0.9;    // seconds to open when entering/moving
    const CLOSE_DURATION = 1.1;   // seconds to close when the mouse leaves
    const FOLLOW_EASE = 0.12;     // 0-1, how quickly the hole chases the cursor (lower = smokier/laggier)

    // Current + target position (in px relative to the hero section)
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hasPosition = false;
    let rafId = null;

    const sizeState = { value: 0 };

    function setVars() {
        smoke.style.setProperty('--reveal-x', `${currentX}px`);
        smoke.style.setProperty('--reveal-y', `${currentY}px`);
        smoke.style.setProperty('--reveal-size', `${sizeState.value}px`);
    }

    function followLoop() {
        currentX += (targetX - currentX) * FOLLOW_EASE;
        currentY += (targetY - currentY) * FOLLOW_EASE;
        setVars();
        rafId = requestAnimationFrame(followLoop);
    }

    function startFollowing() {
        if (rafId === null) {
            rafId = requestAnimationFrame(followLoop);
        }
    }

    function stopFollowing() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;

        if (!hasPosition) {
            // Snap on first contact so the hole appears right where the
            // cursor entered rather than sliding in from the last spot.
            currentX = targetX;
            currentY = targetY;
            hasPosition = true;
            setVars();
        }

        startFollowing();

        gsap.to(sizeState, {
            value: REVEAL_SIZE,
            duration: GROW_DURATION,
            ease: 'power2.out',
            onUpdate: setVars
        });
    });

    hero.addEventListener('mouseleave', () => {
        gsap.to(sizeState, {
            value: 0,
            duration: CLOSE_DURATION,
            ease: 'power2.inOut',
            onUpdate: setVars,
            onComplete: () => {
                stopFollowing();
                hasPosition = false;
            }
        });
    });
});
