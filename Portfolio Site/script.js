/**
 * YOGESHWARAN M PORTFOLIO - 2026
 * Enhanced: Full Responsive Support, Performance Optimized
 * Features: Parallax, Particles, Scroll Animations, Touch Gestures
 */

class PortfolioApp {
    constructor() {
        this.html = document.documentElement;
        this.body = document.body;
        this.isTouch = window.matchMedia('(pointer: coarse)').matches;
        this.isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isLargeScreen = window.innerWidth >= 1920;
        this.is4K = window.innerWidth >= 2560;

        this.init();
    }

    init() {
        this.initLoader();
        this.initTheme();
        this.initNavigation();
        this.initCursor();
        this.initParticles();
        this.initScrollEffects();
        this.initAnimations();
        this.initCounters();
        this.initBackToTop();
        this.initParallax();
        this.initScrollIndicator();
        this.handleResize();
    }

    /* --- LOADER --- */
    initLoader() {
        const loader = document.querySelector('.page-loader');
        const progress = document.querySelector('.loader-progress');

        if (progress) {
            progress.style.animation = 'none';
            progress.offsetHeight;
            progress.style.animation = 'loadProgress 2s ease-out forwards';
        }

        const hideLoader = () => {
            loader.classList.add('hidden');
            document.body.style.overflow = 'auto';
            this.animateCharacters();
        };

        window.addEventListener('load', () => setTimeout(hideLoader, 500));

        if (document.readyState === 'complete') {
            setTimeout(hideLoader, 500);
        }

        setTimeout(hideLoader, 2500);
    }

    animateCharacters() {
        const chars = document.querySelectorAll('.hero-name .char');
        chars.forEach((char, index) => {
            char.style.animationDelay = `${0.1 + (index * 0.05)}s`;
            char.style.animationPlayState = 'running';
        });
    }

    /* Replace the entire initScrollIndicator() function in script.js */
    initScrollIndicator() {
        const scrollIndicator = document.getElementById('scroll-indicator');
        if (!scrollIndicator) return;

        const updateIndicator = () => {
            const scrollTop = window.scrollY || window.pageYOffset;
            // Increased threshold slightly so it doesn't disappear too fast
            if (scrollTop < 50) {
                scrollIndicator.classList.add('visible');
                scrollIndicator.classList.remove('hidden');
            } else {
                scrollIndicator.classList.remove('visible');
                scrollIndicator.classList.add('hidden');
            }
        };

        // Delay the initial check slightly to ensure page load is complete
        setTimeout(updateIndicator, 100);
        window.addEventListener('scroll', updateIndicator, { passive: true });
    }

