document.addEventListener('DOMContentLoaded', () => {

  // --- helper variables for modal accessibility ---
  let lastFocusedElement = null;
  let modalKeyHandler = null;

  const modal = document.getElementById('purchaseModal');
  const closeBtn = document.getElementById('closeModal');

  function getFocusableElements(container){
    return Array.from(container.querySelectorAll('a[href], button:not([disabled]), textarea, input:not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])'))
      .filter(el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);
  }

  function openModal(modalEl){
    lastFocusedElement = document.activeElement;
    modalEl.classList.add('show');
    modalEl.setAttribute('aria-hidden','false');
    modalEl.setAttribute('aria-modal','true');

    // focus first focusable element
    const focusable = getFocusableElements(modalEl);
    if(focusable.length) focusable[0].focus();

    // key handler for Escape and focus trap
    modalKeyHandler = function(e){
      if(e.key === 'Escape'){
        e.preventDefault();
        closeModal(modalEl);
        return;
      }
      if(e.key === 'Tab'){
        const focusables = getFocusableElements(modalEl);
        if(focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length -1];
        if(e.shiftKey){
          if(document.activeElement === first){
            e.preventDefault();
            last.focus();
          }
        } else {
          if(document.activeElement === last){
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', modalKeyHandler);
  }

  function closeModal(modalEl){
    modalEl.classList.remove('show');
    modalEl.setAttribute('aria-hidden','true');
    modalEl.setAttribute('aria-modal','false');
    if(modalKeyHandler) document.removeEventListener('keydown', modalKeyHandler);
    modalKeyHandler = null;
    if(lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
  }

  // Initialize back-to-top control for terms modal (moved out of submit handler)
  (function initBackToTop(){
    const termsCard = document.querySelector('.terms-card');
    const backToTop = document.getElementById('backToTop');
    if (termsCard && backToTop) {
      termsCard.addEventListener('scroll', function() {
        if (termsCard.scrollTop > 400) {
          backToTop.style.display = 'block';
          setTimeout(() => backToTop.classList.add('visible'), 10);
        } else {
          backToTop.classList.remove('visible');
          setTimeout(() => backToTop.style.display = 'none', 300);
        }
      });
    }
  })();

  // Formspree integration - product buttons open modal and populate fields
  document.querySelectorAll('.coffin-btn').forEach(btn => {
    if(!btn.dataset.name) return; // skip if not a product button
    
    btn.addEventListener('click', e => {
      const name = btn.dataset.name;
      const price = btn.dataset.price;

      // Update both hidden inputs and display elements
      modal.querySelectorAll('.prod-name').forEach(el => el.value = name);
      modal.querySelectorAll('.prod-price').forEach(el => el.value = price);
      modal.querySelectorAll('.display-name').forEach(el => el.textContent = name);
      modal.querySelectorAll('.display-price').forEach(el => el.textContent = price);

      // open modal (store opener to restore focus later)
      lastFocusedElement = btn;
      openModal(modal);
    });
  });

  // Close modal via button
  if(closeBtn){
    closeBtn.addEventListener('click', () => closeModal(modal));
  }

  // Also close modal when clicking outside the card
  modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal(modal);
  });

  // Handle form submission with honeypot, reply-to and payment instructions
  const form = document.getElementById('orderForm');
  const formSuccess = document.getElementById('formSuccess');
  if(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // honeypot check
      const hp = form.querySelector('[name="url"]');
      if(hp && hp.value.trim() !== ''){
        // probable bot
        console.warn('Honeypot triggered');
        return;
      }

      // fill reply-to for Formspree
      const emailInput = form.querySelector('input[type="email"]');
      const replyField = document.getElementById('_replyto');
      if(replyField && emailInput) replyField.value = emailInput.value || '';

  // Generate order reference and include in form
  const orderRef = 'BC-' + Date.now();
  const orderRefField = document.getElementById('order_ref');
  if(orderRefField) orderRefField.value = orderRef;

  // If a custom Formspree endpoint is provided in config, use it
  const cfg = window.BC_CONFIG || {};
  if(cfg.FORMSPREE_ENDPOINT) form.action = cfg.FORMSPREE_ENDPOINT;

      // helper: parse price string like 'R$ 119,90' to number 119.90
      function parsePrice(str){
        if(!str) return 0;
        const num = str.replace(/[R$\s\.]/g, '').replace(',', '.');
        return parseFloat(num) || 0;
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: {
            'Accept': 'application/json'
          }
        });

        if(response.ok) {
          // Hide form, show success message and payment instructions
          form.style.display = 'none';
          if(formSuccess) formSuccess.style.display = 'block';

          // Populate order ref and payment info
          const orderRefDisplay = document.getElementById('orderRefDisplay');
          if(orderRefDisplay) orderRefDisplay.textContent = orderRef;

          // Determine price from hidden prod-price field (first one)
          const priceEl = form.querySelector('.prod-price');
          const priceText = priceEl ? priceEl.value : '';
          const pixAmountEl = document.getElementById('pixAmount');
          if(pixAmountEl) pixAmountEl.textContent = priceText || '';

          // PIX key (from config)
          const pixKey = (window.BC_CONFIG && window.BC_CONFIG.PIX_KEY) ? window.BC_CONFIG.PIX_KEY : '00000000-0000-0000-0000-000000000000';
          const pixKeyEl = document.getElementById('pixKey');
          if(pixKeyEl) pixKeyEl.textContent = pixKey;

          // Mercado Pago link: use MERCADO_PAGO_LINK from config if available
          const paypalLink = document.getElementById('paypalLink');
          if(paypalLink){
            const amount = parsePrice(priceText);
            const amt = amount ? amount.toFixed(2) : '';
            const mercadoPagoLink = (window.BC_CONFIG && window.BC_CONFIG.MERCADO_PAGO_LINK) ? window.BC_CONFIG.MERCADO_PAGO_LINK : 'SEU_LINK';
            paypalLink.href = (mercadoPagoLink) ? `https://link.mercadopago.com.br/${mercadoPagoLink}` : 'https://www.mercadopago.com.br/';
          }

          // Copy-to-clipboard handlers
          const copyPixBtn = document.getElementById('copyPix');
          const copyPixPayloadBtn = document.getElementById('copyPixPayload');
          if(copyPixBtn){
            copyPixBtn.addEventListener('click', () => {
              navigator.clipboard.writeText(pixKey).then(() => {
                copyPixBtn.textContent = 'Copiado ✓';
                setTimeout(()=> copyPixBtn.textContent = 'Copiar chave PIX', 2000);
              });
            });
          }
          if(copyPixPayloadBtn){
            copyPixPayloadBtn.addEventListener('click', () => {
              const payload = `PIX: ${pixKey}\nValor: ${priceText || ''}\nReferência: ${orderRef}`;
              navigator.clipboard.writeText(payload).then(() => {
                copyPixPayloadBtn.textContent = 'Copiado ✓';
                setTimeout(()=> copyPixPayloadBtn.textContent = 'Copiar pagamento rápido', 2000);
              });
            });
          }

          form.reset();
        } else {
          throw new Error('Falha ao enviar pedido');
        }
      } catch(error) {
        alert('Erro ao processar pedido. Por favor, tente novamente ou entre em contato por email.');
      }
    });
  }
});