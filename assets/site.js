
document.getElementById('year')?.append(new Date().getFullYear());

const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
menuBtn?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('hidden') === false;
  menuBtn.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('#mobileNav a').forEach(a => a.addEventListener('click', () => {
  mobileNav?.classList.add('hidden');
  menuBtn?.setAttribute('aria-expanded','false');
}));

document.querySelectorAll('[data-wa]').forEach(link => {
  const msg = link.getAttribute('data-wa');
  if (msg) link.href = 'https://api.whatsapp.com/send?phone=558394119581&text=' + encodeURIComponent(msg);
});

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); }
    }), {threshold:.08})
  : null;
document.querySelectorAll('.reveal').forEach(el => observer ? observer.observe(el) : el.classList.add('is-visible'));

document.querySelectorAll('.faq-btn').forEach(btn => btn.addEventListener('click', () => {
  const item = btn.closest('.faq-item');
  item?.classList.toggle('open');
  btn.setAttribute('aria-expanded', item?.classList.contains('open') ? 'true' : 'false');
}));

const heroImg = document.getElementById('heroProjectImage');
const heroLabel = document.getElementById('heroProjectLabel');
document.querySelectorAll('.project-switch').forEach(btn => btn.addEventListener('click', () => {
  if (!heroImg || !heroLabel) return;
  heroImg.src = btn.dataset.image || heroImg.src;
  heroImg.alt = 'Projeto ' + (btn.dataset.label || 'Nexa') + ' em desktop e celular';
  heroLabel.textContent = btn.dataset.label || '';
  document.querySelectorAll('.project-switch').forEach(b => {
    b.classList.remove('bg-[#10233E]','text-white');
    b.classList.add('bg-white','text-slate-600','ring-1','ring-[#E2E7EE]');
  });
  btn.classList.add('bg-[#10233E]','text-white');
  btn.classList.remove('bg-white','text-slate-600','ring-1','ring-[#E2E7EE]');
}));
