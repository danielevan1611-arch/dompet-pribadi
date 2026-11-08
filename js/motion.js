/**
 * DompetKu - Apple Ecosystem Motion & Micro-interactions Engine
 */

export function calculatePillOffset(containerRect, targetRect) {
  if (!containerRect || !targetRect) return { left: 0, width: 0 };
  const left = Math.round(targetRect.left - containerRect.left);
  const width = Math.round(targetRect.width);
  return { left, width };
}

export function formatIndonesianRupiah(amount, prefix = 'Rp ') {
  const numeric = Math.round(Number(amount) || 0);
  return prefix + numeric.toLocaleString('id-ID');
}

export function calculateRollingValue(startVal, endVal, progress) {
  // Apple ease-out expo curve: 1 - Math.pow(2, -10 * progress)
  const clampedProgress = Math.max(0, Math.min(1, progress));
  if (clampedProgress === 0) return startVal;
  if (clampedProgress === 1) return endVal;
  const easeProgress = 1 - Math.pow(2, -10 * clampedProgress);
  return Math.round(startVal + (endVal - startVal) * easeProgress);
}

export function isReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animateNumber(element, startVal, endVal, options = {}) {
  if (!element) return;
  const duration = options.duration || 450;
  const prefix = options.prefix !== undefined ? options.prefix : 'Rp ';
  const suffix = options.suffix || '';
  const sign = options.sign || '';

  if (isReducedMotion() || startVal === endVal) {
    element.textContent = `${sign}${formatIndonesianRupiah(endVal, prefix)}${suffix}`;
    return;
  }

  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentVal = calculateRollingValue(startVal, endVal, progress);
    element.textContent = `${sign}${formatIndonesianRupiah(currentVal, prefix)}${suffix}`;

    if (progress < 1) {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(step);
      }
    } else {
      element.textContent = `${sign}${formatIndonesianRupiah(endVal, prefix)}${suffix}`;
    }
  }

  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(step);
  } else {
    element.textContent = `${sign}${formatIndonesianRupiah(endVal, prefix)}${suffix}`;
  }
}

let hudTimeout = null;

export function showDynamicIslandHUD(iconName, message, accentColor = '#34C759', title = 'Tercatat') {
  if (typeof document === 'undefined') return;
  const hud = document.getElementById('dynamicIslandHUD');
  const iconEl = document.getElementById('dynamicIslandIcon');
  const titleEl = document.getElementById('dynamicIslandTitle');
  const textEl = document.getElementById('dynamicIslandText');

  if (!hud || !textEl) return;

  if (hudTimeout) {
    clearTimeout(hudTimeout);
    hudTimeout = null;
  }

  // Mobile hardware haptic vibration
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([20, 40, 20]);
    } catch (e) {
      // safe fallback
    }
  }

  if (titleEl) {
    titleEl.textContent = title;
    titleEl.style.color = accentColor;
  }
  textEl.textContent = message;

  if (iconEl) {
    const svgs = {
      'check-circle': `<svg class="w-4 h-4 text-[#34C759]" fill="none" stroke="${accentColor}" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      'trash-2': `<svg class="w-4 h-4" fill="none" stroke="${accentColor}" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
      'download': `<svg class="w-4 h-4" fill="none" stroke="${accentColor}" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
      'wallet': `<svg class="w-4 h-4" fill="none" stroke="${accentColor}" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
      'camera': `<svg class="w-4 h-4" fill="none" stroke="${accentColor}" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="4"/></svg>`
    };
    iconEl.innerHTML = svgs[iconName] || `<svg class="w-4 h-4" fill="none" stroke="${accentColor}" viewBox="0 0 24 24" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01"/></svg>`;
  }

  // Infallible CSS activation
  hud.classList.add('hud-visible');

  // Input glow flash
  const quickBar = document.getElementById('quickInput')?.closest('.ios-card');
  if (quickBar) {
    quickBar.classList.add('input-flash-success');
    setTimeout(() => quickBar.classList.remove('input-flash-success'), 1000);
  }

  hudTimeout = setTimeout(() => {
    hud.classList.remove('hud-visible');
  }, 2800);
}

// Global exposure for zero-CORS browser bundle
if (typeof window !== 'undefined') {
  window.DompetMotion = {
    calculatePillOffset,
    formatIndonesianRupiah,
    calculateRollingValue,
    isReducedMotion,
    animateNumber,
    showDynamicIslandHUD
  };
}
