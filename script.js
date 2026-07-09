// --- Soft Flow Cursor Physics ---
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const trail = document.querySelector('.cursor-trail');
const dot = document.querySelector('.cursor-dot');
const ambientBg = document.querySelector('.ambient-bg');

const state = {
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    scroll: window.scrollY || 0
};

const lerp = (start, end, factor) => start + (end - start) * factor;
let smoothMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

if (!isTouchDevice) {
    window.addEventListener('mousemove', (e) => {
        state.mouse.x = e.clientX;
        state.mouse.y = e.clientY;
        
        if (trail) {
            trail.style.left = `${e.clientX}px`;
            trail.style.top = `${e.clientY}px`;
        }
    });

    const render = () => {
        try {
            smoothMouse.x = lerp(smoothMouse.x, state.mouse.x, 0.1);
            smoothMouse.y = lerp(smoothMouse.y, state.mouse.y, 0.1);

            if (dot) {
                dot.style.left = `${smoothMouse.x}px`;
                dot.style.top = `${smoothMouse.y}px`;
            }

            // Parallax movement of ambient background
            const xOffset = (smoothMouse.x / window.innerWidth) - 0.5;
            const yOffset = (smoothMouse.y / window.innerHeight) - 0.5;
            if (ambientBg) {
                ambientBg.style.transform = `translate(${xOffset * -15}px, calc(${state.scroll * 0.15}px + ${yOffset * -15}px))`;
            }
        } catch (e) {
            console.error("Render loop error", e);
        }

        requestAnimationFrame(render);
    };
    render();
}

// Magnetic Interactions for interactive elements
function bindInteractives() {
    const interactives = document.querySelectorAll('.magnetic-item, .details-card, button, a');
    if (!isTouchDevice) {
        interactives.forEach(el => {
            if (el.dataset.bound) return;
            el.dataset.bound = "true";

            el.addEventListener('mouseenter', () => {
                if (dot) {
                    dot.style.transform = 'translate(-50%, -50%) scale(1.6)';
                    dot.style.borderColor = 'rgba(158, 28, 46, 0.4)';
                    dot.style.background = 'radial-gradient(circle, rgba(223, 177, 91, 0.2) 0%, transparent 70%)';
                }
            });
            
            el.addEventListener('mouseleave', () => {
                if (dot) {
                    dot.style.transform = 'translate(-50%, -50%) scale(1)';
                    dot.style.borderColor = 'rgba(223, 177, 91, 0.3)';
                    dot.style.background = 'transparent';
                }
            });
        });
    }
}

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    state.scroll = window.scrollY;
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Hide scroll indicator on scroll
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        if (window.scrollY > 150) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.pointerEvents = 'none';
        } else {
            scrollIndicator.style.opacity = '0.8';
            scrollIndicator.style.pointerEvents = 'auto';
        }
    }
});

// Staggered Scroll-Trigger Fades
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.10 };
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
bindInteractives();

// Monitor dynamically added nodes (for Web Components)
const mutationObserver = new MutationObserver((mutations) => {
    let shouldBind = false;
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
                if (node.classList && node.classList.contains('fade-up')) {
                    observer.observe(node);
                }
                const fadeUps = node.querySelectorAll('.fade-up');
                if (fadeUps) {
                    fadeUps.forEach(el => observer.observe(el));
                }
                shouldBind = true;
            }
        });
    });
    if (shouldBind) bindInteractives();
});
mutationObserver.observe(document.body, { childList: true, subtree: true });

// --- Background Music Controls ---
const audioToggle = document.getElementById('audioToggle');
const bgMusic = document.getElementById('bgMusic');
let isPlaying = false;
let isMuted = true;

const playIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
const pauseIcon = `<div class="music-wave playing"><span></span><span></span><span></span><span></span></div>`;

const unmuteOnInteraction = () => {
    if (!bgMusic || !isMuted) return;
    bgMusic.muted = false;
    bgMusic.volume = 0;
    bgMusic.play().then(() => {
        isPlaying = true;
        isMuted = false;
        if (audioToggle) audioToggle.innerHTML = pauseIcon;
        let vol = 0;
        const fadeIn = setInterval(() => {
            vol = Math.min(vol + 0.02, 0.7);
            bgMusic.volume = vol;
            if (vol >= 0.7) clearInterval(fadeIn);
        }, 100);
    }).catch(e => console.log("Autoplay blocked by browser", e));

    document.removeEventListener('click', unmuteOnInteraction);
    document.removeEventListener('touchstart', unmuteOnInteraction);
    document.removeEventListener('scroll', unmuteOnInteraction);
};

