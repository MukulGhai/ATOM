/* ============================================
   SORRY SAANCHI — JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollAnimations();
    initEnvelope();
    initForgiveSection();
    initMusicToggle();
    initFloatingHearts();
    initNoButtonEscape();
    initStartButton();
});

/* ============================================
   PARTICLE SYSTEM (Floating rose petals / stars)
   ============================================ */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const PARTICLE_COUNT = 60;
    const colors = [
        'rgba(255, 107, 157, 0.4)',
        'rgba(192, 132, 252, 0.3)',
        'rgba(168, 85, 247, 0.3)',
        'rgba(244, 114, 182, 0.35)',
        'rgba(255, 182, 193, 0.3)',
    ];

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.5 + 0.1;
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.pulse += this.pulseSpeed;

            if (this.x < -10 || this.x > canvas.width + 10 ||
                this.y < -10 || this.y > canvas.height + 10) {
                this.reset();
            }
        }

        draw() {
            const currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.pulse));
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(/[\d.]+\)$/, currentOpacity + ')');
            ctx.fill();
            
            // Glow effect
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size * 3
            );
            gradient.addColorStop(0, this.color.replace(/[\d.]+\)$/, (currentOpacity * 0.3) + ')'));
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 107, 157, ${0.05 * (1 - distance / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* ============================================
   SCROLL ANIMATIONS (Intersection Observer)
   ============================================ */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe section titles
    document.querySelectorAll('.section-title').forEach(el => observer.observe(el));

    // Observe reason cards with staggered delay
    document.querySelectorAll('.reason-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(card);
    });

    // Observe timeline items with staggered delay
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(item);
    });

    // Observe forgive question and buttons
    const forgiveQuestion = document.querySelector('.forgive-question');
    const forgiveButtons = document.querySelector('.forgive-buttons');
    if (forgiveQuestion) observer.observe(forgiveQuestion);
    if (forgiveButtons) observer.observe(forgiveButtons);
}

/* ============================================
   ENVELOPE INTERACTION
   ============================================ */
function initEnvelope() {
    const envelope = document.getElementById('envelope');
    const letterPaper = document.getElementById('letter-paper');

    // Open envelope when section is scrolled into view
    const envelopeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    envelope.classList.add('opened');
                    // Reveal letter lines one by one
                    setTimeout(() => revealLetterLines(), 1500);
                }, 800);
                envelopeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    envelopeObserver.observe(envelope);

    // Also allow click to toggle
    envelope.addEventListener('click', () => {
        envelope.classList.toggle('opened');
        if (envelope.classList.contains('opened')) {
            setTimeout(() => revealLetterLines(), 1500);
        }
    });
}

function revealLetterLines() {
    const lines = document.querySelectorAll('.letter-line');
    const signature = document.querySelector('.letter-signature');

    lines.forEach((line, index) => {
        setTimeout(() => {
            line.classList.add('visible');
        }, index * 600);
    });

    // Show signature after all lines
    setTimeout(() => {
        if (signature) signature.classList.add('visible');
    }, lines.length * 600 + 500);
}

/* ============================================
   FORGIVE SECTION
   ============================================ */
function initForgiveSection() {
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const responseYes = document.getElementById('response-yes');
    const responseNo = document.getElementById('response-no');
    const buttons = document.querySelector('.forgive-buttons');

    btnYes.addEventListener('click', () => {
        buttons.style.display = 'none';
        responseYes.classList.remove('hidden');
        responseYes.classList.add('show');
        launchConfetti();
        createHeartExplosion();
    });

    btnNo.addEventListener('click', () => {
        buttons.style.display = 'none';
        responseNo.classList.remove('hidden');
        responseNo.classList.add('show');
    });
}

/* ============================================
   NO BUTTON ESCAPE (playful)
   ============================================ */
