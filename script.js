// Preload winning card images to prevent browser lag and layout flashing during flip animation
(function() {
  const winFront = new Image();
  winFront.src = "images/win-design-22.png";
  
  const winBack = new Image();
  winBack.src = "images/win-design-24.png";
})();

// Helper to check and handle discount expiration (1 hour limit)
function checkDiscountExpiration() {
  const activeDiscount = localStorage.getItem("activeDiscount");
  const discountTimestamp = localStorage.getItem("discountTimestamp");
  
  if (activeDiscount) {
    const oneHour = 1 * 60 * 60 * 1000;
    const isExpired = !discountTimestamp || (Date.now() - parseInt(discountTimestamp) > oneHour);
    
    if (isExpired) {
      // Silently clear discount state without notifying user
      localStorage.removeItem("activeDiscount");
      localStorage.removeItem("discountTimestamp");
      localStorage.removeItem("discountToken");
      
      // Revert challenge page start button text back to normal
      const startChallengeBtn = document.getElementById("start-challenge-btn");
      if (startChallengeBtn) {
        startChallengeBtn.textContent = "BUY";
      }

      // If we are currently on the discount page, immediately redirect to buy.html
      const isDiscountPage = window.location.pathname.includes("discount-d9f2e3a8b4.html") || 
                             window.location.pathname.includes("discount-d9f2e3a8b4");
      if (isDiscountPage) {
        window.location.replace("buy.html");
      }

      // Sync the cleared state to Firestore/RTDB if user is logged in
      if (typeof syncProfileToFirebase === "function" && window.firebaseAuth && window.firebaseAuth.currentUser) {
        syncProfileToFirebase();
      }
    }
  }
  
  // Make sure nav buy link ALWAYS points to regular buy.html as requested
  const navBuyLink = document.getElementById('nav-buy-link');
  if (navBuyLink) {
    navBuyLink.href = "buy.html";
  }
}

// Initialize Lucide Icons
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Check discount expiration on page load
  checkDiscountExpiration();
  // Set periodic check every 10 seconds to silently revoke discount if time limit expires
  setInterval(checkDiscountExpiration, 10000);

  // Note: Tab calculator, wizard, and dashboard initializers 
  // are disabled since those sections have been removed.
  // initCalculator();
  // initWizard();
  // initDashboard();
  initFaq();
  initLogoScroll();
  initNavigationBubble();
  initProductFilters();
  initImageFadeIn();
  initPurchaseButtons();
  initCheckoutPage();
  initDebugPanel();
});

/* ==========================================================================
   Logo Scroll Animation (Morphs from center to top-left on scroll)
   ========================================================================== */
function initLogoScroll() {
  // As requested, the logo animation is now fully handled by CSS on load.
  // It drops down, moves to the left, and stays permanently fixed there.
  // Scroll events no longer affect the logo position.
}

/* ==========================================================================
   Navigation Glass Sliding Bubble logic
   ========================================================================== */
function initNavigationBubble() {
  const stickyNav = document.getElementById('sticky-nav');
  const bubble = document.getElementById('nav-sliding-bubble');
  if (!stickyNav || !bubble) return;

  // Select target active links
  const links = {
    home: document.querySelector('.sticky-nav-links li:first-child a'),
    buy: document.getElementById('nav-buy-link'),
    challenge: document.getElementById('nav-challenge-link')
  };

  const activeNavLinks = [links.home, links.buy, links.challenge].filter(el => el);

  function updateBubblePosition(activeLink) {
    if (!activeLink || !bubble) return;

    let offsetLeft = activeLink.offsetLeft;
    let parent = activeLink.offsetParent;
    while (parent && parent !== stickyNav) {
      offsetLeft += parent.offsetLeft;
      parent = parent.offsetParent;
    }

    const isMobile = window.innerWidth <= 768;
    const paddingX = isMobile ? 10 : 20;
    const bubbleLeft = offsetLeft - (paddingX / 2);
    const bubbleWidth = activeLink.offsetWidth + paddingX;

    // Update style properties
    bubble.style.left = `${bubbleLeft}px`;
    bubble.style.width = `${bubbleWidth}px`;
    bubble.style.opacity = '1';
  }

  function setActiveLink(link) {
    if (!link) return;
    activeNavLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    updateBubblePosition(link);
  }

  // Bind click event to active links (HOME, BUY, CHALLENGE)
  activeNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      setActiveLink(link);
    });
  });

  const path = window.location.pathname;
  const isChallengePage = path.includes('challenge.html') || path.endsWith('/challenge') || path.includes('/challenge.html');
  const isBuyPage = path.includes('buy.html') || path.endsWith('/buy') || path.includes('/buy.html') ||
                    path.includes('discount-d9f2e3a8b4.html') || path.includes('discount-d9f2e3a8b4') ||
                    path.includes('checkout.html') || path.endsWith('/checkout') || path.includes('/checkout.html');
  const isHomePage = !isChallengePage && !isBuyPage;

  // Highlight HOME, CHALLENGE, or BUY on page load based on current page
  if (isChallengePage) {
    setActiveLink(links.challenge);
  } else if (isBuyPage) {
    setActiveLink(links.buy);
  } else {
    setActiveLink(links.home);
  }

  // Recalculate bubble coordinates on window resize
  window.addEventListener('resize', () => {
    const activeLink = document.querySelector('.sticky-nav-link.active');
    if (activeLink) {
      updateBubblePosition(activeLink);
    }
  });

  // Watch for scroll position: if scrolled close to top, reset active link to HOME (only on home page)
  window.addEventListener('scroll', () => {
    if (isHomePage && window.scrollY < 80) {
      const currentActive = document.querySelector('.sticky-nav-link.active');
      if (currentActive !== links.home) {
        setActiveLink(links.home);
      }
    }
  });

  // Make sure it recalculates when the nav bar slides in and transitions end
  stickyNav.addEventListener('transitionend', () => {
    if (stickyNav.classList.contains('visible')) {
      const activeLink = document.querySelector('.sticky-nav-link.active');
      if (activeLink) {
        updateBubblePosition(activeLink);
      }
    }
  });

  // Recalculate a few times during initialization to ensure accurate rendering
  setTimeout(() => {
    const activeLink = document.querySelector('.sticky-nav-link.active');
    if (activeLink) updateBubblePosition(activeLink);
  }, 100);
  setTimeout(() => {
    const activeLink = document.querySelector('.sticky-nav-link.active');
    if (activeLink) updateBubblePosition(activeLink);
  }, 1000);
  setTimeout(() => {
    const activeLink = document.querySelector('.sticky-nav-link.active');
    if (activeLink) updateBubblePosition(activeLink);
  }, 8200); // After the logo intro animation completes and navbar appears
}

/* ==========================================================================
   Smooth Fade-in for Product Images (Prevents slow progressive load line-by-line)
   ========================================================================== */
function initImageFadeIn() {
  const thumbnails = document.querySelectorAll('.buy-product-thumbnail');
  if (thumbnails.length === 0) return;

  thumbnails.forEach(img => {
    const container = img.closest('.buy-product-thumbnail-container');

    function handleLoad() {
      img.classList.add('loaded');
      if (container) {
        container.classList.add('image-loaded');
      }
    }

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', () => {
        if (container) {
          container.classList.add('image-loaded');
        }
      });
    }
  });
}

/* ==========================================================================
   Product Catalog Filters (Category & Price)
   ========================================================================== */