// --- Door Opening Unveil Logic ---
const introOverlay = document.getElementById('introOverlay');

if (introOverlay) {
    // Automatically trigger parting doors animation after a short delay on page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            // Trigger parting doors animation
            introOverlay.classList.add('unveiled');
            
            // Trigger content visibility transitions after opening begins
            setTimeout(() => {
                document.querySelectorAll('.hero .fade-up, .hero .lotus-decor').forEach(el => el.classList.add('visible'));
            }, 500);

            // Remove overlay panel from DOM structure after slide ends
            setTimeout(() => {
                introOverlay.style.display = 'none';
            }, 1800);
        }, 800); // 800ms elegant delay before opening automatically
    });
} else {
    // Force visibility on hero immediately as fallback
    setTimeout(() => {
        document.querySelectorAll('.hero .fade-up, .hero .lotus-decor').forEach(el => el.classList.add('visible'));
    }, 500);
}

// Keep music playback tied to any user interaction (click, scroll, touch) since browsers block autoplay
document.addEventListener('click', unmuteOnInteraction);
document.addEventListener('touchstart', unmuteOnInteraction);
document.addEventListener('scroll', unmuteOnInteraction);

if (audioToggle) {
    audioToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMuted) {
            unmuteOnInteraction();
        } else if (isPlaying) {
            bgMusic.pause();
            audioToggle.innerHTML = playIcon;
            isPlaying = false;
        } else {
            bgMusic.play();
            audioToggle.innerHTML = pauseIcon;
            isPlaying = true;
        }
    });
}

// --- Canvas Marigold (Genda Phool) Petals Shower Engine ---
const canvas = document.getElementById('petalCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let petals = [];
    const maxPetals = 95; // Increased flower shower count for a richer celebratory vibe

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    class MarigoldPetal {
        constructor() {
            this.reset();
            // Start scattered across screen initially
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = -20; // Fall from top of screen
            this.depth = Math.random();
            this.size = this.depth * 9 + 6; // Delicate petal sizes (6px to 15px)
            this.speedY = this.depth * 0.9 + 0.6; // Soft falling speed
            this.speedX = (Math.random() - 0.5) * 0.3; // Gentle sideways drift
            this.angle = Math.random() * Math.PI * 2;
            this.spinSpeed = (Math.random() - 0.5) * 0.015; // Slow elegant spin
            this.opacity = this.depth * 0.4 + 0.55; // Highly visible warm glow (0.55 to 0.95)
            this.swaySpeed = Math.random() * 0.01 + 0.005;
            this.swayPhase = Math.random() * Math.PI * 2;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.swayPhase) * 0.25;
            this.swayPhase += this.swaySpeed;
            this.angle += this.spinSpeed;

            // Reset when falling out of bounds
            if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            
            const r = this.size / 2;
            
            // Draw a traditional heart-shaped or fan-shaped marigold petal
            ctx.moveTo(0, -r);
            ctx.bezierCurveTo(-r * 0.85, -r * 0.6, -r * 0.95, r * 0.3, 0, r);
            ctx.bezierCurveTo(r * 0.95, r * 0.3, r * 0.85, -r * 0.6, 0, -r);
            ctx.closePath();
            
            // Vibrant yellow-orange gradient
            const grad = ctx.createLinearGradient(0, -r, 0, r);
            grad.addColorStop(0, `rgba(255, 223, 0, ${this.opacity})`);  // Bright yellow tip (#FFDF00)
            grad.addColorStop(0.65, `rgba(255, 140, 0, ${this.opacity * 0.95})`); // Warm orange body (#FF8C00)
            grad.addColorStop(1, `rgba(220, 20, 60, ${this.opacity * 0.8})`);    // Rich deep orange base (#DC143C)
            
            ctx.fillStyle = grad;
            ctx.fill();
            
            // Soft gold stroke highlight on the petal edge for extra definition
            ctx.strokeStyle = `rgba(255, 215, 0, ${this.opacity * 0.45})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            ctx.restore();
        }
    }

    // Initialize petals
    for (let i = 0; i < maxPetals; i++) {
        petals.push(new MarigoldPetal());
    }

    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        
        petals.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animate);
    };
    
    // Start animation loop
    animate();
}
