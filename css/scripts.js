// Reveal elements once as they scroll into view, staggered by their position among siblings
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => {
  el.style.setProperty('--i', [...el.parentElement.children].indexOf(el));
  revealObserver.observe(el);
});

// Cursor spotlight on cards
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// Scroll progress bar + active nav link
const progressBar = document.getElementById('scrollProgress');
const navLinks = document.querySelectorAll('.siteNav a');

const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((a) => a.classList.toggle('active', a.dataset.section === entry.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main > section').forEach((s) => sectionObserver.observe(s));

// Experience timeline: vertical page scroll drives the sideways movement (wide screens, motion allowed).
// Otherwise it stays a normal swipeable row.
const experience = document.getElementById('experience');
const timelineTrack = experience.querySelector('.timeline');
const timelineView = experience.querySelector('.timelineWrapper');
const timelineItems = [...experience.querySelectorAll('.timelineItem')];
const pinQuery = window.matchMedia('(min-width: 861px) and (prefers-reduced-motion: no-preference)');
let sidewaysDistance = 0;

const moveTimeline = () => {
  if (!experience.classList.contains('pinned')) return;
  const scrolled = -experience.getBoundingClientRect().top;
  const progress = Math.min(Math.max(scrolled / sidewaysDistance, 0), 1) || 0;
  timelineTrack.style.transform = `translateX(${-progress * sidewaysDistance}px)`;
  highlightTimeline();
};

// The item nearest screen centre is "active"; everything up to it is "passed" (lit rail)
const highlightTimeline = () => {
  const centre = window.innerWidth / 2;
  let nearest = 0;
  let best = Infinity;
  timelineItems.forEach((item, i) => {
    const r = item.getBoundingClientRect();
    const d = Math.abs(r.left + r.width / 2 - centre);
    if (d < best) { best = d; nearest = i; }
  });
  timelineItems.forEach((item, i) => {
    item.classList.toggle('active', i === nearest);
    item.classList.toggle('passed', i <= nearest);
  });
};

const sizeExperience = () => {
  const pin = pinQuery.matches;
  experience.classList.toggle('pinned', pin);
  timelineTrack.style.transform = '';
  if (!pin) {
    experience.style.height = '';
    timelineItems.forEach((item) => item.classList.add('active', 'passed'));
    return;
  }
  sidewaysDistance = Math.max(0, timelineTrack.scrollWidth - timelineView.clientWidth);
  experience.style.height = (window.innerHeight + sidewaysDistance) + 'px';
  moveTimeline();
};

window.addEventListener('scroll', () => {
  requestAnimationFrame(() => { updateProgress(); moveTimeline(); });
}, { passive: true });
window.addEventListener('resize', () => { sizeExperience(); updateProgress(); });
window.addEventListener('load', sizeExperience);
pinQuery.addEventListener('change', sizeExperience);
sizeExperience();
updateProgress();