    /* --- THEME --- */
    initTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);

        toggleBtn.addEventListener('click', () => {
            const current = this.html.getAttribute('data-theme');
            this.setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    setTheme(theme) {
        this.html.setAttribute('data-theme', theme);
        const meta = document.querySelector("meta[name='theme-color']");
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#fafafa');
        if (this.particles) this.particles.setTheme(theme);
        localStorage.setItem('theme', theme);
    }

    /* --- NAVIGATION --- */
    initNavigation() {
        const navbar = document.querySelector('.navbar');
        const hamburger = document.querySelector('.hamburger');
        const mobileNav = document.querySelector('.mobile-nav-overlay');
        const closeBtn = document.querySelector('.close-menu-btn');

        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.pageYOffset > 50);
        }, { passive: true });

        const toggleMenu = (show) => {
            hamburger.classList.toggle('active', show);
            mobileNav.classList.toggle('active', show);
            hamburger.setAttribute('aria-expanded', show);
            this.body.style.overflow = show ? 'hidden' : '';
        };

        if (hamburger) {
            hamburger.addEventListener('click', () => toggleMenu(!hamburger.classList.contains('active')));
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => toggleMenu(false));
        }

        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = target.getBoundingClientRect().top + window.pageYOffset - 80;
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                }
            });
        });

        // Scrollspy: update active nav link based on visible section
        (function initScrollSpy() {
            const navLinks = document.querySelectorAll('.nav-link');
            if (!navLinks || navLinks.length === 0) return;

            const sectionMap = {};
            navLinks.forEach(l => {
                const href = l.getAttribute('href');
                if (href && href.startsWith('#')) sectionMap[href.slice(1)] = l;
            });

            const linksContainer = document.querySelector('.nav-links');
            let indicator = null;
            if (linksContainer) {
                indicator = document.createElement('span');
                indicator.className = 'nav-underline';
                linksContainer.style.position = 'relative';
                linksContainer.appendChild(indicator);
            }

            const updateIndicator = (link) => {
                if (!indicator || !linksContainer) return;
                if (!link) {
                    indicator.style.opacity = '0';
                    return;
                }
                const linkRect = link.getBoundingClientRect();
                const parentRect = linksContainer.getBoundingClientRect();
                const left = linkRect.left - parentRect.left + linksContainer.scrollLeft;
                indicator.style.width = linkRect.width + 'px';
                indicator.style.transform = `translateX(${left}px)`;
                indicator.style.opacity = '1';
            };

            const setActive = (id) => {
                const link = sectionMap[id];
                if (link) {
                    navLinks.forEach(n => n.classList.remove('is-active'));
                    link.classList.add('is-active');
                    updateIndicator(link);
                }
            };

            // Use scroll listener as primary detection (more reliable)
            const updateScrollspy = () => {
                let current = null;
                const navHeight = 100;

                for (const [id, link] of Object.entries(sectionMap)) {
                    const section = document.getElementById(id);
                    if (!section) continue;
                    const rect = section.getBoundingClientRect();
                    // Section is visible if its top is above viewport center
                    if (rect.top <= window.innerHeight / 2 && rect.bottom > navHeight) {
                        current = id;
                    }
                }

                if (current) setActive(current);
            };

            // Initial setup on load
            setTimeout(updateScrollspy, 100);

            // Listen to scroll with throttling
            let scrollTimeout;
            const onScroll = () => {
                if (scrollTimeout) clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(updateScrollspy, 50);
            };

            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', updateScrollspy, { passive: true });

            // Also set initial active link
            setTimeout(() => {
                const hash = location.hash ? location.hash.slice(1) : null;
                if (hash && sectionMap[hash]) {
                    setActive(hash);
                    return;
                }
                updateScrollspy();
            }, 150);
        })();
    }

    /* --- CURSOR (Desktop Only) --- */
    initCursor() {
        if (this.isTouch || window.innerWidth < 1024) return;

        const cursor = document.querySelector('.custom-cursor');
        if (!cursor) return;

        const dot = cursor.querySelector('.cursor-dot');
        const circle = cursor.querySelector('.cursor-circle');

        let mouseX = 0, mouseY = 0, circleX = 0, circleY = 0;
        let isActive = true;
        let inactivityTimeout;

        const updateCursor = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';

            clearTimeout(inactivityTimeout);
            if (!isActive) {
                isActive = true;
                animateCircle();
            }

            inactivityTimeout = setTimeout(() => {
                isActive = false;
            }, 100);
        };

        document.addEventListener('mousemove', updateCursor, { passive: true });

        const animateCircle = () => {
            if (!isActive) return;
            circleX += (mouseX - circleX) * 0.15;
            circleY += (mouseY - circleY) * 0.15;
            circle.style.left = circleX + 'px';
            circle.style.top = circleY + 'px';
            requestAnimationFrame(animateCircle);
        };
        animateCircle();

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .glass-card, .project-card, .cert-card, .skill-pill, .paper-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    /* --- PARTICLES (Optimized for all screens) --- */
    initParticles() {
        const canvas = document.getElementById('neural-network');
        if (!canvas || this.prefersReducedMotion) return;

        // Adjust particle count based on screen size and device
        const getParticleCount = () => {
            if (this.is4K) return 80;
            if (this.isLargeScreen) return 60;
            if (this.isTouch) return 25;
            if (this.isChrome) return 40;
            return 50;
        };

        const maxParticles = getParticleCount();
        const connectionDistance = this.isLargeScreen ? 150 : 100;
        const maxConnections = this.isLargeScreen ? 5 : 3;

        const ctx = canvas.getContext('2d');
        let particles = [], frameCount = 0, isVisible = true;
        let animationId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            constructor(theme) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * (this.isLargeScreen ? 3 : 2) + 1;
                this.speedX = (Math.random() - 0.5) * (this.isLargeScreen ? 0.8 : 0.5);
                this.speedY = (Math.random() - 0.5) * (this.isLargeScreen ? 0.8 : 0.5);
                this.theme = theme;
                this.connections = 0;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
                this.connections = 0;
            }
            draw() {
                const color = this.theme === 'dark' ? '0, 212, 255' : '0, 102, 204';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${this.isLargeScreen ? 0.6 : 0.5})`;
                ctx.fill();
            }
        }

        const init = (theme) => {
            particles = [];
            for (let i = 0; i < maxParticles; i++) {
                particles.push(new Particle(theme));
            }
        };

        const drawConnections = (theme) => {
            const color = theme === 'dark' ? '0, 212, 255' : '0, 102, 204';

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    if (particles[i].connections >= maxConnections || particles[j].connections >= maxConnections) continue;

                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity = (1 - distance / connectionDistance) * 0.3;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        particles[i].connections++;
                        particles[j].connections++;
                    }
                }
            }
        };

        const animate = () => {
            if (!isVisible) return;

            // Skip frames on mobile for performance
            frameCount++;
            const skipFrames = this.isTouch ? 2 : 1;

            if (frameCount % skipFrames === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const theme = this.html.getAttribute('data-theme');

                particles.forEach(p => { p.update(); p.draw(); });

                // Only draw connections on non-touch devices or large screens
                if (!this.isTouch || this.isLargeScreen) {
                    drawConnections(theme);
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        document.addEventListener('visibilitychange', () => {
            isVisible = !document.hidden;
            if (isVisible) {
                animate();
            } else {
                cancelAnimationFrame(animationId);
            }
        });

        window.addEventListener('resize', () => {
            resize();
            init(this.html.getAttribute('data-theme'));
        });

        resize();
        init(this.html.getAttribute('data-theme'));
        animate();

        this.particles = { setTheme: (t) => particles.forEach(p => p.theme = t) };
    }

    /* --- SCROLL EFFECTS --- */
    initScrollEffects() {
        const scrollProgress = document.querySelector('.scroll-progress');
        if (!scrollProgress) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            scrollProgress.style.width = progress + '%';

            // Update timeline progress if exists
            const timelineProgress = document.querySelector('.timeline-progress');
            if (timelineProgress) {
                timelineProgress.style.height = progress + '%';
            }
        }, { passive: true });
    }

    /* --- ANIMATIONS --- */
    initAnimations() {
        if (this.prefersReducedMotion) {
            document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        // Skill bars animation
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const pill = entry.target.closest('.skill-pill');
                    const level = pill.getAttribute('data-level');
                    const fill = entry.target.querySelector('.skill-fill');
                    if (fill) {
                        setTimeout(() => {
                            fill.style.width = level + '%';
                        }, 200);
                    }
                    skillObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.skill-pill').forEach(pill => skillObserver.observe(pill));
    }

    /* --- COUNTERS --- */
    initCounters() {
        if (this.prefersReducedMotion) {
            document.querySelectorAll('.stat-number').forEach(c => {
                c.textContent = c.getAttribute('data-target') + '+';
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    const duration = this.isLargeScreen ? 2500 : 2000;
                    const start = performance.now();

                    const update = (now) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 4);
                        entry.target.textContent = Math.floor(ease * target);
                        if (progress < 1) requestAnimationFrame(update);
                        else entry.target.textContent = target + '+';
                    };

                    requestAnimationFrame(update);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-number').forEach(c => observer.observe(c));
    }

    /* --- BACK TO TOP --- */
    initBackToTop() {
        const btn = document.querySelector('.back-to-top-fixed');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.pageYOffset > 500);
        }, { passive: true });
    }

    /* --- PARALLAX (Optimized for all screens) --- */
    /* --- PARALLAX & 3D TILT --- */
    initParallax() {
        const container = document.getElementById('image-container');
        if (!container) return;

        const card1 = document.getElementById('card-1');
        const card2 = document.getElementById('card-2');
        const frame = container.querySelector('.image-frame');
        const glow = container.querySelector('.image-glow');

        let ticking = false;

        // 1. DESKTOP: Mouse Movement
        container.addEventListener('mousemove', (e) => {
            if (this.isTouch || ticking) return; // Skip if it's a touch device
            window.requestAnimationFrame(() => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                card1.style.transform = `translate(${x * 0.05}px, ${y * 0.05}px)`;
                card2.style.transform = `translate(${-x * 0.05}px, ${-y * 0.05}px)`;
                if (frame) {
                    frame.style.transform = `perspective(1000px) rotateY(${x * 0.15}deg) rotateX(${-y * 0.15}deg)`;
                }
                if (glow) {
                    glow.style.transform = `translate(${-x * 1.5}px, ${-y * 1.5}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }, { passive: true });

        // 2. MOBILE: Gyroscope / Device Orientation
        if (window.DeviceOrientationEvent && this.isTouch) {
            window.addEventListener('deviceorientation', (e) => {
                if (ticking) return;

                // gamma is the left-to-right tilt in degrees, where right is positive
                // beta is the front-to-back tilt in degrees, where front is positive
                let tiltX = e.gamma;
                let tiltY = e.beta;

                // Constrain the values so the image doesn't flip entirely inside out
                if (tiltX > 30) tiltX = 30;
                if (tiltX < -30) tiltX = -30;

                // Assume the user is holding the phone at a 45-degree angle naturally
                let adjustedTiltY = tiltY - 45;
                if (adjustedTiltY > 30) adjustedTiltY = 30;
                if (adjustedTiltY < -30) adjustedTiltY = -30;

                window.requestAnimationFrame(() => {
                    // Multiply by a factor to control the sensitivity
                    card1.style.transform = `translate(${tiltX * 1.5}px, ${adjustedTiltY * 1.5}px)`;
                    card2.style.transform = `translate(${-tiltX * 1.5}px, ${-adjustedTiltY * 1.5}px)`;

                    if (frame) {
                        frame.style.transform = `perspective(1000px) rotateY(${tiltX}deg) rotateX(${-adjustedTiltY}deg)`;
                    }
                    if (glow) {
                        glow.style.transform = `translate(${-tiltX * 2}px, ${-adjustedTiltY * 2}px)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }, { passive: true });
        }

        // Reset elements when mouse leaves or touch ends
        const resetTransforms = () => {
            card1.classList.add('reset-motion');
            card2.classList.add('reset-motion');
            if (frame) frame.classList.add('reset-motion');
            if (glow) glow.classList.add('reset-motion');

            card1.style.transform = '';
            card2.style.transform = '';
            if (frame) frame.style.transform = '';
            if (glow) glow.style.transform = '';

            // Remove the reset-motion class after the transition finishes so it doesn't lag next time
            setTimeout(() => {
                card1.classList.remove('reset-motion');
                card2.classList.remove('reset-motion');
                if (frame) frame.classList.remove('reset-motion');
                if (glow) glow.classList.remove('reset-motion');
            }, 500);
        };

        container.addEventListener('mouseleave', resetTransforms);
        container.addEventListener('touchend', resetTransforms);
    }

    initMobileParallax(container, card1, card2, frame, glow) {
        let ticking = false;
        let gyroEnabled = false;

        const handleOrientation = (e) => {
            if (!gyroEnabled || ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                let gamma = e.gamma || 0;
                let beta = e.beta || 0;
                let normalizedBeta = beta - 60;

                const tiltX = Math.max(-45, Math.min(45, gamma));
                const tiltY = Math.max(-45, Math.min(45, normalizedBeta));

                const sensitivity = this.isLargeScreen ? 1.2 : 0.8;

                card1.style.transform = `translate(${tiltX * sensitivity}px, ${tiltY * sensitivity}px)`;
                card2.style.transform = `translate(${-tiltX * (sensitivity * 0.75)}px, ${-tiltY * (sensitivity * 0.75)}px)`;

                if (frame) {
                    frame.style.transform = `perspective(1000px) rotateY(${tiltX * 0.5}deg) rotateX(${-tiltY * 0.5}deg)`;
                }
                if (glow) {
                    glow.style.transform = `translate(${-tiltX * 1.5}px, ${-tiltY * 1.5}px)`;
                }
                ticking = false;
            });
        };

        // Request permission for iOS 13+
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            const btn = document.createElement('button');
            btn.id = 'enable-gyro';
            btn.innerHTML = '<i class="fas fa-mobile-screen"></i> Enable 3D Motion';
            btn.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);z-index:9999;padding:12px 24px;background:var(--accent-primary);color:#0a0a0a;border:none;border-radius:25px;font-weight:700;font-family:var(--font-display);cursor:pointer;box-shadow:0 4px 20px rgba(0,212,255,0.4);font-size:14px;';

            btn.addEventListener('click', () => {
                DeviceOrientationEvent.requestPermission().then(state => {
                    if (state === 'granted') {
                        gyroEnabled = true;
                        window.addEventListener('deviceorientation', handleOrientation);
                        btn.remove();
                    }
                }).catch(console.error);
            });
            document.body.appendChild(btn);
        } else {
            gyroEnabled = true;
            window.addEventListener('deviceorientation', handleOrientation);
        }

        // Touch fallback
        let touchStartX = 0, touchStartY = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            card1.classList.remove('reset-motion');
            card2.classList.remove('reset-motion');
            if (frame) frame.classList.remove('reset-motion');
            if (glow) glow.classList.remove('reset-motion');
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;

                const deltaX = (touchX - touchStartX) * 0.3;
                const deltaY = (touchY - touchStartY) * 0.3;

                const x = Math.max(-30, Math.min(30, deltaX));
                const y = Math.max(-30, Math.min(30, deltaY));

                card1.style.transform = `translate(${x}px, ${y}px)`;
                card2.style.transform = `translate(${-x * 0.8}px, ${-y * 0.8}px)`;
                if (frame) {
                    frame.style.transform = `perspective(1000px) rotateY(${x * 0.5}deg) rotateX(${-y * 0.5}deg)`;
                }
                if (glow) {
                    glow.style.transform = `translate(${-x * 1.5}px, ${-y * 1.5}px)`;
                }
                ticking = false;
            });
        }, { passive: true });

        container.addEventListener('touchend', () => {
            card1.classList.add('reset-motion');
            card2.classList.add('reset-motion');
            if (frame) frame.classList.add('reset-motion');
            if (glow) glow.classList.add('reset-motion');

            card1.style.transform = '';
            card2.style.transform = '';
            if (frame) frame.style.transform = '';
            if (glow) glow.style.transform = '';
        });
    }

    /* --- HANDLE RESIZE --- */
    handleResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.isLargeScreen = window.innerWidth >= 1920;
                this.is4K = window.innerWidth >= 2560;
                this.isTouch = window.matchMedia('(pointer: coarse)').matches;

                // Reinitialize particles with new screen size
                if (this.particles) {
                    this.initParticles();
                }
            }, 250);
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});