function initNoButtonEscape() {
    const btnNo = document.getElementById('btn-no');
    let escapeCount = 0;

    btnNo.addEventListener('mouseenter', () => {
        if (escapeCount < 3) {
            const maxX = window.innerWidth - btnNo.offsetWidth - 50;
            const maxY = 100;
            const randomX = Math.random() * maxX;
            const randomY = Math.random() * maxY - 50;
            
            btnNo.style.position = 'relative';
            btnNo.style.left = `${(Math.random() - 0.5) * 200}px`;
            btnNo.style.top = `${(Math.random() - 0.5) * 50}px`;
            btnNo.style.transition = 'all 0.3s ease';
            escapeCount++;
        }
        
        // After 3 escapes, make the button smaller
        if (escapeCount >= 3) {
            btnNo.style.transform = 'scale(0.7)';
            btnNo.style.opacity = '0.5';
        }
    });
}

/* ============================================
   FLOATING HEARTS
   ============================================ */
function initFloatingHearts() {
    const container = document.getElementById('floating-hearts');
    const hearts = ['💕', '💗', '💖', '💝', '💓', '❤️', '🩷', '🤍'];

    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.animationDuration = `${4 + Math.random() * 6}s`;
        heart.style.animationDelay = `${Math.random() * 6}s`;
        heart.style.fontSize = `${1 + Math.random() * 1.5}rem`;
        container.appendChild(heart);
    }
}

/* ============================================
   CONFETTI CELEBRATION
   ============================================ */
function launchConfetti() {
    const colors = ['#ff6b9d', '#c084fc', '#a855f7', '#f472b6', '#fbbf24', '#34d399', '#ff4757'];
    const confettiCount = 150;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.top = '-10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = `${5 + Math.random() * 10}px`;
            confetti.style.height = `${5 + Math.random() * 10}px`;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            document.body.appendChild(confetti);

            const duration = 2000 + Math.random() * 3000;
            const horizontalDrift = (Math.random() - 0.5) * 200;

            confetti.animate([
                { 
                    transform: `translate(0, 0) rotate(0deg)`,
                    opacity: 1 
                },
                { 
                    transform: `translate(${horizontalDrift}px, ${window.innerHeight + 50}px) rotate(${360 + Math.random() * 720}deg)`,
                    opacity: 0 
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }).onfinish = () => confetti.remove();
        }, i * 20);
    }
}

function createHeartExplosion() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const hearts = ['❤️', '💕', '💖', '💗', '💝'];

    for (let i = 0; i < 30; i++) {
        const heart = document.createElement('span');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'fixed';
        heart.style.left = `${centerX}px`;
        heart.style.top = `${centerY}px`;
        heart.style.fontSize = `${1.5 + Math.random() * 2}rem`;
        heart.style.zIndex = '1000';
        heart.style.pointerEvents = 'none';
        document.body.appendChild(heart);

        const angle = (i / 30) * Math.PI * 2;
        const velocity = 100 + Math.random() * 200;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;

        heart.animate([
            {
                transform: 'translate(0, 0) scale(0)',
                opacity: 0
            },
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1,
                offset: 0.1
            },
            {
                transform: `translate(${dx}px, ${dy}px) scale(0.5)`,
                opacity: 0
            }
        ], {
            duration: 1500 + Math.random() * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }).onfinish = () => heart.remove();
    }
}

/* ============================================
   START BUTTON
   ============================================ */
function initStartButton() {
    const btn = document.getElementById('btn-start');
    btn.addEventListener('click', () => {
        document.getElementById('section-letter').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });
}

/* ============================================
   MUSIC TOGGLE
   ============================================ */
function initMusicToggle() {
    const btn = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    const statusText = btn.querySelector('.music-status');
    let isPlaying = false;

    btn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            btn.classList.remove('playing');
            statusText.textContent = 'Play';
        } else {
            audio.play().catch(() => {
                console.log('Audio play failed - user interaction needed');
            });
            audio.volume = 0.3;
            btn.classList.add('playing');
            statusText.textContent = 'Pause';
        }
        isPlaying = !isPlaying;
    });
}
