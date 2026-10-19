(function () {
  'use strict';
  var d = document;

  /* ---------- Mobile menu ---------- */
  var header = d.querySelector('.site-header');
  var burger = d.querySelector('.burger');
  function setMenu(open) {
    header.classList.toggle('open', open);
    d.body.classList.toggle('lock', open);
    if (burger) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(!header.classList.contains('open')); });
  }
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  var mpanel = d.getElementById('mpanel');
  if (mpanel) mpanel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1100) setMenu(false); });

  /* ---------- Contact form (Static Forms) ---------- */
  var form = d.getElementById('contact-form');
  if (!form) return;

  // Your Static Forms API key (public by design). Change it here if you ever replace the key.
  var STATIC_FORMS_API_KEY = 'sf_3a04dc96e7bde63712009450';
  var ENDPOINT = 'https://api.staticforms.dev/submit';
  // Set to true while testing to show the technical reason under the form when sending fails.
  var DEBUG = false;

  var msg = d.getElementById('form-msg');
  var btn = d.getElementById('submit-btn');
  var label = d.getElementById('btn-label');
  var success = d.getElementById('success');

  function setSending(on) {
    btn.disabled = on;
    form.classList.toggle('sending', on);
    label.textContent = on ? 'Sending...' : 'Send message';
    form.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  function showSuccess() {
    form.classList.add('done');
    setTimeout(function () {
      form.style.display = 'none';
      success.classList.add('show');
      success.setAttribute('tabindex', '-1');
      success.focus({ preventScroll: true });
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.reset();
    }, 300);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.textContent = '';
    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var phone = form.elements.phone.value.trim();
    var service = form.elements.service.value;
    var text = form.elements.message.value.trim();

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !text) {
      msg.textContent = 'Please add your name, a valid email address and a short message.';
      return;
    }

    setSending(true);

    // Honeypot: real visitors never see this field. If it has a value, it's a bot. Pretend it worked and send nothing.
    if (form.elements.honeypot.value) {
      setTimeout(function () { setSending(false); showSuccess(); }, 1200);
      return;
    }

    var payload = new URLSearchParams({
      apiKey: STATIC_FORMS_API_KEY,
      subject: 'Website enquiry from ' + name + (service ? ' (' + service + ')' : ''),
      name: name,
      email: email,
      message: text,
      honeypot: form.elements.honeypot.value
    });
    if (phone) payload.append('phone', phone);
    if (service) payload.append('interested_in', service);

    // A standard form post avoids the browser preflight check that blocked JSON requests earlier.
    fetch(ENDPOINT, { method: 'POST', body: payload })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || data.success === false) {
            throw new Error(data.message || data.error || ('HTTP ' + res.status));
          }
        });
      })
      .then(function () { setSending(false); showSuccess(); })
      .catch(function (err) {
        console.error('Contact form submission failed:', err);
        setSending(false);
        msg.textContent = 'Sorry, your message could not be sent. Please try again, or email contact@smallnetworks.com.au.';
        if (DEBUG) msg.textContent += ' [Debug: ' + err.message + ']';
      });
  });
})();