function initProductFilters() {
  const panel = document.querySelector('.buy-products-panel');
  if (!panel) return;

  const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  const priceFromInput = document.getElementById('price-from');
  const priceToInput = document.getElementById('price-to');
  const productCards = document.querySelectorAll('.buy-products-panel .buy-product-card');

  function filterProducts() {
    // 1. Get selected categories
    const selectedCategories = Array.from(categoryCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    // 2. Get price range
    const priceFromVal = (priceFromInput && priceFromInput.value) ? parseFloat(priceFromInput.value) : null;
    const priceToVal = (priceToInput && priceToInput.value) ? parseFloat(priceToInput.value) : null;

    let visibleCount = 0;

    productCards.forEach(card => {
      // Find the title element in the card
      const titleEl = card.querySelector('.buy-product-title');
      if (!titleEl) return;
      const titleText = titleEl.textContent.toLowerCase();

      // Find the price element in the card
      const priceEl = card.querySelector('.buy-product-price');
      if (!priceEl) return;
      const priceText = priceEl.textContent;
      const priceVal = parseFloat(priceText.replace('$', '').trim());

      // Check category match
      let categoryMatch = false;
      if (selectedCategories.length === 0) {
        categoryMatch = true;
      } else {
        categoryMatch = selectedCategories.some(cat => {
          if (cat === 'lucky-premium') return titleText.includes('premium');
          if (cat === 'lucky-raiders') return titleText.includes('raiders');
          if (cat === 'lucky-expedition') return titleText.includes('expedition');
          if (cat === 'lucky-kingdom') return titleText.includes('kingdom');
          return false;
        });
      }

      // Check price match
      let priceMatch = true;
      if (priceFromVal !== null && priceVal < priceFromVal) {
        priceMatch = false;
      }
      if (priceToVal !== null && priceVal > priceToVal) {
        priceMatch = false;
      }

      // Show/Hide Card
      if (categoryMatch && priceMatch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update subtitle count (e.g. "16 PRODUCTS")
    const subtitleEl = document.querySelector('.buy-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = `${visibleCount} ${visibleCount === 1 ? 'PRODUCT' : 'PRODUCTS'}`;
    }
  }

  // Bind change/input event listeners
  categoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', filterProducts);
  });

  if (priceFromInput) {
    priceFromInput.addEventListener('input', filterProducts);
  }
  if (priceToInput) {
    priceToInput.addEventListener('input', filterProducts);
  }

  // Initial filter run on page load
  filterProducts();
}

/* ==========================================================================
   Interactive Cashback Calculator
   ========================================================================== */
function initCalculator() {
  const sliders = document.querySelectorAll('.spend-slider');
  const calcMonthly = document.getElementById('calc-monthly');
  const calcYearly = document.getElementById('calc-yearly');
  const calcTotalSpend = document.getElementById('calc-total-spend');

  if (!calcMonthly || !calcYearly || !calcTotalSpend) return;

  const updateCalculator = () => {
    let totalSpend = 0;

    sliders.forEach(slider => {
      const valSpan = document.getElementById(`val-${slider.id.replace('spend-', '')}`);
      const val = parseFloat(slider.value);
      valSpan.textContent = `$${val.toLocaleString()}`;
      totalSpend += val;
    });

    const cashbackRate = 0.015; // 1.5%
    const monthlyCashback = totalSpend * cashbackRate;
    const yearlyCashback = monthlyCashback * 12;

    calcMonthly.textContent = `$${monthlyCashback.toFixed(2)}`;
    calcYearly.textContent = `$${yearlyCashback.toFixed(2)}`;
    calcTotalSpend.textContent = `$${totalSpend.toLocaleString()}`;
  };

  sliders.forEach(slider => {
    slider.addEventListener('input', updateCalculator);
  });

  // Initial run
  updateCalculator();
}

/* ==========================================================================
   Prequalification Wizard
   ========================================================================== */
let userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: '',
  income: 45000,
  housing: 1200
};

function initWizard() {
  const form1 = document.getElementById('form-step-1');
  const form2 = document.getElementById('form-step-2');
  const btnBack1 = document.getElementById('back-to-step-1');
  const btnActivate = document.getElementById('btn-activate-card');

  if (!form1 || !form2 || !btnBack1 || !btnActivate) return;

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const stepLoading = document.getElementById('step-loading');
  const stepOffer = document.getElementById('step-offer');

  const ind1 = document.getElementById('indicator-1');
  const ind2 = document.getElementById('indicator-2');
  const ind3 = document.getElementById('indicator-3');

  // Step 1 Submit
  form1.addEventListener('submit', (e) => {
    e.preventDefault();
    userData.firstName = document.getElementById('first-name').value;
    userData.lastName = document.getElementById('last-name').value;
    userData.email = document.getElementById('email-address').value;

    step1.classList.remove('active');
    step2.classList.add('active');
    ind1.classList.add('completed');
    ind2.classList.add('active');
  });

  // Back to Step 1
  btnBack1.addEventListener('click', () => {
    step2.classList.remove('active');
    step1.classList.add('active');
    ind1.classList.remove('completed');
    ind2.classList.remove('active');
  });

  // Step 2 Submit (Starts loading prequalification check)
  form2.addEventListener('submit', (e) => {
    e.preventDefault();
    userData.income = parseFloat(document.getElementById('income').value);
    userData.housing = parseFloat(document.getElementById('housing').value);

    step2.classList.remove('active');
    stepLoading.classList.add('active');

    startPrequalificationCheck();
  });

  // Start Simulated Check
  function startPrequalificationCheck() {
    const statusText = document.getElementById('loading-status-text');
    const progressBar = document.getElementById('loading-progress');
    const statuses = [
      'Establishing secure connection to credit bureau databases...',
      'Verifying credit report authenticity and score thresholds...',
      'Analyzing income-to-housing ratios for affordability...',
      'Formatting customized prequalification details...'
    ];

    let progress = 0;
    let statusIdx = 0;

    const interval = setInterval(() => {
      progress += 2;
      progressBar.style.width = `${progress}%`;

      // Update text occasionally
      if (progress === 25) statusIdx = 1;
      if (progress === 55) statusIdx = 2;
      if (progress === 80) statusIdx = 3;
      statusText.textContent = statuses[statusIdx];

      if (progress >= 100) {
        clearInterval(interval);
        showPrequalificationOffer();
      }
    }, 50);
  }

  // Display Offer Step
  function showPrequalificationOffer() {
    stepLoading.classList.remove('active');
    stepOffer.classList.add('active');
    ind2.classList.add('completed');
    ind3.classList.add('active');

    // Populate customized offer
    document.getElementById('offer-user-name').textContent = userData.firstName;

    // Estimate credit limit based on income
    let creditLimit = 1000;
    if (userData.income > 75000) creditLimit = 2500;
    else if (userData.income > 50000) creditLimit = 1500;
    else if (userData.income < 30000) creditLimit = 750;

    document.getElementById('offer-limit').textContent = `$${creditLimit.toLocaleString()}`;

    // Store in global state for dashboard use
    window.preapprovedLimit = creditLimit;
  }

  // Activate Offer & Bind to Dashboard
  btnActivate.addEventListener('click', () => {
    // 1. Update dashboard user info
    const fullName = `${userData.firstName} ${userData.lastName}`.toUpperCase();

    const dashUserName = document.getElementById('dash-user-name');
    if (dashUserName) dashUserName.textContent = `${userData.firstName} ${userData.lastName}`;

    const cardHolderName = document.getElementById('card-holder-name');
    if (cardHolderName) cardHolderName.textContent = fullName;

    // 2. Set limits
    const limit = window.preapprovedLimit || 1000;
    const dashLimit = document.getElementById('dash-limit');
    if (dashLimit) dashLimit.textContent = `$${limit.toLocaleString()}`;

    // Balance starting at $0, available credit = limit
    window.currentBalance = 0;
    window.creditLimit = limit;
    window.availableCredit = limit;
    window.cashbackEarned = 0;

    updateDashboardUI();

    // Reset transactions to empty or clean starting point
    const txList = document.getElementById('transactions-list');
    if (txList) {
      txList.innerHTML = `
        <div class="transaction-row empty-state-tx">
          <div class="tx-icon-wrapper"><i data-lucide="info"></i></div>
          <div class="tx-details">
            <span class="tx-merchant">Welcome Account Promotion</span>
            <span class="tx-date">Active today • Account opened</span>
          </div>
          <div class="tx-amounts">
            <span class="tx-cost">$0.00</span>
            <span class="tx-cb">Earn 1.5% cashback next</span>
          </div>
        </div>
      `;
    }
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // 3. Scroll to Dashboard or show activation success
    const dashboardSection = document.getElementById('portal');
    if (dashboardSection) {
      dashboardSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If portal is removed, update the wizard content to show success
      const offerContainer = document.querySelector('.offer-wizard-content');
      if (offerContainer) {
        offerContainer.innerHTML = `
          <span class="offer-badge" style="background: #10b981; color: white;">✓ CARD ACTIVATED</span>
          <h4 style="margin-top: 16px;">Congratulations, ${userData.firstName}!</h4>
          <p style="font-size: 0.9rem; color: rgba(255,255,255,0.9); margin-top: 8px;">
            Your card has been successfully activated. We are preparing your physical card, and a digital copy has been sent to <strong>${userData.email}</strong>.
          </p>
          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 16px; border-radius: 12px; margin: 16px 0; text-align: left;">
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">Credit Limit</div>
            <div style="font-size: 1.5rem; font-weight: 900; color: #10b981;">$${limit.toLocaleString()}</div>
          </div>
          <p style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">Thank you for choosing Destiny Rewards!</p>
        `;
      }
    }

    // Celebration Confetti
    triggerConfetti();
  });
}

/* ==========================================================================
   Member Portal Dashboard Simulation
   ========================================================================== */
// Starting guest values
window.currentBalance = 142.50;
window.creditLimit = 1000.00;
window.availableCredit = 857.50;
window.cashbackEarned = 24.75;

function initDashboard() {
  const btnRedeem = document.getElementById('btn-redeem-cashback');
  const btnSubmitPayment = document.getElementById('btn-submit-payment');
  const paymentOptions = document.querySelectorAll('.payment-opt-btn');
  const customPayWrapper = document.getElementById('custom-pay-wrapper');

  if (!btnRedeem || !btnSubmitPayment) return;

  // Initialize UI with current values
  updateDashboardUI();

  // Redeem Cashback Action
  btnRedeem.addEventListener('click', () => {
    if (window.cashbackEarned <= 0) {
      alert("You have no cashback rewards available to redeem at this time.");
      return;
    }

    const redemptionAmount = window.cashbackEarned;

    // Subtract from balance
    window.currentBalance = Math.max(0, window.currentBalance - redemptionAmount);
    window.availableCredit = window.creditLimit - window.currentBalance;
    window.cashbackEarned = 0;

    // Update UI
    updateDashboardUI();

    // Trigger visual confetti celebration
    triggerConfetti();

    // Add transaction
    addTransaction("Cashback Redemption Credit", redemptionAmount, true, true);
  });

  // Payment Option Buttons Interaction
  paymentOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      paymentOptions.forEach(opt => opt.classList.remove('active'));
      btn.classList.add('active');

      const amountType = btn.getAttribute('data-amount');
      if (amountType === 'custom') {
        customPayWrapper.style.display = 'flex';
      } else {
        customPayWrapper.style.display = 'none';
      }
    });
  });

  // Submit Payment Action
  btnSubmitPayment.addEventListener('click', () => {
    const activeBtn = document.querySelector('.payment-opt-btn.active');
    const amountType = activeBtn.getAttribute('data-amount');
    let payAmount = 0;

    if (amountType === 'minimum') {
      payAmount = 25.00;
    } else if (amountType === 'full') {
      payAmount = window.currentBalance;
    } else if (amountType === 'custom') {
      const customVal = parseFloat(document.getElementById('custom-pay-amount').value);
      if (isNaN(customVal) || customVal <= 0) {
        alert("Please enter a valid payment amount.");
        return;
      }
      payAmount = customVal;
    }

    if (payAmount > window.currentBalance) {
      alert("Payment amount cannot exceed your current balance.");
      return;
    }

    if (payAmount <= 0) {
      alert("There is no outstanding balance due on this card.");
      return;
    }

    // Process payment
    window.currentBalance -= payAmount;
    window.availableCredit = window.creditLimit - window.currentBalance;

    updateDashboardUI();

    // Add transaction
    addTransaction("Account Payment - Thank You", payAmount, true, false);

    // Show success message
    const successMsg = document.getElementById('payment-success-msg');
    successMsg.style.display = 'flex';

    // Clear custom input field
    document.getElementById('custom-pay-amount').value = '';

    setTimeout(() => {
      successMsg.style.style = '';
      // Smooth fade out
      successMsg.style.transition = 'opacity 0.5s ease';
      successMsg.style.opacity = '0';
      setTimeout(() => {
        successMsg.style.display = 'none';
        successMsg.style.opacity = '1';
      }, 500);
    }, 4000);
  });

  // Quick Action sidebar links scroll
  const dashPayLink = document.getElementById('dash-pay-link');
  if (dashPayLink) {
    dashPayLink.addEventListener('click', (e) => {
      e.preventDefault();
      const payWidget = document.querySelector('.payment-widget-card');
      if (payWidget) payWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  const dashRedeemLink = document.getElementById('dash-redeem-link');
  if (dashRedeemLink) {
    dashRedeemLink.addEventListener('click', (e) => {
      e.preventDefault();
      const cbWidget = document.getElementById('cashback-card-widget');
      if (cbWidget) cbWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  const navPortalBtn = document.getElementById('nav-portal-btn');
  if (navPortalBtn) {
    navPortalBtn.addEventListener('click', () => {
      const portal = document.getElementById('portal');
      if (portal) portal.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// Update dashboard text nodes
function updateDashboardUI() {
  const dashBalance = document.getElementById('dash-balance');
  if (dashBalance) dashBalance.textContent = `$${window.currentBalance.toFixed(2)}`;

  const dashAvailable = document.getElementById('dash-available');
  if (dashAvailable) dashAvailable.textContent = `$${window.availableCredit.toFixed(2)}`;

  const dashCashback = document.getElementById('dash-cashback');
  if (dashCashback) dashCashback.textContent = `$${window.cashbackEarned.toFixed(2)}`;

  // Update dynamic values on buttons
  const optButtons = document.querySelectorAll('.payment-opt-btn');
  optButtons.forEach(btn => {
    const type = btn.getAttribute('data-amount');
    if (type === 'full') {
      btn.textContent = `Full Balance ($${window.currentBalance.toFixed(2)})`;
    }
  });

  // Enable/disable redeem buttons
  const redeemBtn = document.getElementById('btn-redeem-cashback');
  if (redeemBtn) {
    if (window.cashbackEarned <= 0) {
      redeemBtn.classList.add('disabled');
      redeemBtn.style.opacity = '0.5';
      redeemBtn.style.cursor = 'not-allowed';
    } else {
      redeemBtn.classList.remove('disabled');
      redeemBtn.style.opacity = '1';
      redeemBtn.style.cursor = 'pointer';
    }
  }
}

// Add a transaction row dynamically
function addTransaction(merchant, amount, isCredit, isRedemption) {
  const txList = document.getElementById('transactions-list');
  if (!txList) return;

  // Remove empty states if present
  const emptyState = txList.querySelector('.empty-state-tx');
  if (emptyState) {
    emptyState.remove();
  }

  const txRow = document.createElement('div');
  txRow.className = 'transaction-row';
  txRow.style.animation = 'fadeIn 0.5s ease forwards';

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const txIcon = isRedemption ? 'gift' : (isCredit ? 'credit-card' : 'shopping-bag');

  let amountText = '';
  let cashbackText = '';

  if (isRedemption) {
    amountText = `<span class="tx-cost negative">-$${amount.toFixed(2)}</span>`;
    cashbackText = `<span class="tx-cb">Redeemed Rewards</span>`;
  } else if (isCredit) {
    amountText = `<span class="tx-cost negative">-$${amount.toFixed(2)}</span>`;
    cashbackText = `<span class="tx-cb" style="color: #10b981;">Balance Paid</span>`;
  } else {
    amountText = `<span class="tx-cost">$${amount.toFixed(2)}</span>`;
    cashbackText = `<span class="tx-cb">+ $${(amount * 0.015).toFixed(2)} Cashback</span>`;
  }

  txRow.innerHTML = `
    <div class="tx-icon-wrapper"><i data-lucide="${txIcon}"></i></div>
    <div class="tx-details">
      <span class="tx-merchant">${merchant}</span>
      <span class="tx-date">${dateStr} • Simulation Action</span>
    </div>
    <div class="tx-amounts">
      ${amountText}
      ${cashbackText}
    </div>
  `;

  // Insert at the top of the list
  txList.insertBefore(txRow, txList.firstChild);

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ==========================================================================
   Interactive FAQ Accordion
   ========================================================================== */
function initFaq() {
  const faqHeaders = document.querySelectorAll('.faq-accordion-header');

  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.faq-accordion-content');
      const isActive = item.classList.contains('active');

      // Close all other items
      document.querySelectorAll('.faq-accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherContent = otherItem.querySelector('.faq-accordion-content');
          if (otherContent) {
            otherContent.style.maxHeight = null;
          }
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   Canvas Particle Confetti Animation
   ========================================================================== */
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const colors = [
    '#506df6', // Blue
    '#818cf8', // Indigo
    '#f59e0b', // Gold
    '#10b981', // Green
    '#fb7185', // Coral
    '#38bdf8'  // Sky Blue
  ];

  const particles = [];
  const particleCount = 120;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -100 - 10,
      radius: Math.random() * 4 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 5 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5,
      wind: Math.random() * 2 - 1,
      opacity: 1
    });
  }

  let animationId;
  const startTime = Date.now();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeParticles = 0;

    particles.forEach(p => {
      if (p.opacity <= 0) return;

      p.y += p.speed;
      p.x += p.wind;
      p.rotation += p.rotationSpeed;

      // Slow fade near bottom or after 3 seconds
      if (p.y > canvas.height * 0.7) {
        p.opacity -= 0.02;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;

      // Draw rectangular confetti piece
      ctx.fillRect(-p.radius, -p.radius / 2, p.radius * 2, p.radius);
      ctx.restore();

      activeParticles++;
    });

    // Stop animation if no particles are left or 5 seconds have passed
    if (activeParticles > 0 && Date.now() - startTime < 5000) {
      animationId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationId);
    }
  }

  animate();
}

/* ==========================================================================
   Tab Navigation Router
   ========================================================================== */
function switchTab(tabId) {
  // Remove active from all tabs
  document.querySelectorAll('.card-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Remove active from all tab contents
  document.querySelectorAll('.card-tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // Activate selected tab button
  const selectedTab = document.querySelector(`.card-tab[data-tab="${tabId}"]`);
  if (selectedTab) selectedTab.classList.add('active');

  // Activate selected content
  const selectedContent = document.getElementById(`tab-${tabId}`);
  if (selectedContent) selectedContent.classList.add('active');
}

// Bind tabs click event
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.card-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
});

/* ==========================================================================
   Split Challenge Games (Spin Wheel & Reflex Test)
   ========================================================================== */
// Spin Wheel Configuration
const segments = [
  { text: "NEXT TIME", color: "#18181b", textColor: "#ffffff" },      // Black Zinc
  { text: "-5%", color: "#6b8aff", textColor: "#ffffff" },            // Blue
  { text: "NEXT TIME", color: "#ffffff", textColor: "#18181b" },      // White
  { text: "-10%", color: "#6b8aff", textColor: "#ffffff" }            // Blue
];

let currentRotation = 0;
let isSpinning = false;
let cooldownInterval = null;
let jokerOverlayTimeout = null;



// Draw Spin Wheel on canvas with text labels
function drawWheel() {
  const canvas = document.getElementById("wheel-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = width / 2 - 8;

  ctx.clearRect(0, 0, width, height);

  const anglePerSegment = (2 * Math.PI) / segments.length;

  for (let i = 0; i < segments.length; i++) {
    const startAngle = i * anglePerSegment;
    const endAngle = startAngle + anglePerSegment;
    const seg = segments[i];

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    // Border/stroke between segments
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw rotated text label on segment
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + anglePerSegment / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = seg.textColor;
    if (seg.text.includes("%")) {
      ctx.font = "italic 900 24px 'Montserrat', sans-serif";
    } else {
      ctx.font = "italic 900 14px 'Montserrat', sans-serif";
    }
    ctx.fillText(seg.text, 110, 0);
    ctx.restore();
  }

  // Draw outer black border ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#18181b";
  ctx.lineWidth = 6;
  ctx.stroke();

  // Draw inner shine stroke
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 3, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

// Navigation to Purchase Section
function goToBuySection() {
  // Check expiration right before navigating
  checkDiscountExpiration();

  const activeDiscount = localStorage.getItem("activeDiscount");
  if (activeDiscount && (activeDiscount.includes("-5%") || activeDiscount.includes("-10%"))) {
    // Increment discount buy clicks count
    let clicks = parseInt(localStorage.getItem("discountBuyClicks") || "0");
    clicks += 1;
    localStorage.setItem("discountBuyClicks", clicks);

    // Sync stats UI
    if (typeof updateSpinStatsUI === "function") {
      updateSpinStatsUI();
    }

    // Sync to databases
    if (typeof syncProfileToFirebase === "function") {
      syncProfileToFirebase();
    }

    let token = localStorage.getItem("discountToken");
    if (!token) {
      const chars = 'abcdef0123456789';
      token = '';
      for (let i = 0; i < 24; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      localStorage.setItem("discountToken", token);
    }

    window.location.href = `discount-d9f2e3a8b4.html?token=${token}`;
  } else {
    window.location.href = "buy.html";
  }
}

// Triggers the 3D playing card flip animation with custom win/lose textures
function triggerCardAnimation(isWin, discountText) {
  const frontImg = document.getElementById("joker-card-front-img");
  const backImg = document.getElementById("joker-card-back-img");
  
  if (frontImg && backImg) {
    if (isWin) {
      frontImg.src = "images/win-design-22.png";
      backImg.src = "images/win-design-24.png";
    } else {
      frontImg.src = "images/joker-design-22.png";
      backImg.src = "images/joker-design-24.png";
    }
  }

  const jokerOverlay = document.getElementById("joker-next-time-overlay");
  const cardWrapper = jokerOverlay ? jokerOverlay.querySelector(".joker-card-3d-wrapper") : null;
  if (cardWrapper) {
    if (isWin) {
      cardWrapper.classList.add("win-gold-glow");
    } else {
      cardWrapper.classList.remove("win-gold-glow");
    }
  }

  if (jokerOverlay) {
    jokerOverlay.classList.remove("active");
    void jokerOverlay.offsetWidth; // Force CSS repaint to re-trigger the CSS keyframe animation
    jokerOverlay.classList.add("active");

    // Custom card swipe sound for entry is now triggered early in spinWheel() for better sync

    // Play card flip sound at flip 1 start (1.5s)
    setTimeout(() => {
      const flipSound1 = new Audio('images/card-flip.mp3');
      flipSound1.play().catch(err => console.log("Flip 1 sound blocked:", err));
    }, 1500);

    // Play card flip sound at flip 2 start (4.3s)
    setTimeout(() => {
      const flipSound2 = new Audio('images/card-flip.mp3');
      flipSound2.play().catch(err => console.log("Flip 2 sound blocked:", err));
    }, 4300);

    // Play custom card swipe sound at start of exit slide (5.6s)
    setTimeout(() => {
      const swipeSoundEnd = new Audio('images/card-swipe.mp3');
      swipeSoundEnd.play().catch(err => console.log("End swipe sound blocked:", err));
    }, 5600);

    if (jokerOverlayTimeout) clearTimeout(jokerOverlayTimeout);
    jokerOverlayTimeout = setTimeout(() => {
      closeJokerOverlay();
    }, 6300);
  }
}

// Spin Wheel interaction
function spinWheel() {
  if (isSpinning) return;

  const cooldownEnd = localStorage.getItem("spinCooldownEnd");
  if (cooldownEnd && Date.now() < parseInt(cooldownEnd)) {
    alert("You can only spin the wheel once every 24 hours!");
    return;
  }

  isSpinning = true;

  // Set 24 hour cooldown (24 * 60 * 60 * 1000 = 86400000 ms)
  localStorage.setItem("spinCooldownEnd", Date.now() + 24 * 60 * 60 * 1000);
  initCooldown();

  const canvas = document.getElementById("wheel-canvas");
  const spinBtn = document.getElementById("spin-btn");
  if (!canvas || !spinBtn) return;

  // Disable button
  spinBtn.disabled = true;
  spinBtn.style.opacity = "0.5";
  spinBtn.style.cursor = "not-allowed";

  // Weighted random selector based on relative weights:
  // -10% has a weight of 30 (24% normalized probability)
  // -5% has a weight of 45 (36% normalized probability)
  // NEXT TIME (total) has a weight of 50 (25 each, 40% normalized probability)
  // Total sum of weights is 125.
  const r = Math.random() * 100;
  let winningSegmentIndex = 0;
  if (r < 20) {
    winningSegmentIndex = 0;
  } else if (r < 56) {
    winningSegmentIndex = 1;
  } else if (r < 76) {
    winningSegmentIndex = 2;
  } else {
    winningSegmentIndex = 3;
  }

  // Choose a random landing degree inside the target segment's 90-degree slice
  // Adding 15 degrees padding on borders to center it inside the slice
  const minAngle = winningSegmentIndex * 90 + 15;
  const maxAngle = (winningSegmentIndex + 1) * 90 - 15;
  const targetLandingDegrees = minAngle + Math.random() * (maxAngle - minAngle);

  // Calculate the target rotation angle to align the pointer (270 degrees) to the landing degrees
  const fullRotations = 5 + Math.floor(Math.random() * 3);
  const targetAngleInRotation = (270 - targetLandingDegrees + 360) % 360;
  
  // Calculate relative degrees to rotate, compensating for the current rotation mod 360
  const currentRotationMod = currentRotation % 360;
  const degreesToRotate = (targetAngleInRotation - currentRotationMod + 360) % 360;
  
  const totalRotationDegrees = currentRotation + (fullRotations * 360) + degreesToRotate;
  currentRotation = totalRotationDegrees;

  // Apply CSS rotation transform
  canvas.style.transform = "rotate(" + totalRotationDegrees + "deg)";

  // Pre-trigger the swipe sound 300ms before the wheel stops to fix sync
  setTimeout(() => {
    const swipeSoundStart = new Audio('images/card-swipe.mp3');
    swipeSoundStart.play().catch(err => console.log("Start swipe sound blocked:", err));
  }, 5700);

  setTimeout(() => {
    isSpinning = false;

    // Only re-enable the button if no active cooldown
    const cooldownEnd = localStorage.getItem("spinCooldownEnd");
    if (!cooldownEnd || Date.now() >= parseInt(cooldownEnd)) {
      spinBtn.disabled = false;
      spinBtn.style.opacity = "1";
      spinBtn.style.cursor = "pointer";
    } else {
      spinBtn.disabled = true;
      spinBtn.style.opacity = "0.5";
      spinBtn.style.cursor = "not-allowed";
    }

    // Read the winning segment
    const winningSegment = segments[winningSegmentIndex];

    // Record the spin event
    recordSpin(winningSegment.text);

    // Handle reward and custom alerts
    if (winningSegment.text.includes("%")) {
      // Trigger visual rewards only on win
      triggerConfetti();

      const discountText = winningSegment.text;
      
      // Save discount, timestamp, and secure token to localStorage
      localStorage.setItem("activeDiscount", discountText);
      localStorage.setItem("discountTimestamp", Date.now().toString());
      
      const chars = 'abcdef0123456789';
      let token = '';
      for (let i = 0; i < 24; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      localStorage.setItem("discountToken", token);
      
      // Update Buy button text immediately
      const startChallengeBtn = document.getElementById("start-challenge-btn");
      if (startChallengeBtn) {
        startChallengeBtn.textContent = "BUY WITH " + discountText + " DISCOUNT";
      }
      
      // Keep nav link pointing to standard buy.html
      const navBuyLink = document.getElementById('nav-buy-link');
      if (navBuyLink) {
        navBuyLink.href = "buy.html";
      }

      // Sync the new discount details to Firestore & RTDB immediately
      if (typeof syncProfileToFirebase === "function") {
        syncProfileToFirebase();
      }

      if (typeof addTransaction === "function") {
        addTransaction(`Lucky Spin: ${discountText} Discount`, 0.00, true, true);
      }

      // Trigger the 3D Win Card flip animation (will alert when finished)
      triggerCardAnimation(true, discountText);
    } else {
      // Landed on "NEXT TIME"
      localStorage.removeItem("activeDiscount");
      const startChallengeBtn = document.getElementById("start-challenge-btn");
      if (startChallengeBtn) {
        startChallengeBtn.textContent = "BUY";
      }
      
      const laughAudio = new Audio('images/joker-laugh.mp3?v=2');
      laughAudio.play().catch(err => console.log("Audio play blocked/failed:", err));
      
      // Trigger the 3D Lose Card flip animation
      triggerCardAnimation(false);
    }
  }, 6000);
}

// Record a spin to local storage and sync to databases
function recordSpin(rewardText) {
  // 1. Update localStorage
  let lifetimeSpins = parseInt(localStorage.getItem("lifetimeSpins") || "0");
  lifetimeSpins += 1;
  localStorage.setItem("lifetimeSpins", lifetimeSpins);
  
  let spins = JSON.parse(localStorage.getItem("spinHistory") || "[]");
  const newSpin = {
    timestamp: new Date().toISOString(),
    reward: rewardText
  };
  spins.push(newSpin);
  localStorage.setItem("spinHistory", JSON.stringify(spins));
  
  // 2. Update stats UI
  updateSpinStatsUI();
  
  // 3. Sync to databases
  syncProfileToFirebase();
}

// Render the spin history and lifetime spins counter in the UI
function updateSpinStatsUI() {
  const countEl = document.getElementById("lifetime-spins-count");
  const listEl = document.getElementById("spin-history-list");
  if (!countEl || !listEl) return;
  
  const lifetimeSpins = localStorage.getItem("lifetimeSpins") || "0";
  countEl.textContent = lifetimeSpins;

  const clicksEl = document.getElementById("discount-buy-clicks-count");
  if (clicksEl) {
    clicksEl.textContent = localStorage.getItem("discountBuyClicks") || "0";
  }
  
  const spins = JSON.parse(localStorage.getItem("spinHistory") || "[]");
  if (spins.length === 0) {
    listEl.innerHTML = `<div style="color: rgba(255,255,255,0.4); font-style: italic; text-align: center; padding: 10px 0;">No spins yet. Try your luck!</div>`;
    return;
  }
  
  // Display recent spins (newest first)
  const spinsToShow = [...spins].reverse();
  listEl.innerHTML = spinsToShow.map(spin => {
    const date = new Date(spin.timestamp);
    const dateStr = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isWin = spin.reward.includes("%");
    const badgeColor = isWin ? "#6b8aff" : "rgba(255,255,255,0.15)";
    const textColor = isWin ? "#ffffff" : "rgba(255,255,255,0.6)";
    
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); width: 100%;">
        <span style="color: rgba(255,255,255,0.5); font-family: sans-serif; font-size: 0.75rem;">${dateStr}</span>
        <span style="background: ${badgeColor}; color: ${textColor}; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem; min-width: 80px; text-align: center; font-family: 'Montserrat', sans-serif;">
          ${spin.reward}
        </span>
      </div>
    `;
  }).join("");
}

// 24-Hour Cooldown Timer Functions
function updateCooldownTimer() {
  const timerEl = document.getElementById("cooldown-timer");
  const spinBtn = document.getElementById("spin-btn");
  const startChallengeBtn = document.getElementById("start-challenge-btn");
  if (!timerEl) return;

  const cooldownEnd = localStorage.getItem("spinCooldownEnd");
  if (!cooldownEnd) {
    timerEl.style.visibility = "hidden";
    timerEl.innerHTML = "&nbsp;";
    if (spinBtn) {
      spinBtn.disabled = false;
      spinBtn.style.opacity = "1";
      spinBtn.style.cursor = "pointer";
      spinBtn.innerHTML = "SPIN";
    }
    if (startChallengeBtn) {
      startChallengeBtn.textContent = "BUY";
    }
    localStorage.removeItem("activeDiscount");
    return;
  }

  const timeLeft = parseInt(cooldownEnd) - Date.now();
  if (timeLeft <= 0) {
    localStorage.removeItem("spinCooldownEnd");
    localStorage.removeItem("activeDiscount");
    timerEl.style.visibility = "hidden";
    timerEl.innerHTML = "&nbsp;";
    if (spinBtn) {
      spinBtn.disabled = false;
      spinBtn.style.opacity = "1";
      spinBtn.style.cursor = "pointer";
      spinBtn.innerHTML = "SPIN";
    }
    if (startChallengeBtn) {
      startChallengeBtn.textContent = "BUY";
    }
    if (cooldownInterval) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
    }
    return;
  }

  const hours = Math.floor(timeLeft / (3600 * 1000));
  const minutes = Math.floor((timeLeft % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

  const pad = (num) => String(num).padStart(2, '0');
  
  timerEl.style.visibility = "visible";
  timerEl.innerHTML = "NEXT SPIN IN: <span style=\"font-family: 'Montserrat', sans-serif; font-weight: 900; letter-spacing: 1px;\">" + pad(hours) + ":" + pad(minutes) + ":" + pad(seconds) + "</span>";

  // Disable button if not currently spinning but cooldown is active
  if (spinBtn) {
    if (!isSpinning) {
      spinBtn.disabled = true;
      spinBtn.style.opacity = "0.5";
      spinBtn.style.cursor = "not-allowed";
    }
    // Set lock icon inside the spin button
    spinBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; display: block; margin: 0 auto; color: #18181b;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
  }

  // Update Buy Button with active discount if exists
  if (startChallengeBtn) {
    const activeDiscount = localStorage.getItem("activeDiscount");
    if (activeDiscount) {
      startChallengeBtn.textContent = "BUY WITH " + activeDiscount + " DISCOUNT";
    } else {
      startChallengeBtn.textContent = "BUY";
    }
  }
}

function initCooldown() {
  updateCooldownTimer();
  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownInterval = setInterval(updateCooldownTimer, 1000);
}

// Auto-initialize Spin Wheel when loaded
document.addEventListener("DOMContentLoaded", () => {
  drawWheel();
  initCooldown();
  initProfileWidget();
});


/* ==========================================================================
   Bidding Simulation (Bid Tab)
   ========================================================================== */
let bidPrices = {
  1: 120.00,
  2: 250.00
};

function placeBid(itemId, increment) {
  // Check if user has cashback to bid with
  if (window.cashbackEarned < increment) {
    alert(`You need at least $${increment.toFixed(2)} in Cashback Rewards to place this bid. Go to the "GET FOR FREE" tab to activate your card and earn cashback!`);
    return;
  }

  // Deduct from cashback
  window.cashbackEarned -= increment;
  updateDashboardUI();

  // Increase high bid
  bidPrices[itemId] += increment;
  document.getElementById(`bid-price-${itemId}`).textContent = `$${bidPrices[itemId].toFixed(2)}`;

  // Add auction activity to recent transactions
  const itemName = itemId === 1 ? "Spider-Man PS5 Bundle" : "NYC Skyline VIP Tour";
  addTransaction(`Bid on ${itemName}`, increment, false, false);

  // Trigger small success message
  alert(`Bid placed successfully! You are now the highest bidder at $${bidPrices[itemId].toFixed(2)}.`);
}

/* ==========================================================================
   Sticky Navigation Scroll Trigger
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.querySelector('.hero-video-section');
  const stickyNav = document.getElementById('sticky-nav');
  const logoContainer = document.querySelector('.brand-logo-glass-container');
  const secondLayer = document.getElementById('second-layer');

  if (heroSection && stickyNav) {
    let logoSettled = false;

    const handleScroll = () => {
      // Only show the navigation bar if the logo has settled in its final place
      if (!logoSettled) {
        stickyNav.classList.remove('visible');
        return;
      }

      // Show navigation bar when the second layer reaches/passes the top of the viewport
      if (secondLayer) {
        const rect = secondLayer.getBoundingClientRect();
        if (rect.top <= 5) {
          stickyNav.classList.add('visible');
        } else {
          stickyNav.classList.remove('visible');
        }
      } else {
        // Fallback if secondLayer doesn't exist
        const heroHeight = heroSection.offsetHeight;
        if (window.scrollY > heroHeight - 100) {
          stickyNav.classList.add('visible');
        } else {
          stickyNav.classList.remove('visible');
        }
      }
    };

    // Track when logo reaches its final position (after 8 seconds intro animation)
    if (logoContainer) {
      logoContainer.addEventListener('animationend', (e) => {
        if (e.animationName === 'introLogoContainer') {
          logoSettled = true;
          handleScroll();
        }
      });
    }

    // Fallback timer (8 seconds) in case of animation cancelation or tab inactive delay
    setTimeout(() => {
      if (!logoSettled) {
        logoSettled = true;
        handleScroll();
      }
    }, 8000);

    window.addEventListener('scroll', handleScroll);
    // Initial run in case of reload page at scroll position
    handleScroll();
  }

  // Liquid Glass Side Message Panel Logic
  const sidePanel = document.getElementById('side-message-panel');
  const backdrop = document.getElementById('modal-backdrop');
  const closeBtn = document.getElementById('close-side-message');
  const bidLink = document.getElementById('nav-bid-link');
  const freeLink = document.getElementById('nav-free-link');
  let autoCloseTimer;

  const showSideMessage = (e, type = 'bid') => {
    if (e) e.preventDefault();
    
    // Dynamically update the image source and alt text inside the modal
    const modalImg = sidePanel ? sidePanel.querySelector('.modal-image-only') : null;
    if (modalImg) {
      if (type === 'free') {
        modalImg.src = 'images/free_unavailable.png';
        modalImg.alt = 'Free Section Coming Soon';
      } else {
        modalImg.src = 'images/bid_unavailable.png';
        modalImg.alt = 'Bid Section Coming Soon';
      }
    }

    if (sidePanel) sidePanel.classList.add('active');
    if (backdrop) backdrop.classList.add('active');

    // Auto-close after 7 seconds
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
      closeSideMessage();
    }, 7000);
  };

  const closeSideMessage = (e) => {
    if (e) e.stopPropagation();
    if (sidePanel) sidePanel.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
  };

  if (bidLink) bidLink.addEventListener('click', (e) => showSideMessage(e, 'bid'));
  if (freeLink) freeLink.addEventListener('click', (e) => showSideMessage(e, 'free'));

  if (closeBtn) closeBtn.addEventListener('click', closeSideMessage);
  if (backdrop) backdrop.addEventListener('click', closeSideMessage);

  // Format price inputs to .00 on blur
  const priceFrom = document.getElementById('price-from');
  const priceTo = document.getElementById('price-to');
  
  const formatPrice = (e) => {
    let value = e.target.value.trim();
    if (value !== "") {
      let num = parseFloat(value);
      if (!isNaN(num)) {
        e.target.value = num.toFixed(2);
      }
    }
  };

  if (priceFrom) priceFrom.addEventListener('blur', formatPrice);
  if (priceTo) priceTo.addEventListener('blur', formatPrice);
});




/* ==========================================================================
   User Profile Widget (Name, 5-Digit ID, Logo Upload & Google Sign-In)
   ========================================================================== */

// Helper to draw custom Google initial avatars
function generateGoogleAvatar(initial, bgColor) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  
  // Draw colored background circle
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(64, 64, 64, 0, 2 * Math.PI);
  ctx.fill();
  
  // Draw initial letter
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px 'Roboto', 'Arial', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initial.toUpperCase(), 64, 64);
  
  return canvas.toDataURL("image/png");
}

function handleLoggedInUser(user) {
  const name = user.displayName || (user.email ? user.email.split('@')[0] : "User");
  const email = user.email || "";
  // Use user's real Google photo URL or generate initial avatar
  const photoURL = user.photoURL || generateGoogleAvatar(name.charAt(0), "#1a73e8");

  // Show a loading text on sign-in button
  const signInBtn = document.getElementById("google-signin-btn") || document.getElementById("buy-google-signin-btn");
  if (signInBtn) {
    signInBtn.disabled = true;
    signInBtn.style.opacity = "0.7";
    const btnText = signInBtn.querySelector(".google-btn-text") || signInBtn.querySelector("span");
    if (btnText) btnText.textContent = "Completing sign-in...";
  }

  // Sequential database check with fast 1.5s timeout fallback
  const checkUserRef = () => {
    const dbPromise = new Promise((resolve, reject) => {
      // Step 1: Check Cloud Firestore
      if (window.db && window.doc && window.getDoc) {
        window.getDoc(window.doc(window.db, "users", user.uid))
          .then(docSnap => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.userId) {
                console.log("Firestore found existing user data:", data);
                resolve(data);
                return;
              }
            }
            reject(new Error("No Firestore user ID"));
          })
          .catch(err => {
            console.warn("Firestore check skipped/failed, trying Realtime Database. Error:", err);
            // Step 2: Fallback to Realtime Database
            if (window.rtdb && window.rtdbGet && window.rtdbRef) {
              window.rtdbGet(window.rtdbRef(window.rtdb, "users/" + user.uid))
                .then(snapshot => {
                  if (snapshot.exists()) {
                    const data = snapshot.val();
                    if (data && data.userId) {
                      console.log("RTDB found existing user data:", data);
                      resolve(data);
                      return;
                    }
                  }
                  reject(new Error("No RTDB user ID"));
                })
                .catch(reject);
            } else {
              reject(new Error("RTDB not available"));
            }
          });
      } else if (window.rtdb && window.rtdbGet && window.rtdbRef) {
        // Firestore not loaded, try RTDB directly
        window.rtdbGet(window.rtdbRef(window.rtdb, "users/" + user.uid))
          .then(snapshot => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              if (data && data.userId) {
                console.log("RTDB found existing user data:", data);
                resolve(data);
                return;
              }
            }
            reject(new Error("No RTDB user ID"));
          })
          .catch(reject);
      } else {
        reject(new Error("No databases available"));
      }
    });

    // Add a fast 1.5-second timeout to database reads so login responds instantly
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database lookup timeout")), 1500)
    );

    return Promise.race([dbPromise, timeoutPromise]);
  };

  return checkUserRef()
    .then(userDataFromDb => {
      console.log("Reusing existing User ID:", userDataFromDb.userId);
      const spins = userDataFromDb.spins || [];
      const lifetimeSpins = userDataFromDb.lifetimeSpins || 0;
      const discountBuyClicks = userDataFromDb.discountBuyClicks || 0;
      localStorage.setItem("lifetimeSpins", lifetimeSpins);
      localStorage.setItem("spinHistory", JSON.stringify(spins));
      localStorage.setItem("discountBuyClicks", discountBuyClicks);
      
      const activeDiscount = userDataFromDb.activeDiscount || null;
      const discountTimestamp = userDataFromDb.discountTimestamp || null;
      const discountToken = userDataFromDb.discountToken || null;
      
      if (activeDiscount && discountTimestamp) {
        localStorage.setItem("activeDiscount", activeDiscount);
        localStorage.setItem("discountTimestamp", discountTimestamp);
        if (discountToken) {
          localStorage.setItem("discountToken", discountToken);
        } else {
          localStorage.removeItem("discountToken");
        }
      } else {
        localStorage.removeItem("activeDiscount");
        localStorage.removeItem("discountTimestamp");
        localStorage.removeItem("discountToken");
      }
      
      checkDiscountExpiration();
      
      const alias = userDataFromDb.username || name;
      const gName = userDataFromDb.name || name;
      return { isNew: false, id: userDataFromDb.userId, dbName: alias, gName: gName, dbPhoto: userDataFromDb.photoURL };
    })
    .catch(err => {
      console.warn("Database lookup resolved empty/timed out. Generating user profile:", err);
      const newRandomId = Math.floor(10000 + Math.random() * 90000);
      return { isNew: true, id: newRandomId, dbName: name, gName: name, dbPhoto: photoURL };
    })
    .then((result) => {
      if (signInBtn) {
        signInBtn.disabled = false;
        signInBtn.style.opacity = "1";
        const btnText = signInBtn.querySelector(".google-btn-text");
        if (btnText) btnText.textContent = "Sign up with Google";
      }

      // Auto-complete login immediately so user is signed in with Google seamlessly on all pages
      completeLogin(user, result.id, result.dbName || name, result.gName || name, result.dbPhoto || photoURL);
    })
    .catch(err => {
      console.error("Error completing user login:", err);
      // Fallback: Ensure user is still logged in locally even on unexpected error
      const fallbackId = Math.floor(10000 + Math.random() * 90000);
      completeLogin(user, fallbackId, name, name, photoURL);
    });
}

function showProfileSetupGate(user, finalId, defaultName, defaultPhotoURL) {
  const signupGate = document.getElementById("signup-gate");
  const profileSetupGate = document.getElementById("profile-setup-gate");
  const usernameInput = document.getElementById("setup-username-input");
  const continueBtn = document.getElementById("setup-continue-btn");
  const avatarImg = document.getElementById("setup-avatar-img");
  const avatarIcon = document.getElementById("setup-avatar-icon");
  const avatarUpload = document.getElementById("setup-avatar-upload");
  const avatarInput = document.getElementById("setup-avatar-input");
  
  if (signupGate) signupGate.style.display = "none";
  if (profileSetupGate) profileSetupGate.style.display = "flex";
  
  if (usernameInput && defaultName) {
    const cleanName = defaultName.replace(/[^a-zA-Z0-9_.-]/g, "").toLowerCase();
    usernameInput.value = cleanName;
  }
  
  let currentPhotoURL = defaultPhotoURL;
  if (currentPhotoURL && avatarImg && avatarIcon) {
    avatarImg.src = currentPhotoURL;
    avatarImg.style.display = "block";
    avatarIcon.style.display = "none";
  }

  // Handle avatar upload in setup screen
  if (avatarUpload && avatarInput) {
    // Remove old listener if re-entering
    const newAvatarUpload = avatarUpload.cloneNode(true);
    avatarUpload.parentNode.replaceChild(newAvatarUpload, avatarUpload);
    
    newAvatarUpload.addEventListener("click", () => {
      avatarInput.click();
    });
    
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          alert("Please upload an image file!");
          return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
          currentPhotoURL = event.target.result;
          const newImg = document.getElementById("setup-avatar-img");
          const newIcon = document.getElementById("setup-avatar-icon");
          if (newImg && newIcon) {
            newImg.src = currentPhotoURL;
            newImg.style.display = "block";
            newIcon.style.display = "none";
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Handle continue button
  if (continueBtn) {
    const newContinueBtn = continueBtn.cloneNode(true);
    continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);
    
    newContinueBtn.addEventListener("click", () => {
      const chosenName = document.getElementById("setup-username-input").value.trim();
      const errorSpan = document.getElementById("setup-username-error");
      
      if (!chosenName) {
        if (errorSpan) {
          errorSpan.textContent = "Username cannot be empty!";
          errorSpan.style.display = "block";
        }
        return;
      }

      // Regex validation (Letters, numbers, _, -, and . only)
      const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
      if (!usernameRegex.test(chosenName)) {
        if (errorSpan) {
          errorSpan.textContent = "Only letters, numbers, _, -, and . allowed!";
          errorSpan.style.display = "block";
        }
        return;
      }

      if (chosenName.length < 3 || chosenName.length > 20) {
        if (errorSpan) {
          errorSpan.textContent = "Username must be between 3 and 20 characters!";
          errorSpan.style.display = "block";
        }
        return;
      }
      
      newContinueBtn.disabled = true;
      newContinueBtn.textContent = "Checking...";
      
      const usernameLower = chosenName.toLowerCase();
      
      // Check Cloud Firestore for username availability (case-insensitive check, resolves instantly)
      if (window.db && window.doc && window.getDoc && window.setDoc) {
        window.getDoc(window.doc(window.db, "usernames", usernameLower))
          .then(docSnap => {
            if (docSnap.exists() && docSnap.data().userId !== finalId) {
              // Username taken by someone else
              if (errorSpan) {
                errorSpan.textContent = "Username is already taken!";
                errorSpan.style.display = "block";
              }
              newContinueBtn.disabled = false;
              newContinueBtn.textContent = "CONTINUE TO WHEEL";
            } else {
              // Username available or already ours
              if (errorSpan) errorSpan.style.display = "none";
              // Claim it in Firestore registry
              window.setDoc(window.doc(window.db, "usernames", usernameLower), { userId: finalId })
                .then(() => {
                  // Also set it in Realtime Database as a secondary non-blocking write
                  if (window.rtdb && window.rtdbRef && window.rtdbSet) {
                    window.rtdbSet(window.rtdbRef(window.rtdb, "usernames/" + usernameLower), finalId)
                      .catch(err => console.warn("RTDB username sync skipped/failed:", err));
                  }
                  if (profileSetupGate) profileSetupGate.style.display = "none";
                  completeLogin(user, finalId, chosenName, defaultName, currentPhotoURL);
                })
                .catch(err => {
                  console.error("Failed to claim username in Firestore:", err);
                  if (errorSpan) {
                    errorSpan.textContent = "Error reserving username: " + err.message;
                    errorSpan.style.display = "block";
                  }
                  newContinueBtn.disabled = false;
                  newContinueBtn.textContent = "CONTINUE TO WHEEL";
                });
            }
          })
          .catch(err => {
            console.error("Error checking username in Firestore:", err);
            if (errorSpan) {
              errorSpan.textContent = "Error checking username: " + err.message;
              errorSpan.style.display = "block";
            }
            newContinueBtn.disabled = false;
            newContinueBtn.textContent = "CONTINUE TO WHEEL";
          });
      } else {
        // Fallback if Firestore not loaded
        if (profileSetupGate) profileSetupGate.style.display = "none";
        completeLogin(user, finalId, chosenName, defaultName, currentPhotoURL);
      }
    });
  }
}

function completeLogin(user, finalId, chosenName, googleName, chosenPhotoURL) {
  // Save to localStorage
  localStorage.setItem("profileName", chosenName);
  localStorage.setItem("profileGoogleName", googleName);
  localStorage.setItem("profileLogo", chosenPhotoURL);
  localStorage.setItem("profileId", "ID: " + finalId);
  localStorage.setItem("profileIsLoggedIn", "true");

  const spins = JSON.parse(localStorage.getItem("spinHistory") || "[]");
  const lifetimeSpins = parseInt(localStorage.getItem("lifetimeSpins") || "0");
  const discountBuyClicks = parseInt(localStorage.getItem("discountBuyClicks") || "0");

  const email = user.email || "";

  const activeDiscount = localStorage.getItem("activeDiscount") || null;
  const discountTimestamp = localStorage.getItem("discountTimestamp") || null;
  const discountToken = localStorage.getItem("discountToken") || null;

  // Save profile details to Cloud Firestore
  if (window.db && window.doc && window.setDoc) {
    window.setDoc(window.doc(window.db, "users", user.uid), {
      name: googleName || "",
      username: chosenName,
      email: email,
      userId: finalId,
      photoURL: chosenPhotoURL,
      updatedAt: new Date().toISOString(),
      lifetimeSpins: lifetimeSpins,
      spins: spins,
      discountBuyClicks: discountBuyClicks,
      activeDiscount: activeDiscount,
      discountTimestamp: discountTimestamp,
      discountToken: discountToken
    }, { merge: true })
    .then(() => console.log("User details synced to Firestore successfully"))
    .catch(err => console.warn("Firestore sync failed:", err));
  }

  // Save profile details to Realtime Database
  if (window.rtdb && window.rtdbRef && window.rtdbSet) {
    window.rtdbSet(window.rtdbRef(window.rtdb, "users/" + user.uid), {
      name: googleName || "",
      username: chosenName,
      email: email,
      userId: finalId,
      photoURL: chosenPhotoURL,
      updatedAt: new Date().toISOString(),
      lifetimeSpins: lifetimeSpins,
      spins: spins,
      discountBuyClicks: discountBuyClicks,
      activeDiscount: activeDiscount,
      discountTimestamp: discountTimestamp,
      discountToken: discountToken
    })
    .then(() => console.log("User details synced to Realtime Database successfully"))
    .catch(err => console.warn("Realtime Database sync failed:", err));
  }

  // Show Wheel UI and Celebrate
  const container = document.getElementById("challenge-container");
  const profileWidget = document.querySelector(".user-profile-widget");
  const signupGate = document.getElementById("signup-gate");
  const profileSetupGate = document.getElementById("profile-setup-gate");
  
  if (container) container.classList.remove("logged-out");
  if (profileWidget) profileWidget.style.display = "flex";
  if (signupGate) signupGate.style.display = "none";
  if (profileSetupGate) profileSetupGate.style.display = "none";

  initProfileWidget();
  triggerConfetti();
}

function showGoogleLogin() {
  if (!window.signInWithPopup || !window.firebaseAuth || !window.firebaseProvider) {
    console.error("Firebase Auth SDK not fully loaded yet or Popup is unsupported.");
    alert("Firebase Auth SDK is loading, please try again in a moment.");
    return;
  }

  const signInBtn = document.getElementById("google-signin-btn") || document.getElementById("buy-google-signin-btn");
  if (signInBtn) {
    signInBtn.disabled = true;
    signInBtn.style.opacity = "0.7";
    const btnText = signInBtn.querySelector(".google-btn-text") || signInBtn.querySelector("span");
    if (btnText) btnText.textContent = "Opening Google popup...";
  }

  window.signInWithPopup(window.firebaseAuth, window.firebaseProvider)
    .then((result) => {
      if (!result || !result.user) {
        // No result returned (e.g. user closed the popup without signing in)
        if (signInBtn) {
          signInBtn.disabled = false;
          signInBtn.style.opacity = "1";
          const btnText = signInBtn.querySelector(".google-btn-text") || signInBtn.querySelector("span");
          if (btnText) {
            btnText.textContent = signInBtn.id === "buy-google-signin-btn" ? "Sign in with Google" : "Sign up with Google";
          }
        }
        return;
      }
      console.log("Popup login successful! User:", result.user);
      handleLoggedInUser(result.user);
    })
    .catch((error) => {
      console.error("Firebase Google Popup Auth failed:", error);
      alert("Google Sign-In failed: " + error.message);
      if (signInBtn) {
        signInBtn.disabled = false;
        signInBtn.style.opacity = "1";
        const btnText = signInBtn.querySelector(".google-btn-text") || signInBtn.querySelector("span");
        if (btnText) {
          btnText.textContent = signInBtn.id === "buy-google-signin-btn" ? "Sign in with Google" : "Sign up with Google";
        }
      }
    });
}

function handleRedirectResult() {
  if (!window.getRedirectResult || !window.firebaseAuth) return;

  window.getRedirectResult(window.firebaseAuth)
    .then((result) => {
      if (!result || !result.user) {
        // No redirect result (e.g. loaded page normally without just logging in)
        return;
      }

      console.log("Redirect login successful! User:", result.user);
      handleLoggedInUser(result.user);
    })
    .catch((error) => {
      console.error("Redirect sign-in resolution failed:", error);
      alert("Sign-in failed: " + error.message);
    });
}

function logoutGoogle() {
  const username = localStorage.getItem("profileName") || "Guest";
  const avatarUrl = localStorage.getItem("profileLogo") || "";

  // Create backdrop container
  const backdrop = document.createElement("div");
  backdrop.id = "custom-logout-modal-backdrop";
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  // Create modal content panel
  const modal = document.createElement("div");
  modal.style.cssText = `
    background: rgba(30, 8, 8, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    padding: 35px 30px;
    max-width: 420px;
    width: 88%;
    text-align: center;
    transform: scale(0.8);
    transition: transform 0.3s cubic-bezier(0.34, 1.6, 0.64, 1);
    box-sizing: border-box;
  `;

  // Add content HTML
  modal.innerHTML = `
    <!-- Header Row: SIGN OUT text on the left, Red Icon on the right (both smaller) -->
    <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 22px;">
      <h3 style="font-family: 'Montserrat', sans-serif; font-weight: 900; font-size: 1.22rem; color: #ffffff; margin: 0; letter-spacing: 0.5px; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">SIGN OUT</h3>
      <div style="width: 38px; height: 38px; background: rgba(239, 68, 68, 0.15); border: 1.5px solid rgba(239, 68, 68, 0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ef4444; flex-shrink: 0;">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </div>
    </div>
    
    <!-- Profile preview container (Glass style: Centered layout with avatar in the middle) -->
    <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; padding: 18px 24px; margin: 0 auto 22px auto; max-width: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 10px 30px rgba(0, 0, 0, 0.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-sizing: border-box; width: 100%;">
      <!-- Profile Logo/Avatar in the middle -->
      <img src="${avatarUrl}" alt="Profile Logo" style="width: 82px; height: 82px; border-radius: 50%; border: 2.5px solid rgba(255, 255, 255, 0.18); object-fit: cover; margin-bottom: 12px; box-shadow: 0 5px 12px rgba(0,0,0,0.45); flex-shrink: 0;">
      <!-- Username centered below the logo -->
      <span style="font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 1.12rem; color: #ffffff; letter-spacing: 0.3px; text-align: center; word-break: break-all; width: 100%;" title="${username}">${username}</span>
    </div>

    <p style="font-family: 'Montserrat', sans-serif; font-size: 0.95rem; color: rgba(255, 255, 255, 0.65); margin: 0 0 28px 0; line-height: 1.6; font-weight: 500;">Are you sure you want to sign out from your account?</p>
    <div style="display: flex; gap: 14px; justify-content: center; width: 100%;">
      <button id="logout-confirm-cancel" style="flex: 1; background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.9); border: 1.5px solid rgba(255, 255, 255, 0.15); padding: 13px 20px; border-radius: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s ease; font-family: 'Montserrat', sans-serif; font-size: 0.88rem; letter-spacing: 0.5px;">CANCEL</button>
      <button id="logout-confirm-yes" style="flex: 1; background: linear-gradient(135deg, #ef4444, #b91c1c); color: #ffffff; border: none; padding: 13px 20px; border-radius: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s ease; font-family: 'Montserrat', sans-serif; font-size: 0.88rem; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.35);">SIGN OUT</button>
    </div>
  `;

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // Trigger animations after insertion
  setTimeout(() => {
    backdrop.style.opacity = "1";
    modal.style.transform = "scale(1)";
  }, 10);

  // Close modal function
  function closeModal() {
    backdrop.style.opacity = "0";
    modal.style.transform = "scale(0.8)";
    setTimeout(() => {
      backdrop.remove();
    }, 300);
  }

  // Event Listeners
  const cancelBtn = backdrop.querySelector("#logout-confirm-cancel");
  const confirmBtn = backdrop.querySelector("#logout-confirm-yes");

  cancelBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  // Adding hover effects for buttons
  cancelBtn.addEventListener("mouseenter", () => {
    cancelBtn.style.background = "rgba(255, 255, 255, 0.15)";
    cancelBtn.style.borderColor = "rgba(255, 255, 255, 0.25)";
  });
  cancelBtn.addEventListener("mouseleave", () => {
    cancelBtn.style.background = "rgba(255, 255, 255, 0.08)";
    cancelBtn.style.borderColor = "rgba(255, 255, 255, 0.15)";
  });

  confirmBtn.addEventListener("mouseenter", () => {
    confirmBtn.style.transform = "translateY(-1px)";
    confirmBtn.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.5)";
  });
  confirmBtn.addEventListener("mouseleave", () => {
    confirmBtn.style.transform = "translateY(0)";
    confirmBtn.style.boxShadow = "0 4px 15px rgba(239, 68, 68, 0.35)";
  });

  confirmBtn.addEventListener("click", () => {
    // Perform log out operations
    if (window.signOut && window.firebaseAuth) {
      window.signOut(window.firebaseAuth).catch((err) => {
        console.error("Firebase Sign-Out Error:", err);
      });
    }
    localStorage.removeItem("profileIsLoggedIn");
    localStorage.removeItem("profileName");
    localStorage.removeItem("profileGoogleName");
    localStorage.removeItem("profileLogo");
    localStorage.removeItem("profileId");
    localStorage.removeItem("lifetimeSpins");
    localStorage.removeItem("spinHistory");
    localStorage.removeItem("discountBuyClicks");
    localStorage.removeItem("activeDiscount");
    localStorage.removeItem("discountTimestamp");
    localStorage.removeItem("discountToken");

    // Refresh UI
    initProfileWidget();
    
    // Close modal
    closeModal();
  });
}

function syncProfileToFirebase() {
  if (!window.firebaseAuth || !window.firebaseAuth.currentUser) {
    console.warn("Cannot sync to Firebase: User is not logged in.");
    return;
  }
  const user = window.firebaseAuth.currentUser;
  const name = localStorage.getItem("profileGoogleName") || user.displayName || "";
  const username = localStorage.getItem("profileName") || "";
  const photoURL = localStorage.getItem("profileLogo") || "";
  const rawId = localStorage.getItem("profileId") || "";
  const finalId = rawId.replace("ID: ", "").trim();

  const spins = JSON.parse(localStorage.getItem("spinHistory") || "[]");
  const lifetimeSpins = parseInt(localStorage.getItem("lifetimeSpins") || "0");
  const discountBuyClicks = parseInt(localStorage.getItem("discountBuyClicks") || "0");

  const activeDiscount = localStorage.getItem("activeDiscount") || null;
  const discountTimestamp = localStorage.getItem("discountTimestamp") || null;
  const discountToken = localStorage.getItem("discountToken") || null;

  // Save profile details to Cloud Firestore
  if (window.db && window.doc && window.setDoc) {
    window.setDoc(window.doc(window.db, "users", user.uid), {
      name: name,
      username: username,
      photoURL: photoURL,
      userId: finalId,
      updatedAt: new Date().toISOString(),
      lifetimeSpins: lifetimeSpins,
      spins: spins,
      discountBuyClicks: discountBuyClicks,
      activeDiscount: activeDiscount,
      discountTimestamp: discountTimestamp,
      discountToken: discountToken
    }, { merge: true })
    .then(() => console.log("Profile successfully updated in Cloud Firestore"))
    .catch(err => console.error("Firestore sync failed:", err));
  }

  // Save profile details to Realtime Database
  if (window.rtdb && window.rtdbRef && window.rtdbSet) {
    window.rtdbSet(window.rtdbRef(window.rtdb, "users/" + user.uid), {
      name: name,
      username: username,
      photoURL: photoURL,
      userId: finalId,
      updatedAt: new Date().toISOString(),
      lifetimeSpins: lifetimeSpins,
      spins: spins,
      discountBuyClicks: discountBuyClicks,
      activeDiscount: activeDiscount,
      discountTimestamp: discountTimestamp,
      discountToken: discountToken
    })
    .then(() => console.log("Profile successfully updated in Realtime Database"))
    .catch(err => console.error("Realtime Database sync failed:", err));
  }

  // Update Auth Profile photoURL
  if (window.updateProfile && user && photoURL) {
    window.updateProfile(user, { photoURL: photoURL })
      .then(() => console.log("Firebase Auth user profile photoURL updated successfully"))
      .catch(err => console.warn("Failed to update Firebase Auth user profile photoURL:", err));
  }
}

function initProfileWidget() {
  const isLoggedIn = localStorage.getItem("profileIsLoggedIn") === "true";
  const signupGate = document.getElementById("signup-gate");
  const container = document.getElementById("challenge-container");
  const profileWidget = document.querySelector(".user-profile-widget");

  // Handle Challenge Page Widget States
  if (profileWidget || container || signupGate) {
    if (!isLoggedIn) {
      if (container) container.classList.add("logged-out");
      if (signupGate) signupGate.style.display = "flex";
      if (profileWidget) profileWidget.style.display = "none";
    } else {
      if (container) container.classList.remove("logged-out");
      if (signupGate) signupGate.style.display = "none";
      if (profileWidget) profileWidget.style.display = "flex";
    }
  }

  // Refresh Spin Stats UI (only if logged in)
  if (isLoggedIn && typeof updateSpinStatsUI === "function") {
    updateSpinStatsUI();
  }

  const storedName = localStorage.getItem("profileName") || "Guest";
  const storedId = localStorage.getItem("profileId") || "ID: -----";
  const storedLogo = localStorage.getItem("profileLogo");

  // Handle Challenge Page values (only if logged in)
  if (isLoggedIn) {
    const nameEl = document.getElementById("profile-name");
    const idEl = document.getElementById("profile-id");
    if (nameEl) {
      nameEl.textContent = storedName;
      nameEl.title = "";
    }
    if (idEl) {
      idEl.textContent = storedId;
    }

    const avatarImg = document.getElementById("profile-avatar-img");
    const placeholderSvg = document.getElementById("profile-avatar-placeholder");
    const avatarContainer = document.getElementById("profile-avatar-container");
    const fileInput = document.getElementById("profile-avatar-input");

    if (storedLogo && avatarImg && placeholderSvg) {
      avatarImg.onerror = null;
      avatarImg.onerror = () => {
        console.warn("Google profile photo blocked or failed to load. Using initials avatar fallback.");
        avatarImg.onerror = null;
        const fallbackLogo = generateGoogleAvatar(storedName.charAt(0), "#1a73e8");
        avatarImg.src = fallbackLogo;
        localStorage.setItem("profileLogo", fallbackLogo);
        syncProfileToFirebase();
      };
      avatarImg.src = storedLogo;
      avatarImg.style.display = "block";
      placeholderSvg.style.display = "none";
    } else if (avatarImg && placeholderSvg) {
      avatarImg.style.display = "none";
      placeholderSvg.style.display = "block";
    }

    // Handle click on logout button
    const logoutBtn = document.getElementById("profile-logout-btn");
    if (logoutBtn && !logoutBtn.dataset.listened) {
      logoutBtn.dataset.listened = "true";
      logoutBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        logoutGoogle();
      });
    }

    // Handle single click (file upload) vs double click (logout)
    if (avatarContainer && fileInput && !avatarContainer.dataset.listened) {
      avatarContainer.dataset.listened = "true";
      let clickTimer = null;
      
      avatarContainer.addEventListener("click", (e) => {
        e.preventDefault();
        if (clickTimer) {
          clearTimeout(clickTimer);
          clickTimer = null;
          return;
        }
        clickTimer = setTimeout(() => {
          clickTimer = null;
          fileInput.click();
        }, 250);
      });

      avatarContainer.addEventListener("dblclick", (e) => {
        e.preventDefault();
        if (clickTimer) {
          clearTimeout(clickTimer);
          clickTimer = null;
        }
        logoutGoogle();
      });

      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          if (!file.type.startsWith("image/")) {
            alert("Please upload an image file!");
            return;
          }

          const reader = new FileReader();
          reader.onload = function(event) {
            const base64Data = event.target.result;
            try {
              localStorage.setItem("profileLogo", base64Data);
              if (avatarImg && placeholderSvg) {
                avatarImg.src = base64Data;
                avatarImg.style.display = "block";
                placeholderSvg.style.display = "none";
              }
              syncProfileToFirebase();
            } catch (err) {
              console.error("Failed to save image to localStorage:", err);
              alert("Image is too large! Please upload a smaller image under 2MB.");
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  // Handle Buy Page Profile Widget States & Values (independent of page routing)
  const buyProfileWidget = document.getElementById("buy-profile-widget");
  if (buyProfileWidget) {
    const buyLoggedOut = document.getElementById("buy-logged-out-state");
    const buyLoggedIn = document.getElementById("buy-logged-in-state");
    const buyName = document.getElementById("buy-profile-name");
    const buyId = document.getElementById("buy-profile-id");
    const buyAvatarImg = document.getElementById("buy-profile-avatar-img");
    const buySigninBtn = document.getElementById("buy-google-signin-btn");
    const buyLogoutBtn = document.getElementById("buy-profile-logout");

    if (!isLoggedIn) {
      if (buyLoggedOut) buyLoggedOut.style.display = "flex";
      if (buyLoggedIn) buyLoggedIn.style.display = "none";

      if (buySigninBtn && !buySigninBtn.dataset.listened) {
        buySigninBtn.dataset.listened = "true";
        buySigninBtn.addEventListener("click", (e) => {
          e.preventDefault();
          showGoogleLogin();
        });
      }
    } else {
      if (buyLoggedOut) buyLoggedOut.style.display = "none";
      if (buyLoggedIn) buyLoggedIn.style.display = "flex";

      if (buyName) buyName.textContent = storedName;
      if (buyId) buyId.textContent = storedId;

      if (buyAvatarImg && storedLogo) {
        buyAvatarImg.onerror = null;
        buyAvatarImg.onerror = () => {
          buyAvatarImg.onerror = null;
          const fallbackLogo = generateGoogleAvatar(storedName.charAt(0), "#1a73e8");
          buyAvatarImg.src = fallbackLogo;
        };
        buyAvatarImg.src = storedLogo;
      }

      if (buyLogoutBtn && !buyLogoutBtn.dataset.listened) {
        buyLogoutBtn.dataset.listened = "true";
        buyLogoutBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          logoutGoogle();
        });
      }
    }
  }
}

// Bind Google sign-in button listener
document.addEventListener("DOMContentLoaded", () => {
  const signInButtons = document.querySelectorAll("#google-signin-btn, #buy-google-signin-btn");
  signInButtons.forEach(btn => {
    if (!btn.dataset.listened) {
      btn.dataset.listened = "true";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        showGoogleLogin();
      });
    }
  });

  // Handle Firebase redirect result (if returning from Google authentication)
  handleRedirectResult();

  // Initialize event song background music if on challenge page
  const isChallengePage = window.location.pathname.includes('challenge.html') || 
                          window.location.pathname.endsWith('/challenge') || 
                          window.location.pathname.includes('/challenge.html');
  if (isChallengePage) {
    initEventSong();
  }
});

// Event Song Audio initialization
let eventSong = null;

function initEventSong() {
  eventSong = new Audio('images/song-of-event.mp3?v=1');
  eventSong.loop = true;

  // Try to autoplay
  const playPromise = eventSong.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log("Autoplay started successfully");
      updateSpeakerBtnUI(true);
    }).catch(err => {
      console.warn("Autoplay blocked by browser. Music will start on user interaction.", err);
      updateSpeakerBtnUI(false);
      
      // Auto-start on first user interaction with the document
      const startMusicOnInteraction = () => {
        if (eventSong && eventSong.paused) {
          eventSong.play().then(() => {
            updateSpeakerBtnUI(true);
          }).catch(e => console.log("Failed to start on interaction:", e));
        }
        document.removeEventListener('click', startMusicOnInteraction);
        document.removeEventListener('keydown', startMusicOnInteraction);
      };
      document.addEventListener('click', startMusicOnInteraction);
      document.addEventListener('keydown', startMusicOnInteraction);
    });
  }
}

function toggleEventSong() {
  if (!eventSong) return;
  
  if (eventSong.paused) {
    eventSong.play()
      .then(() => updateSpeakerBtnUI(true))
      .catch(err => console.log("Playback failed:", err));
  } else {
    eventSong.pause();
    updateSpeakerBtnUI(false);
  }
}

function updateSpeakerBtnUI(isPlaying) {
  const btn = document.getElementById("speaker-toggle");
  const onIcon = document.getElementById("speaker-on-icon");
  const offIcon = document.getElementById("speaker-off-icon");
  if (!btn || !onIcon || !offIcon) return;

  if (isPlaying) {
    btn.classList.remove("muted");
    onIcon.style.display = "block";
    offIcon.style.display = "none";
  } else {
    btn.classList.add("muted");
    onIcon.style.display = "none";
    offIcon.style.display = "block";
  }
}

// Function to remove black background from the Joker card image using flood fill
function prepareJokerCardImage() {
  const imgElement = document.querySelector('.joker-swipe-img');
  if (!imgElement) return;

  const tempImg = new Image();
  tempImg.src = imgElement.src;
  tempImg.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = tempImg.width;
    const h = tempImg.height;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(tempImg, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // BFS Flood fill to mark black background pixels starting from borders
    const visited = new Uint8Array(w * h);
    const queue = [];

    const isNearBlack = (x, y) => {
      const idx = (y * w + x) * 4;
      // Use higher tolerance to catch compression artifacts
      return data[idx] < 50 && data[idx + 1] < 50 && data[idx + 2] < 50;
    };

    // Add borders to queue
    for (let x = 0; x < w; x++) {
      if (isNearBlack(x, 0)) { queue.push(x, 0); visited[x] = 1; }
      if (isNearBlack(x, h - 1)) { queue.push(x, h - 1); visited[(h - 1) * w + x] = 1; }
    }
    for (let y = 1; y < h - 1; y++) {
      if (isNearBlack(0, y)) { queue.push(0, y); visited[y * w] = 1; }
      if (isNearBlack(w - 1, y)) { queue.push(w - 1, y); visited[y * w + w - 1] = 1; }
    }

    let head = 0;
    const dx = [1, -1, 0, 0];
    const dy = [0, 0, 1, -1];

    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];

      for (let i = 0; i < 4; i++) {
        const nx = cx + dx[i];
        const ny = cy + dy[i];

        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nidx = ny * w + nx;
          if (!visited[nidx] && isNearBlack(nx, ny)) {
            visited[nidx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }

    // Apply transparency to outer background pixels and calculate crop bounding box
    let minX = w, minY = h, maxX = 0, maxY = 0;
    let hasContent = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const pixelStart = idx * 4;
        if (visited[idx]) {
          data[pixelStart + 3] = 0; // Transparent
        } else {
          if (data[pixelStart + 3] > 0) {
            hasContent = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    if (hasContent && minX < maxX && minY < maxY) {
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = maxX - minX + 1;
      croppedCanvas.height = maxY - minY + 1;
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.drawImage(canvas, minX, minY, croppedCanvas.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height);
      imgElement.src = croppedCanvas.toDataURL('image/png');
    } else {
      imgElement.src = canvas.toDataURL('image/png');
    }
  };
}

function processCardImage(imgUrl, imgElementId, isWhiteBg) {
  const imgElement = document.getElementById(imgElementId);
  if (!imgElement) return;

  const tempImg = new Image();
  tempImg.crossOrigin = "anonymous";
  tempImg.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = tempImg.width;
    const h = tempImg.height;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(tempImg, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // BFS Flood fill starting from borders
    const visited = new Uint8Array(w * h);
    const queue = [];

    const isBackground = (x, y) => {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (isWhiteBg) {
        // White background threshold: R, G, B > 200 (covers grey edges too)
        return r > 200 && g > 200 && b > 200;
      } else {
        // Black background threshold: R, G, B < 80 (covers compression/vignette noise)
        return r < 80 && g < 80 && b < 80;
      }
    };

    // Add borders to queue
    for (let x = 0; x < w; x++) {
      if (isBackground(x, 0)) { queue.push(x, 0); visited[x] = 1; }
      if (isBackground(x, h - 1)) { queue.push(x, h - 1); visited[(h - 1) * w + x] = 1; }
    }
    for (let y = 1; y < h - 1; y++) {
      if (isBackground(0, y)) { queue.push(0, y); visited[y * w] = 1; }
      if (isBackground(w - 1, y)) { queue.push(w - 1, y); visited[y * w + w - 1] = 1; }
    }

    let head = 0;
    const dx = [1, -1, 0, 0];
    const dy = [0, 0, 1, -1];

    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];

      for (let i = 0; i < 4; i++) {
        const nx = cx + dx[i];
        const ny = cy + dy[i];

        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nidx = ny * w + nx;
          if (!visited[nidx] && isBackground(nx, ny)) {
            visited[nidx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }

    // Apply transparency to visited background pixels and compute card bounds
    let minX = w, minY = h, maxX = 0, maxY = 0;
    let hasContent = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const pixelStart = idx * 4;
        if (visited[idx]) {
          data[pixelStart + 3] = 0; // Set transparent
        } else {
          if (data[pixelStart + 3] > 0) {
            hasContent = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    if (hasContent && minX < maxX && minY < maxY) {
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = maxX - minX + 1;
      croppedCanvas.height = maxY - minY + 1;
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.drawImage(canvas, minX, minY, croppedCanvas.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height);
      imgElement.src = croppedCanvas.toDataURL('image/png');
    } else {
      imgElement.src = canvas.toDataURL('image/png');
    }
  };
  tempImg.src = imgUrl;
}

function prepareJokerCardImages() {
  processCardImage('images/joker-design-22.png', 'joker-card-front-img', true);
  processCardImage('images/joker-design-24.png', 'joker-card-back-img', false);
}

function closeJokerOverlay() {
  const overlay = document.getElementById("joker-next-time-overlay");
  if (overlay) {
    overlay.classList.remove("active");
  }
  if (jokerOverlayTimeout) {
    clearTimeout(jokerOverlayTimeout);
    jokerOverlayTimeout = null;
  }
}

// Joker Swipe-Down Overlay dismiss event listeners
document.addEventListener("DOMContentLoaded", () => {
  // prepareJokerCardImages(); // Disabled since PNGs are pre-cropped with transparent backgrounds to avoid tainted canvas CORS errors.

  const overlay = document.getElementById("joker-next-time-overlay");
  if (overlay) {
    // Click card / screen background to close early
    overlay.addEventListener("click", () => {
      closeJokerOverlay();
    });
    // Keydown Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("active")) {
        closeJokerOverlay();
      }
    });
  }
});

// Scroll-driven transition for phone mockup frame and notification panels inside second-layer
document.addEventListener("DOMContentLoaded", () => {
  const secondLayer = document.getElementById("second-layer");
  const phoneFrame = document.querySelector(".phone-frame-mockup");
  const notificationCard = document.getElementById("phone-notification");
  const leftPlaceholder = document.getElementById("phone-left-placeholder");
  const rightPlaceholder = document.getElementById("phone-right-placeholder");
  const rightNotificationCard = document.getElementById("phone-right-notification");
  const stickyTitle = document.getElementById("scroll-sticky-title");
 
  if (secondLayer && phoneFrame) {
    const handlePhoneScroll = () => {
      const rect = secondLayer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
 
      // Start transition when section top touches bottom of viewport
      const startScroll = viewportHeight;
      // Complete transition when section top is 15% from top of viewport
      const endScroll = viewportHeight * 0.15;
 
      // Calculate phone zoom progress and clamp between 0 and 1
      let progress = (startScroll - rect.top) / (startScroll - endScroll);
      progress = Math.max(0, Math.min(1, progress));
 
      phoneFrame.style.setProperty('--scroll-progress', progress.toFixed(3));
 
      // Calculate overall container scroll progress (0 when sticky starts, 1 when sticky ends)
      const stickyEnd = rect.height - viewportHeight;
      const currentScroll = -rect.top;
      let cardProgress = currentScroll / stickyEnd;
      cardProgress = Math.max(0, Math.min(1, cardProgress));

      // Animate the sticky title "UNLOCK YOUR NEXT ADVENTURE" in sync with the phone mockup
      if (stickyTitle) {
        let titleOpacity = 1.0;
        
        // Hide instantly when it reaches progress 0.85 or sticky phase
        if (progress >= 0.85 || cardProgress > 0) {
          titleOpacity = 0;
        }
        
        stickyTitle.style.opacity = titleOpacity.toFixed(3);
        stickyTitle.style.visibility = titleOpacity > 0 ? "visible" : "hidden";
        
        const vh = window.innerHeight / 100;
        // Translate exactly with the phone mockup (75vh translation) and apply the exact same scale
        const translateY = 75 * (1 - progress) * vh;
        const scale = 0.8 + 0.2 * progress;
        stickyTitle.style.transform = `translateX(-50%) translateY(${translateY}px) scale(${scale})`;
      }


      // Phase 1 (cardProgress between 0.05 and 0.25): Show Left BUY card and Right Slideshow card
      if (notificationCard && rightPlaceholder) {
        if (cardProgress >= 0.05 && cardProgress <= 0.25) {
          notificationCard.classList.add("active");
          rightPlaceholder.classList.add("active");
        } else {
          notificationCard.classList.remove("active");
          rightPlaceholder.classList.remove("active");
        }
      }
 
      // Phase 2 (cardProgress between 0.30 and 0.50): Show Right CHECK OUT message card and Left Binance card
      if (rightNotificationCard && leftPlaceholder) {
        if (cardProgress >= 0.30 && cardProgress <= 0.50) {
          rightNotificationCard.classList.add("active");
          leftPlaceholder.classList.add("active");
        } else {
          rightNotificationCard.classList.remove("active");
          leftPlaceholder.classList.remove("active");
        }
      }

      // Phase 3 (cardProgress between 0.55 and 0.75): Show Left REDEEM Keys message card & three floating video cards
      const leftNotificationCard2 = document.getElementById("phone-left-notification-2");
      const smallCard1 = document.getElementById("small-card-1");
      const smallCard2 = document.getElementById("small-card-2");
      const smallCard3 = document.getElementById("small-card-3");
      const showPhase3 = (cardProgress >= 0.55 && cardProgress <= 0.75);

      if (leftNotificationCard2) {
        if (showPhase3) leftNotificationCard2.classList.add("active");
        else leftNotificationCard2.classList.remove("active");
      }
      if (smallCard1) {
        if (showPhase3) smallCard1.classList.add("active");
        else smallCard1.classList.remove("active");
      }
      if (smallCard2) {
        if (showPhase3) smallCard2.classList.add("active");
        else smallCard2.classList.remove("active");
      }
      if (smallCard3) {
        if (showPhase3) smallCard3.classList.add("active");
        else smallCard3.classList.remove("active");
      }

      // Phase 4 / Final (cardProgress >= 0.80): Show the Telegram community message on the left
      const leftNotificationCard3 = document.getElementById("phone-left-notification-3");
      const showPhase4 = (cardProgress >= 0.80);

      if (leftNotificationCard3) {
        if (showPhase4) {
          leftNotificationCard3.classList.add("active");
        } else {
          leftNotificationCard3.classList.remove("active");
        }
      }
    };
 
    window.addEventListener("scroll", handlePhoneScroll, { passive: true });
    // Run initial calculation to position phone correctly on page load/refresh
    handlePhoneScroll();
  }
});

// Album slideshow carousel for Liquid Glass Cards on the left and right of iPhone mockup
document.addEventListener("DOMContentLoaded", () => {
  const leftBanners = document.querySelectorAll("#phone-left-placeholder .glass-product-banner");
  const rightBanners = document.querySelectorAll("#phone-right-placeholder .glass-product-banner");
  const phase3RightBanners = document.querySelectorAll("#small-card-3 .glass-product-banner");
  
  if (rightBanners.length > 0) {
    let currentIndex = 0;
    setInterval(() => {
      // Cycle right slideshow banner
      rightBanners[currentIndex].classList.remove("active");
      
      // Cycle left slideshow banner if it exists and there are multiple
      if (leftBanners.length > 1) {
        const leftIndex = currentIndex % leftBanners.length;
        if (leftBanners[leftIndex]) {
          leftBanners[leftIndex].classList.remove("active");
        }
      }
      
      // Cycle phase 3 right slideshow banner if it exists and there are multiple
      if (phase3RightBanners.length > 1) {
        const p3Index = currentIndex % phase3RightBanners.length;
        phase3RightBanners[p3Index].classList.remove("active");
      }
      
      currentIndex = (currentIndex + 1) % rightBanners.length;
      
      rightBanners[currentIndex].classList.add("active");
      
      if (leftBanners.length > 1) {
        const leftIndex = currentIndex % leftBanners.length;
        if (leftBanners[leftIndex]) {
          leftBanners[leftIndex].classList.add("active");
        }
      }
      
      if (phase3RightBanners.length > 1) {
        const p3Index = currentIndex % phase3RightBanners.length;
        phase3RightBanners[p3Index].classList.add("active");
      }
    }, 5000);
  }
});

/* ==========================================================================
   Checkout Page Logic (Purchase button forwarding & dynamic checkout loading)
   ========================================================================== */
function initPurchaseButtons() {
  const buyButtons = document.querySelectorAll(".buy-product-btn");
  if (buyButtons.length === 0) return;

  buyButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const isLoggedIn = localStorage.getItem("profileIsLoggedIn") === "true";
      if (!isLoggedIn) {
        showGoogleLogin();
        return;
      }
      
      const card = e.target.closest(".buy-product-card");
      if (!card) return;

      const titleEl = card.querySelector(".buy-product-title");
      const imgEl = card.querySelector(".buy-product-thumbnail");
      const priceEl = card.querySelector(".buy-product-price");

      const title = titleEl ? titleEl.textContent.trim() : "";
      const img = imgEl ? imgEl.getAttribute("src") : "";
      const price = priceEl ? priceEl.textContent.trim() : "";

      const metaEl = card.querySelector(".buy-product-meta");
      const badgesHTML = metaEl ? metaEl.innerHTML : "";

      // Store in localStorage for checkout retrieval
      localStorage.setItem("checkout_title", title);
      localStorage.setItem("checkout_img", img);
      localStorage.setItem("checkout_price", price);
      localStorage.setItem("checkout_badges", badgesHTML);

      // Redirect to checkout page with fallback parameters
      const params = new URLSearchParams({
        title: title,
        img: img,
        price: price
      });
      window.location.href = `checkout.html?${params.toString()}`;
    });
  });
}

function initCheckoutPage() {
  // Check if we are on checkout page
  const isCheckoutPage = window.location.pathname.includes("checkout.html") || 
                         window.location.pathname.endsWith("/checkout") || 
                         window.location.pathname.includes("/checkout.html");
  if (!isCheckoutPage) return;

  // Retrieve details
  let title = localStorage.getItem("checkout_title");
  let img = localStorage.getItem("checkout_img");
  let price = localStorage.getItem("checkout_price");

  // Fallback to URL Query params
  const urlParams = new URLSearchParams(window.location.search);
  if (!title && urlParams.has("title")) title = urlParams.get("title");
  if (!img && urlParams.has("img")) img = urlParams.get("img");
  if (!price && urlParams.has("price")) price = urlParams.get("price");

  // Populate dynamic elements
  const titleEl = document.getElementById("checkout-prod-title");
  const imgEl = document.getElementById("checkout-prod-img");
  const priceEl = document.getElementById("checkout-prod-price");
  const payPriceEl = document.getElementById("checkout-pay-price");
  const totalPriceEl = document.getElementById("checkout-total-price");

  if (titleEl && title) titleEl.textContent = title;
  if (imgEl && img) imgEl.setAttribute("src", img);
  if (priceEl && price) priceEl.textContent = price;
  if (payPriceEl && price) payPriceEl.textContent = price;
  if (totalPriceEl && price) totalPriceEl.textContent = price;

  // Retrieve and set custom badges dynamically from Buy page
  const metaEl = document.querySelector(".checkout-product-card-preview .buy-product-meta");
  const badgesHTML = localStorage.getItem("checkout_badges");
  if (metaEl && badgesHTML) {
    metaEl.innerHTML = badgesHTML;
  }

  // If the product is the gold 96X version, activate the gold theme overrides (but keep the background the same)
  if (title && title.includes("96X")) {
    const mainGrid = document.querySelector(".checkout-main-grid");
    if (mainGrid) mainGrid.classList.add("theme-gold-borders");
  }

  // Wire up checkout form submissions
  const checkoutForm = document.getElementById("checkout-form");
  const binanceInput = document.getElementById("checkout-binance-id");
  const binanceContainer = document.getElementById("binance-id-container");

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Enforce login
      const isLoggedIn = localStorage.getItem("profileIsLoggedIn") === "true";
      if (!isLoggedIn) {
        alert("Please sign in first using the profile widget at the top right to complete your checkout.");
        showGoogleLogin();
        return;
      }

      const emailInput = document.getElementById("checkout-email");
      const email = emailInput ? emailInput.value.trim() : "";
      if (!email) {
        alert("Please enter a valid email address.");
        return;
      }

      // Check selected payment method
      const selectedPayment = document.querySelector(".payment-method-card.active");
      const paymentMethod = selectedPayment ? selectedPayment.getAttribute("data-method") : "Cryptocurrency";

      let selectedCrypto = "USDT";
      let selectedNetwork = "TRC20";
      if (paymentMethod === "Cryptocurrency") {
        const cryptoTypeEl = document.getElementById("checkout-crypto-type");
        if (cryptoTypeEl) {
          selectedCrypto = cryptoTypeEl.value;
        }
        const networkTypeEl = document.getElementById("checkout-network-type");
        if (networkTypeEl) {
          selectedNetwork = networkTypeEl.value;
        }
      }

      let detailsMsg = `Thank you for purchasing!\nProduct: ${title || "Digital Key"}\nPrice: ${price || "45$"}\nPayment Method: ${paymentMethod}\nDelivery Email: ${email}`;
      let binanceId = "";
      if (paymentMethod === "Binance Pay" && binanceInput) {
        binanceId = binanceInput.value.trim();
        if (!binanceId) {
          alert("Please enter your Binance ID.");
          return;
        }
        detailsMsg += `\nBinance ID: ${binanceId}`;
      }

      // Save to Firestore under usernames/{username} (merging with existing fields like userId)
      const username = localStorage.getItem("profileName");

      // Helper function to get current user with potential waiting
      function getAuthenticatedUser() {
        return new Promise((resolve) => {
          if (!window.firebaseAuth) {
            resolve(null);
            return;
          }
          if (window.firebaseAuth.currentUser) {
            resolve(window.firebaseAuth.currentUser);
            return;
          }
          if (typeof window.onAuthStateChanged === "function") {
            const unsubscribe = window.onAuthStateChanged(window.firebaseAuth, (user) => {
              unsubscribe();
              resolve(user);
            });
            setTimeout(() => resolve(window.firebaseAuth.currentUser), 3000);
          } else {
            resolve(null);
          }
        });
      }

      // Helper function to generate unique deterministic transaction ID (with random salt for absolute uniqueness per checkout)
      function generateUniqueTxId(item, crypto, network, userEmail) {
        const randomSalt = Math.floor(Math.random() * 1000000);
        const input = (item + crypto + network + userEmail + Date.now() + randomSalt).toLowerCase();
        let hash = 5381;
        for (let i = 0; i < input.length; i++) {
          hash = (hash * 33) ^ input.charCodeAt(i);
        }
        let hashStr = Math.abs(hash).toString(36).toUpperCase();
        while (hashStr.length < 5) {
          hashStr += "X";
        }
        return hashStr.substring(0, 5);
      }

      if (username) {
        localStorage.setItem("checkout_email", email); // Save email to localStorage
        localStorage.setItem("checkout_crypto", selectedCrypto); // Save selected crypto to localStorage
        localStorage.setItem("checkout_network", selectedNetwork); // Save selected network to localStorage

        const txId = generateUniqueTxId(title, selectedCrypto, selectedNetwork, email);
        localStorage.setItem("payment_txid", txId);

        const debugAct = document.getElementById("debug-last-action");
        if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #6b8aff'>Verifying session...</span>";

        getAuthenticatedUser().then(user => {
          if (!user) {
            if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #ff5555'>Auth Failed (No User)</span>";
            alert("Your login session could not be verified by Firebase. Please click the profile avatar on the top right to sign in again.");
            showGoogleLogin();
            return;
          }

          if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #6b8aff'>Writing document...</span>";
          let firestorePromise = Promise.resolve();

          // Save order details to Firestore global orders collection only (and NOT in users or usernames collection)
          if (window.db && window.doc && window.setDoc) {
            if (paymentMethod === "Cryptocurrency") {
              function getWalletAddress(crypto, network) {
                if (crypto === "USDT") {
                  if (network === "APT" || network === "BEP20") {
                    return "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
                  }
                  return "TY1xP8G6uA9zH8GfM8D9vT8C8sP7W8q4k9";
                } else if (crypto === "USDC") {
                  if (network === "BEP20" || network === "SUI") {
                    return "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
                  }
                  return "4k3DYwMw48Ph7Sru25Bgh2CJC146wN8M5G";
                }
                return "";
              }

              const walletAddr = getWalletAddress(selectedCrypto, selectedNetwork);
              const rawPrice = price || "6$";
              const amountVal = parseFloat(rawPrice.replace(/[^0-9.]/g, "")) || 6;
              const randomSuffix = Math.floor(1000 + Math.random() * 9000);
              const seqOrderId = `DSR${randomSuffix}`;

              const orderData = {
                orderId: seqOrderId,
                email: user.email || "",
                "delivered email": email,
                product: title || "Lucky Premium Game",
                amount: amountVal,
                currency: selectedCrypto,
                network: selectedNetwork,
                status: "pending",
                wallet: walletAddr,
                "transaction id": txId,
                time: new Date().toISOString()
              };

              firestorePromise = window.setDoc(window.doc(window.db, "orders", txId), orderData)
                .then(() => {
                  console.log("Order document created successfully under global orders collection");
                  if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #25d366'>SUCCESS (Created order: " + txId + ")</span>";
                })
                .catch(err => {
                  console.error("Error creating order document:", err);
                  if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #ff5555'>WRITE FAILED (" + err.code + ")</span>";
                  alert("Failed to register your order in the database: " + err.message);
                  throw err; // Stop promise chain to prevent redirect
                });
            } else if (paymentMethod === "Binance Pay") {
              const rawPrice = price || "6$";
              const amountVal = parseFloat(rawPrice.replace(/[^0-9.]/g, "")) || 6;
              const randomSuffix = Math.floor(1000 + Math.random() * 9000);
              const seqOrderId = `DSR${randomSuffix}`;

              const orderData = {
                orderId: seqOrderId,
                email: user.email || "",
                "delivered email": email,
                product: title || "Lucky Premium Game",
                amount: amountVal,
                currency: "USD",
                network: "Binance Pay",
                status: "pending",
                wallet: binanceId,
                "transaction id": txId,
                time: new Date().toISOString()
              };

              firestorePromise = window.setDoc(window.doc(window.db, "orders", txId), orderData)
                .then(() => {
                  console.log("Binance Pay order document created successfully");
                  if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #25d366'>SUCCESS (Created Binance Pay: " + txId + ")</span>";
                })
                .catch(err => {
                  console.error("Error creating Binance Pay order document:", err);
                  if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #ff5555'>WRITE FAILED (" + err.code + ")</span>";
                  alert("Failed to register your order in the database: " + err.message);
                  throw err; // Stop promise chain to prevent redirect
                });
            }
          } else {
            console.error("Firebase Firestore is not initialized! (window.db, window.doc, or window.setDoc is undefined)");
            if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #ff5555'>Firebase Not Initialized</span>";
            alert("Database Error: Firebase Firestore is not initialized.\n\nIf you opened the HTML file directly (with double-click showing file:/// in the address bar), browser security blocks Firebase ES modules from loading. Please run the project using a local web server (e.g. node server.js) and visit http://localhost:3000 in your browser instead.");
            return; // Stop execution
          }

          if (paymentMethod === "Cryptocurrency") {
            firestorePromise.then(() => {
              // Only redirect if database write was attempted and succeeded
              if (window.db && window.doc && window.setDoc) {
                setTimeout(() => {
                  window.location.href = "payment.html";
                }, 1500); // 1.5s delay to let them see success in debug box
              } else {
                window.location.href = "payment.html";
              }
            }).catch(err => {
              console.log("Checkout halted due to database write failure.", err);
            });
          } else {
            firestorePromise.then(() => {
              alert(detailsMsg);
            }).catch(err => {
              console.log("Checkout halted due to database write failure.", err);
            });
          }
        });
      }
    });
  }

  // Handle payment cards selection
  const payCards = document.querySelectorAll(".payment-method-card");
  const payBtn = document.querySelector(".checkout-pay-btn");
  const cryptoSelectContainer = document.getElementById("crypto-select-container");
  const networkSelectContainer = document.getElementById("network-select-container");

  payCards.forEach(card => {
    card.addEventListener("click", () => {
      payCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      const method = card.getAttribute("data-method");
      if (method === "Binance Pay") {
        if (cryptoSelectContainer) cryptoSelectContainer.style.display = "none";
        if (networkSelectContainer) networkSelectContainer.style.display = "none";
        if (binanceContainer) binanceContainer.style.display = "flex";
        if (binanceInput) binanceInput.required = true;
        if (payBtn) {
          payBtn.innerHTML = `<img src="https://www.dropbox.com/scl/fi/1z4c3wqn8an7shaeku47w/telegram-white-icon.webp?rlkey=m91wtlv8kn9u0yotbncq1mrhn&st=eqd5g0tj&dl=1" class="checkout-btn-icon" alt="Telegram"> CONTACT US`;
          payBtn.classList.add("btn-whatsapp-green");
        }
      } else {
        if (cryptoSelectContainer) cryptoSelectContainer.style.display = "flex";
        if (networkSelectContainer) networkSelectContainer.style.display = "flex";
        if (binanceContainer) binanceContainer.style.display = "none";
        if (binanceInput) {
          binanceInput.value = "";
          binanceInput.required = false;
        }
        if (payBtn) {
          payBtn.innerHTML = "PAY NOW";
          payBtn.classList.remove("btn-whatsapp-green");
        }
      }
    });
  });

  // Handle custom dropdown cryptocurrency selection & Select Network setup
  const selectWrapper = document.getElementById("crypto-select-wrapper");
  const selectTrigger = document.getElementById("crypto-select-trigger");
  const optionsContainer = document.getElementById("crypto-options-container");
  const cryptoInput = document.getElementById("checkout-crypto-type");
  const customOptions = document.querySelectorAll(".custom-option");
  const selectedContent = document.getElementById("selected-crypto-content");

  // Network Elements
  const networkWrapper = document.getElementById("network-select-wrapper");
  const networkTrigger = document.getElementById("network-select-trigger");
  const networkOptionsContainer = document.getElementById("network-options-container");
  const networkInput = document.getElementById("checkout-network-type");
  const selectedNetworkContent = document.getElementById("selected-network-content");

  const networksData = {
    USDT: [
      { name: "TRC20", val: "TRC20", img: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/trx.png" },
      { name: "APT", val: "APT", img: "https://www.dropbox.com/scl/fi/cx35j53s6m5wm32s9inre/Design-sans-titre-28.png?rlkey=g331aqm9l4t1z6w6478je0pd8&st=lk58xs63&dl=1" },
      { name: "BEP20", val: "BEP20", img: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png" }
    ],
    USDC: [
      { name: "SOL", val: "SOL", img: "https://www.dropbox.com/scl/fi/7aew33cc90sdznyzcs5xb/Solana_logo.png?rlkey=bb925zzk1n9ynd70cywt9r61s&st=d1obmj5n&dl=1" },
      { name: "BEP20", val: "BEP20", img: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png" },
      { name: "SUI", val: "SUI", img: "https://www.dropbox.com/scl/fi/jdrg8yh9kyxuzgqohfygp/sui-7591eb35.png?rlkey=8wh36murd5na929r4rth3op4j&st=5zp8v8ek&dl=1" }
    ]
  };

  function updateNetworkOptions(crypto) {
    if (!networkOptionsContainer || !networksData[crypto]) return;

    // Clear existing options
    networkOptionsContainer.innerHTML = "";

    const options = networksData[crypto];
    
    // Set default network (first one in the list)
    const defaultNet = options[0];
    if (networkInput) networkInput.value = defaultNet.val;
    if (selectedNetworkContent) {
      selectedNetworkContent.innerHTML = `
        <img src="${defaultNet.img}" class="select-crypto-icon" alt="${defaultNet.val}">
        <span class="select-crypto-name">${defaultNet.name}</span>
      `;
    }

    // Populate options
    options.forEach((net, index) => {
      const optionDiv = document.createElement("div");
      optionDiv.className = `custom-option ${index === 0 ? "active" : ""}`;
      optionDiv.setAttribute("data-value", net.val);
      optionDiv.innerHTML = `
        <img src="${net.img}" class="select-crypto-icon" alt="${net.val}">
        <span>${net.name}</span>
      `;

      optionDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Remove active class from other options
        const allOpts = networkOptionsContainer.querySelectorAll(".custom-option");
        allOpts.forEach(o => o.classList.remove("active"));
        
        // Add active class
        optionDiv.classList.add("active");

        // Update hidden input
        if (networkInput) networkInput.value = net.val;

        // Update trigger display
        if (selectedNetworkContent) {
          selectedNetworkContent.innerHTML = `
            <img src="${net.img}" class="select-crypto-icon" alt="${net.val}">
            <span class="select-crypto-name">${net.name}</span>
          `;
        }

        // Close dropdown
        if (networkWrapper) {
          networkWrapper.classList.remove("open");
        }
      });

      networkOptionsContainer.appendChild(optionDiv);
    });
  }

  // Initial network configuration for default crypto (USDT)
  updateNetworkOptions("USDT");

  // Crypto Dropdown Toggle
  if (selectTrigger && optionsContainer) {
    selectTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (networkWrapper) networkWrapper.classList.remove("open");
      selectWrapper.classList.toggle("open");
    });

    customOptions.forEach(option => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        customOptions.forEach(opt => opt.classList.remove("active"));
        option.classList.add("active");

        const val = option.getAttribute("data-value");
        const img = option.querySelector("img").getAttribute("src");

        // Update hidden input
        if (cryptoInput) cryptoInput.value = val;

        // Update selected display
        if (selectedContent) {
          selectedContent.innerHTML = `
            <img src="${img}" class="select-crypto-icon" alt="${val}">
            <span class="select-crypto-name">${val}</span>
          `;
        }

        // Trigger dynamic network options reload
        updateNetworkOptions(val);

        // Close dropdown
        selectWrapper.classList.remove("open");
      });
    });
  }

  // Network Dropdown Toggle
  if (networkTrigger && networkWrapper) {
    networkTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (selectWrapper) selectWrapper.classList.remove("open");
      networkWrapper.classList.toggle("open");
    });
  }

  // Close both dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (selectWrapper && !selectWrapper.contains(e.target)) {
      selectWrapper.classList.remove("open");
    }
    if (networkWrapper && !networkWrapper.contains(e.target)) {
      networkWrapper.classList.remove("open");
    }
  });
}

// Floating Diagnostic Debug Widget
function initDebugPanel() {
  const isLocalFile = window.location.protocol === 'file:';
  const isFirebaseLoaded = !!(window.db && window.doc && window.setDoc);
  const isLoggedIn = localStorage.getItem("profileIsLoggedIn") === "true";
  const profileName = localStorage.getItem("profileName") || "null";
  const checkoutFormExists = !!document.getElementById("checkout-form");

  let debugDiv = document.getElementById("antigravity-debug-panel");
  if (!debugDiv) {
    debugDiv = document.createElement("div");
    debugDiv.id = "antigravity-debug-panel";
    debugDiv.style.position = "fixed";
    debugDiv.style.bottom = "10px";
    debugDiv.style.right = "10px";
    debugDiv.style.zIndex = "999999";
    debugDiv.style.background = "rgba(0, 0, 0, 0.9)";
    debugDiv.style.border = "2px solid #3b82f6";
    debugDiv.style.borderRadius = "8px";
    debugDiv.style.padding = "12px";
    debugDiv.style.color = "#ffffff";
    debugDiv.style.fontFamily = "monospace";
    debugDiv.style.fontSize = "12px";
    debugDiv.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5)";
    debugDiv.style.width = "300px";
    document.body.appendChild(debugDiv);
  }

  const lastActionHTML = document.getElementById("debug-last-action") ? document.getElementById("debug-last-action").innerHTML : "Last Action: None";

  debugDiv.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #3b82f6; padding-bottom: 4px; display: flex; justify-content: space-between;">
      <span>Checkout Diagnostic Panel</span>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #ff5555; cursor: pointer; font-weight: bold;">[X]</button>
    </div>
    <div style="margin-bottom: 4px;">Protocol: <span style="color: ${isLocalFile ? '#ff5555' : '#25d366'}">${window.location.protocol}</span> ${isLocalFile ? '<b>(CORS BLOCKED!)</b>' : ''}</div>
    <div style="margin-bottom: 4px;">Firebase SDK: <span style="color: ${isFirebaseLoaded ? '#25d366' : '#ff5555'}">${isFirebaseLoaded ? 'INITIALIZED' : 'NOT INITIALIZED'}</span></div>
    <div style="margin-bottom: 4px;">User logged-in: <span style="color: ${isLoggedIn ? '#25d366' : '#ff5555'}">${isLoggedIn ? 'YES' : 'NO'}</span></div>
    <div style="margin-bottom: 4px;">Username: <span style="color: #6b8aff">${profileName}</span></div>
    <div style="margin-bottom: 4px;">Checkout Form: <span style="color: ${checkoutFormExists ? '#25d366' : '#ff5555'}">${checkoutFormExists ? 'FOUND' : 'NOT FOUND'}</span></div>
    <div id="debug-last-action" style="margin-top: 8px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 6px; color: #ffea00; font-size: 11px;">
      ${lastActionHTML}
    </div>
  `;
}



