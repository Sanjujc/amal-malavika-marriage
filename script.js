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
};

// --- Door Opening Unveil Logic ---
const introOverlay = document.getElementById('introOverlay');
const enterBtn = document.getElementById('enterBtn');

if (enterBtn && introOverlay) {
    enterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Unmute and play background music
        unmuteOnInteraction();
        
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
    });
} else {
    // Fallback listeners for user interactions if overlay isn't present
    document.addEventListener('click', unmuteOnInteraction);
    document.addEventListener('touchstart', unmuteOnInteraction);
    
    // Force visibility on hero immediately as fallback
    setTimeout(() => {
        document.querySelectorAll('.hero .fade-up, .hero .lotus-decor').forEach(el => el.classList.add('visible'));
    }, 500);
}

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

// --- Canvas Lotus Petals Falling Engine ---
const canvas = document.getElementById('petalCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let petals = [];
    const maxPetals = 85; // Festive dense rose petal shower

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    class LotusPetal {
        constructor() {
            this.reset();
            // Start scattered across screen initially
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = -20;
            this.depth = Math.random();
            this.size = this.depth * 14 + 10; // Petal sizes
            this.speedY = this.depth * 1.0 + 0.6; // Falling speed
            this.speedX = (Math.random() - 0.5) * 0.4; // Drift speed
            this.angle = Math.random() * Math.PI * 2;
            this.spinSpeed = (Math.random() - 0.5) * 0.015;
            this.opacity = this.depth * 0.4 + 0.35; // Soft opacity
            this.swayRange = Math.random() * 20 + 10;
            this.swaySpeed = Math.random() * 0.01 + 0.005;
            this.swayPhase = Math.random() * Math.PI * 2;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.swayPhase) * 0.4;
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
            
            // Draw a detailed organic lotus petal shape
            ctx.moveTo(0, -this.size / 2);
            ctx.bezierCurveTo(-this.size / 2, -this.size / 6, -this.size / 2, this.size / 2, 0, this.size);
            ctx.bezierCurveTo(this.size / 2, this.size / 2, this.size / 2, -this.size / 6, 0, -this.size / 2);
            ctx.closePath();
            
            // Premium linear gradient inside the petal (crimson rose red to deep velvet maroon)
            const grad = ctx.createLinearGradient(0, -this.size / 2, 0, this.size);
            grad.addColorStop(0, `rgba(255, 80, 100, ${this.opacity})`); // Vibrant rose red tip
            grad.addColorStop(0.6, `rgba(158, 28, 46, ${this.opacity})`); // Crimson body (#9e1c2e adaptation)
            grad.addColorStop(1, `rgba(100, 15, 25, ${this.opacity * 0.95})`); // Deep velvet maroon base
            
            ctx.fillStyle = grad;
            ctx.fill();
            
            // Optional gold highlighted petal edge for premium quality
            ctx.strokeStyle = `rgba(223, 177, 91, ${this.opacity * 0.25})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            ctx.restore();
        }
    }

    // Initialize petals
    for (let i = 0; i < maxPetals; i++) {
        petals.push(new LotusPetal());
    }

    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        
        petals.forEach(petal => {
            petal.update();
            petal.draw();
        });
        
        requestAnimationFrame(animate);
    };
    
    // Start animation loop
    animate();
}
