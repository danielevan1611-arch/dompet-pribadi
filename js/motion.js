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

export function showDynamicIslandHUD(iconName, message, accentColor = '#34C759') {
  if (typeof document === 'undefined') return;
  const hud = document.getElementById('dynamicIslandHUD');
  const iconEl = document.getElementById('dynamicIslandIcon');
  const textEl = document.getElementById('dynamicIslandText');

  if (!hud || !textEl) return;

  if (hudTimeout) {
    clearTimeout(hudTimeout);
    hudTimeout = null;
  }

  textEl.textContent = message;
  if (iconEl) {
    iconEl.innerHTML = `<i data-lucide="${iconName || 'check'}" class="w-4 h-4" style="color: ${accentColor}"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }

  hud.classList.remove('hidden');
  hud.classList.remove('opacity-0', '-translate-y-4', 'scale-90');
  hud.classList.add('opacity-100', 'translate-y-0', 'scale-100');

  hudTimeout = setTimeout(() => {
    hud.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
    hud.classList.add('opacity-0', '-translate-y-4', 'scale-90');
    setTimeout(() => {
      hud.classList.add('hidden');
    }, 280);
  }, 2200);
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
