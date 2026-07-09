class CountdownTimer extends HTMLElement {
    connectedCallback() {
        this.targetDate = new Date(this.getAttribute('target-date') || '2026-11-15T12:00:00').getTime();
        this.innerHTML = `
            <style>
                .countdown-wrapper { 
                    text-align: center; 
                    padding: 3rem 1rem; 
                    position: relative; 
                    z-index: 10; 
                }
                .countdown-grid { 
                    display: flex; 
                    justify-content: center; 
                    gap: 2rem; 
                    margin-top: 1rem; 
                }
                .countdown-item { 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                }
                .countdown-ring {
                    width: 95px;
                    height: 95px;
                    border-radius: 50%;
                    border: 1px solid var(--accent-gold);
                    background: rgba(253, 251, 247, 0.9);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 22px rgba(125, 26, 41, 0.04), inset 0 0 15px rgba(223, 177, 91, 0.08);
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                }
                .countdown-ring::before {
                    content: '';
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    right: 3px;
                    bottom: 3px;
                    border: 0.5px dashed rgba(223, 177, 91, 0.3);
                    border-radius: 50%;
                    pointer-events: none;
                }
                .countdown-ring:hover {
                    border-color: var(--primary-crimson);
                    box-shadow: 0 12px 24px rgba(125, 26, 41, 0.12), 0 0 15px rgba(223, 177, 91, 0.25);
                    transform: scale(1.05);
                }
                .countdown-number { 
                    font-family: var(--font-heading); 
                    font-size: 1.8rem; 
                    color: var(--primary-crimson); 
                    font-weight: 400; 
                    line-height: 1;
                }
                .countdown-label { 
                    font-family: var(--font-body);
                    font-size: 0.6rem; 
                    text-transform: uppercase; 
                    letter-spacing: 1.5px; 
                    color: var(--text-muted); 
                    margin-top: 0.2rem;
                }
                @media (max-width: 768px) { 
                    .countdown-wrapper { padding: 2rem 0.5rem; } 
                    .countdown-grid { gap: 1rem; } 
                    .countdown-ring { width: 75px; height: 75px; }
                    .countdown-number { font-size: 1.4rem; }
                    .countdown-label { font-size: 0.5rem; letter-spacing: 1px; }
                }
            </style>
            <section class="countdown-wrapper fade-up">
                <div class="countdown-grid">
                    <div class="countdown-item">
                        <div class="countdown-ring">
                            <div class="countdown-number" id="cd-days">00</div>
                            <div class="countdown-label">Days</div>
                        </div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-ring">
                            <div class="countdown-number" id="cd-hours">00</div>
                            <div class="countdown-label">Hours</div>
                        </div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-ring">
                            <div class="countdown-number" id="cd-mins">00</div>
                            <div class="countdown-label">Mins</div>
                        </div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-ring">
                            <div class="countdown-number" id="cd-secs">00</div>
                            <div class="countdown-label">Secs</div>
                        </div>
                    </div>
                </div>
            </section>
        `;
        this.updateInterval = setInterval(() => this.updateTimer(), 1000);
        this.updateTimer();
    }
    disconnectedCallback() { clearInterval(this.updateInterval); }
    updateTimer() {
        const now = new Date().getTime();
        const distance = this.targetDate - now;
        if (distance < 0) return clearInterval(this.updateInterval);
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const dEl = this.querySelector('#cd-days'); const hEl = this.querySelector('#cd-hours');
        const mEl = this.querySelector('#cd-mins'); const sEl = this.querySelector('#cd-secs');
        if (dEl) dEl.innerText = days < 10 ? '0' + days : days;
        if (hEl) hEl.innerText = hours < 10 ? '0' + hours : hours;
        if (mEl) mEl.innerText = minutes < 10 ? '0' + minutes : minutes;
        if (sEl) sEl.innerText = seconds < 10 ? '0' + seconds : seconds;
    }
}
customElements.define('countdown-timer', CountdownTimer);
