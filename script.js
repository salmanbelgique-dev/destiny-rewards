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
                    path.includes('history.html') || path.endsWith('/history') || path.includes('/history.html') ||
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

const winSongAudio = new Audio('images/win-song.mp3');
winSongAudio.preload = "auto";
let wasEventSongPlaying = false;

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

    // Pause background event song to make card display audio clearer
    if (eventSong && !eventSong.paused) {
      wasEventSongPlaying = true;
      eventSong.pause();
      if (typeof updateSpeakerBtnUI === "function") {
        updateSpeakerBtnUI(false);
      }
    } else {
      wasEventSongPlaying = false;
    }

    if (isWin) {
      if (winSongAudio) {
        winSongAudio.currentTime = 0;
        winSongAudio.play().catch(err => console.log("Win song blocked:", err));
      }
    }

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

// Resets spin cooldown for testing purposes
function resetSpinCooldown() {
  localStorage.removeItem("spinCooldownEnd");
  localStorage.removeItem("activeDiscount");
  
  const startChallengeBtn = document.getElementById("start-challenge-btn");
  if (startChallengeBtn) {
    startChallengeBtn.textContent = "BUY";
  }
  
  const timerEl = document.getElementById("cooldown-timer");
  if (timerEl) {
    timerEl.style.visibility = "hidden";
    timerEl.innerHTML = "&nbsp;";
  }
  
  const spinBtn = document.getElementById("spin-btn");
  if (spinBtn) {
    spinBtn.disabled = false;
    spinBtn.style.opacity = "1";
    spinBtn.style.cursor = "pointer";
    spinBtn.innerHTML = "SPIN";
  }
  
  alert("Cooldown reset successfully! You can spin the wheel again.");
}
window.resetSpinCooldown = resetSpinCooldown;

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
  let sidePanel = document.getElementById('side-message-panel');
  let backdrop = document.getElementById('modal-backdrop');

  // If they don't exist on this page, create them dynamically!
  if (!sidePanel) {
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.id = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }
    sidePanel = document.createElement('div');
    sidePanel.className = 'side-message-panel';
    sidePanel.id = 'side-message-panel';
    sidePanel.innerHTML = `
      <button class="side-message-close" id="close-side-message">&times;</button>
      <img src="images/bid_unavailable.png" alt="Bid Section Coming Soon" class="modal-image-only">
      <a href="https://t.me/Destinyrewards_bot" target="_blank" class="modal-telegram-overlay-link" aria-label="Join Telegram"></a>
    `;
    document.body.appendChild(sidePanel);
  }

  const closeBtn = document.getElementById('close-side-message');
  const bidLink = document.getElementById('nav-bid-link');
  const freeLink = document.getElementById('nav-free-link');
  let autoCloseTimer;

  const showSideMessage = (e, type = 'bid') => {
    if (e && e.preventDefault) e.preventDefault();
    
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
    if (e && e.stopPropagation) e.stopPropagation();
    if (sidePanel) sidePanel.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
  };

  // Expose globally so footer links can open it directly on any page
  window.showSideMessage = showSideMessage;

  if (bidLink) bidLink.addEventListener('click', (e) => showSideMessage(e, 'bid'));
  if (freeLink) freeLink.addEventListener('click', (e) => showSideMessage(e, 'free'));

  if (closeBtn) closeBtn.addEventListener('click', closeSideMessage);
  if (backdrop) backdrop.addEventListener('click', closeSideMessage);

  // Check URL query parameters to show the modal automatically on index page load
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const showModalType = urlParams.get('showModal');
    if (showModalType === 'bid' || showModalType === 'free') {
      setTimeout(() => {
        showSideMessage(null, showModalType);
      }, 500);
    }
  } catch (err) {
    console.error("Error reading showModal param:", err);
  }

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
      
      // Check if user already has profile details in localStorage on this device
      const localName = localStorage.getItem("profileName");
      const localId = localStorage.getItem("profileId") ? localStorage.getItem("profileId").replace("ID: ", "") : null;
      
      if (localName && localId) {
        console.log("Database lookup failed/timed out, but found existing local profile. Skipping setup gate.");
        return { isNew: false, id: localId, dbName: localName, gName: name, dbPhoto: photoURL };
      }
      
      // If it was a database connection error or timeout and NOT a "user not found" error,
      // we also shouldn't show the setup gate to prevent annoying existing users.
      const isUserNotFound = err && err.message && (
        err.message.includes("No Firestore user ID") || 
        err.message.includes("No RTDB user ID") || 
        err.message.includes("RTDB not available") || 
        err.message.includes("No databases available")
      );
                             
      if (!isUserNotFound) {
        console.log("Database connection error or timeout. Skipping setup gate to prevent showing it to existing users.");
        const fallbackId = Math.floor(10000 + Math.random() * 90000);
        return { isNew: false, id: fallbackId, dbName: name, gName: name, dbPhoto: photoURL };
      }

      // Truly a new user (no record in database and database query completed successfully returning empty)
      const newRandomId = Math.floor(10000 + Math.random() * 90000);
      return { isNew: true, id: newRandomId, dbName: name, gName: name, dbPhoto: photoURL };
    })
    .then((result) => {
      if (signInBtn) {
        signInBtn.disabled = false;
        signInBtn.style.opacity = "1";
        const btnText = signInBtn.querySelector(".google-btn-text") || signInBtn.querySelector("span");
        if (btnText) {
          btnText.textContent = signInBtn.id === "buy-google-signin-btn" ? "Sign in with Google" : "Sign up with Google";
        }
      }

      if (result.isNew) {
        showProfileSetupGate(user, result.id, result.gName || name, result.dbPhoto || photoURL);
      } else {
        completeLogin(user, result.id, result.dbName || name, result.gName || name, result.dbPhoto || photoURL);
      }
    })
    .catch(err => {
      console.error("Error completing user login:", err);
      // Fallback: Ensure user is still logged in locally even on unexpected error
      const fallbackId = Math.floor(10000 + Math.random() * 90000);
      completeLogin(user, fallbackId, name, name, photoURL);
    });
}

function showProfileSetupGate(user, finalId, defaultName, defaultPhotoURL) {
  let profileSetupGate = document.getElementById("profile-setup-gate");
  if (!profileSetupGate) {
    profileSetupGate = document.createElement("div");
    profileSetupGate.className = "signup-gate-overlay";
    profileSetupGate.id = "profile-setup-gate";
    profileSetupGate.style.display = "none";
    profileSetupGate.innerHTML = `
        <div class="signup-gate-content profile-setup-content">
          <h2 class="signup-gate-title">COMPLETE YOUR PROFILE</h2>
          <p class="signup-gate-desc profile-desc">Upload a profile picture and choose a username to unlock your profile.</p>
          
          <div class="setup-avatar-upload" id="setup-avatar-upload" title="Click to upload profile picture">
            <img src="" alt="" id="setup-avatar-img" style="display: none;">
            <svg id="setup-avatar-icon" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="grey" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <input type="file" id="setup-avatar-input" style="display: none;" accept="image/*">
          
          <input type="text" id="setup-username-input" class="setup-username-input" placeholder="Enter Username" autocomplete="off" maxlength="20">
          <span id="setup-username-error" class="setup-username-error" style="display: none;">Username is already taken!</span>
          
          <button class="setup-continue-btn" id="setup-continue-btn">CONTINUE</button>
        </div>
    `;
    document.body.appendChild(profileSetupGate);
  }

  const signupGate = document.getElementById("signup-gate");
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
              newContinueBtn.textContent = "CONTINUE";
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
                  newContinueBtn.textContent = "CONTINUE";
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
            newContinueBtn.textContent = "CONTINUE";
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
  
  // Only trigger celebration confetti on the challenge page
  const isChallengePage = window.location.pathname.includes("challenge.html") || 
                          window.location.pathname.endsWith("/challenge") || 
                          window.location.pathname.includes("/challenge.html");
  if (isChallengePage) {
    triggerConfetti();
  }
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

  const isMutedPref = localStorage.getItem("eventSongMuted") === "true";
  if (isMutedPref) {
    updateSpeakerBtnUI(false);
    return; // Don't try to play if they muted it manually before
  }

  // Try to autoplay
  const playPromise = eventSong.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log("Autoplay started successfully");
      updateSpeakerBtnUI(true);
    }).catch(err => {
      console.warn("Autoplay blocked by browser. Music will start on user interaction.", err);
      updateSpeakerBtnUI(false);
      
      // Auto-start on first user interaction with the document (using capture phase)
      const startMusicOnInteraction = () => {
        if (eventSong && eventSong.paused && localStorage.getItem("eventSongMuted") !== "true") {
          eventSong.play().then(() => {
            updateSpeakerBtnUI(true);
          }).catch(e => console.log("Failed to start on interaction:", e));
        }
        document.removeEventListener('click', startMusicOnInteraction, true);
        document.removeEventListener('keydown', startMusicOnInteraction, true);
      };
      document.addEventListener('click', startMusicOnInteraction, true);
      document.addEventListener('keydown', startMusicOnInteraction, true);
    });
  }
}

function toggleEventSong() {
  if (!eventSong) return;
  
  if (eventSong.paused) {
    eventSong.play()
      .then(() => {
        updateSpeakerBtnUI(true);
        localStorage.setItem("eventSongMuted", "false");
      })
      .catch(err => console.log("Playback failed:", err));
  } else {
    eventSong.pause();
    updateSpeakerBtnUI(false);
    localStorage.setItem("eventSongMuted", "true");
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
  if (winSongAudio) {
    winSongAudio.pause();
    winSongAudio.currentTime = 0;
  }
  // Resume background event song if it was playing before
  if (wasEventSongPlaying && eventSong) {
    eventSong.play()
      .then(() => {
        if (typeof updateSpeakerBtnUI === "function") {
          updateSpeakerBtnUI(true);
        }
      })
      .catch(err => console.log("Failed to resume background music:", err));
    wasEventSongPlaying = false;
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

  // Dynamically display the game photos album section only for the 96X version
  const photosSection = document.getElementById("checkout-game-photos-section");
  if (photosSection) {
    const lowerTitle = (title || "").toLowerCase();
    if (lowerTitle.includes("96x")) {
      photosSection.style.display = "block";
    } else {
      photosSection.style.display = "none";
    }
  }

  // Inject custom CSS for the slide-down rule alert dynamically if not already present
  if (!document.getElementById("rule-alert-styles")) {
    const styles = document.createElement("style");
    styles.id = "rule-alert-styles";
    styles.textContent = `
      .rule-alert-container {
        position: fixed;
        top: 96px;
        right: 24px;
        z-index: 10000;
        transform: translateX(120%);
        transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: auto;
      }
      .rule-alert-container.show {
        transform: translateX(0);
      }
      .rule-alert-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 24px;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.2) 100%);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1.5px solid rgba(239, 68, 68, 0.5);
        border-radius: 12px;
        color: #ffffff;
        font-family: 'Montserrat', sans-serif;
        box-shadow: 0 10px 30px rgba(239, 68, 68, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
        max-width: 380px;
      }
      .rule-alert-icon {
        color: #ef4444;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: alertPulse 2s infinite ease-in-out;
      }
      .rule-alert-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .rule-alert-title {
        font-weight: 800;
        font-size: 0.95rem;
        letter-spacing: 0.5px;
        color: #ef4444;
        text-transform: uppercase;
      }
      .rule-alert-message {
        font-weight: 500;
        font-size: 0.85rem;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.9);
      }
      @keyframes alertPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.15); opacity: 0.8; }
      }
    `;
    document.head.appendChild(styles);
  }

  // Display attractive slide-down alert for rules enforcement
  function showRuleAlert(title, message) {
    let container = document.querySelector(".rule-alert-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "rule-alert-container";
      container.innerHTML = `
        <div class="rule-alert-card">
          <div class="rule-alert-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          </div>
          <div class="rule-alert-content">
            <div class="rule-alert-title" id="rule-alert-title">ORDER LIMIT REACHED</div>
            <div class="rule-alert-message" id="rule-alert-message">Only one pending order is allowed at a time. Please wait until we have reviewed and completed your previous order before placing a new one.</div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    }

    const titleEl = document.getElementById("rule-alert-title");
    const msgEl = document.getElementById("rule-alert-message");
    if (titleEl && title) titleEl.textContent = title;
    if (msgEl && message) msgEl.textContent = message;

    // Trigger slide-in
    setTimeout(() => {
      container.classList.add("show");
    }, 50);

    // Auto-dismiss after 6 seconds
    if (window.ruleAlertTimeout) {
      clearTimeout(window.ruleAlertTimeout);
    }
    window.ruleAlertTimeout = setTimeout(() => {
      container.classList.remove("show");
    }, 6000);
  }

  // Query database in parallel for any active pending orders (by auth email and form input email)
  async function checkHasPendingOrder(userEmail, formEmail) {
    if (!window.db || !window.collection || !window.query || !window.where || !window.getDocs) {
      return false;
    }
    
    const collRef = window.collection(window.db, "orders");
    const emailsToCheck = new Set();
    if (userEmail) {
      emailsToCheck.add(userEmail.toLowerCase());
      emailsToCheck.add(userEmail.toUpperCase());
      emailsToCheck.add(userEmail);
    }
    if (formEmail) {
      emailsToCheck.add(formEmail.toLowerCase());
      emailsToCheck.add(formEmail.toUpperCase());
      emailsToCheck.add(formEmail);
    }

    const queries = [];
    for (const email of emailsToCheck) {
      queries.push(window.query(collRef, window.where("email", "==", email), window.where("orderStatus", "==", "pending")));
      queries.push(window.query(collRef, window.where("delivered email", "==", email), window.where("orderStatus", "==", "pending")));
    }

    try {
      const snapshots = await Promise.all(queries.map(q => window.getDocs(q)));
      for (const snap of snapshots) {
        if (!snap.empty) {
          return true; // Found a pending order!
        }
      }
    } catch (err) {
      console.error("Error checking for pending orders:", err);
    }
    return false;
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

        getAuthenticatedUser().then(async user => {
          if (!user) {
            if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #ff5555'>Auth Failed (No User)</span>";
            alert("Your login session could not be verified by Firebase. Please click the profile avatar on the top right to sign in again.");
            showGoogleLogin();
            return;
          }

          // Enforce one-order-at-a-time rule (check if previous order is pending)
          if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #6b8aff'>Checking active orders...</span>";
          const hasPending = await checkHasPendingOrder(user.email || "", email);
          if (hasPending) {
            if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #ff5555'>ORDER DENIED (Pending Order Exists)</span>";
            showRuleAlert("ORDER LIMIT REACHED", "Only one pending order is allowed at a time. Please wait until we have reviewed and completed your previous order before placing a new one.");
            return; // Halt order creation
          }

          // Generate sequential order ID (e.g. DSR0001, DSR0002) using public orders_counter document in usernames collection
          let seqOrderId = "DSR" + Math.floor(1000 + Math.random() * 9000); // fallback
          try {
            if (window.db && window.doc && window.getDoc && window.setDoc) {
              const counterRef = window.doc(window.db, "usernames", "orders_counter");
              const counterSnap = await window.getDoc(counterRef);
              let currentCount = 0;
              if (counterSnap.exists()) {
                currentCount = counterSnap.data().count || 0;
              }
              const nextNum = currentCount + 1;
              await window.setDoc(counterRef, { count: nextNum });
              seqOrderId = "DSR" + String(nextNum).padStart(4, '0');
            }
          } catch (err) {
            console.warn("Failed to fetch/increment order counter, using fallback:", err);
          }

          if (debugAct) debugAct.innerHTML = "Last Action: <span style='color: #6b8aff'>Writing document...</span>";
          let firestorePromise = Promise.resolve();

          // Save order details to Firestore global orders collection only (and NOT in users or usernames collection)
          if (window.db && window.doc && window.setDoc) {
            if (paymentMethod === "Cryptocurrency") {
              function getWalletAddress(crypto, network, txId) {
                const USDT_BEP20_WALLETS = [
                  { address: "0xb8512439c19bae4bddffacb100ab5eaccdc20498" },
                  { address: "0xbb2f78add4ec6d58c9cda97e18e6320586e8c4f6" },
                  { address: "0x7586ef327a687372b04219ebb0200217de292ede" }
                ];
                const USDT_APT_WALLET = {
                  address: "0xa131931bbd34922ff36911b72b232b5a50f86d545ed9d0a06f18615d4e89dda4"
                };
                const USDT_TRC20_WALLETS = [
                  { address: "TX7Ad5D3yydmeCSYtCbfNmgERYgoeaiA56" }
                ];
                const USDC_SOL_WALLETS = [
                  { address: "FcZ4RMDSLQTkb7EYmwTJkk9ewsHn3gnAVppW92mSj6aC" },
                  { address: "DD6ZsZYASVmiev1e1MUgXfFLkJXDyAEmAFUWVu6gkX9r" }
                ];
                const USDC_SUI_WALLETS = [
                  { address: "0x4c00fa4571613f2f287bc26c18fbd3255b7d706741367c9658468944b3992827" }
                ];
                const USDC_BEP20_WALLETS = [
                  { address: "0x7586ef327a687372b04219ebb0200217de292ede" },
                  { address: "0xbb2f78add4ec6d58c9cda97e18e6320586e8c4f6" }
                ];

                let charSum = 0;
                const idStr = txId || "";
                for (let i = 0; i < idStr.length; i++) charSum += idStr.charCodeAt(i);

                if (crypto === "USDT") {
                  if (network === "BEP20") {
                    const walletObj = USDT_BEP20_WALLETS[charSum % USDT_BEP20_WALLETS.length];
                    return walletObj.address;
                  } else if (network === "APT") {
                    return USDT_APT_WALLET.address;
                  } else { // TRC20
                    const walletObj = USDT_TRC20_WALLETS[charSum % USDT_TRC20_WALLETS.length];
                    return walletObj.address;
                  }
                } else if (crypto === "USDC") {
                  if (network === "BEP20") {
                    const walletObj = USDC_BEP20_WALLETS[charSum % USDC_BEP20_WALLETS.length];
                    return walletObj.address;
                  } else if (network === "SOL" || network === "Solana") {
                    const walletObj = USDC_SOL_WALLETS[charSum % USDC_SOL_WALLETS.length];
                    return walletObj.address;
                  } else if (network === "SUI") {
                    const walletObj = USDC_SUI_WALLETS[charSum % USDC_SUI_WALLETS.length];
                    return walletObj.address;
                  } else {
                    const walletObj = USDC_SOL_WALLETS[charSum % USDC_SOL_WALLETS.length];
                    return walletObj.address;
                  }
                }
                return "";
              }

              const walletAddr = getWalletAddress(selectedCrypto, selectedNetwork, txId);
              const rawPrice = price || "6$";
              const amountVal = parseFloat(rawPrice.replace(/[^0-9.]/g, "")) || 6;

              const orderData = {
                orderId: seqOrderId,
                email: user.email || "",
                "delivered email": email,
                product: title || "Lucky Premium Game",
                amount: amountVal,
                currency: selectedCrypto,
                network: selectedNetwork,
                orderStatus: "pending",
                wallet: walletAddr,
                "transaction id": txId,
                time: new Date().toISOString(),
                orderViewed: false
              };

              firestorePromise = window.setDoc(window.doc(window.db, "orders", txId), orderData)
                .then(() => {
                  console.log("Order document created successfully under global orders collection");
                  console.log("[ORDER NOTIFICATION] Order created");
                  localStorage.setItem("has_new_order_placed", "true");
                  localStorage.setItem("order_dot_cleared", "false");
                  if (user && user.email) {
                    localStorage.setItem(`order_dot_cleared_${user.email.toLowerCase()}`, "false");
                  }
                  console.log("[ORDER NOTIFICATION] Notification set");
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

              const orderData = {
                orderId: seqOrderId,
                email: user.email || "",
                "delivered email": email,
                product: title || "Lucky Premium Game",
                amount: amountVal,
                currency: "USD",
                network: "Binance Pay",
                orderStatus: "pending",
                wallet: binanceId,
                "transaction id": txId,
                time: new Date().toISOString(),
                orderViewed: false
              };

              firestorePromise = window.setDoc(window.doc(window.db, "orders", txId), orderData)
                .then(() => {
                  console.log("Binance Pay order document created successfully");
                  console.log("[ORDER NOTIFICATION] Order created");
                  localStorage.setItem("has_new_order_placed", "true");
                  localStorage.setItem("order_dot_cleared", "false");
                  if (user && user.email) {
                    localStorage.setItem(`order_dot_cleared_${user.email.toLowerCase()}`, "false");
                  }
                  console.log("[ORDER NOTIFICATION] Notification set");
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
              window.location.href = "https://wa.me/message/YTRSS2WSIZQVI1";
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
          payBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="checkout-btn-icon" style="display:inline-block; vertical-align:middle; margin-right:8px; flex-shrink:0;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg> CONTACT US`;
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

// Floating Diagnostic Debug Widget (Removed)
function initDebugPanel() {
  // Removed diagnostic debug widget
}



// =====================================================================
// LIVE USERNAME AVAILABILITY CHECK (fires as user types in setup modal)
// =====================================================================
(function initLiveUsernameCheck() {
  // Wait for DOM ready then hook into the input
  function hookInput() {
    const input = document.getElementById("setup-username-input");
    const errorSpan = document.getElementById("setup-username-error");
    if (!input) return;

    let debounceTimer = null;

    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      const val = input.value.trim();

      // Clear feedback immediately on new keystroke
      if (errorSpan) {
        errorSpan.style.display = "none";
        errorSpan.textContent = "";
        errorSpan.style.color = "#ff5555";
      }

      if (!val || val.length < 3) return;

      const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
      if (!usernameRegex.test(val)) return;

      // Show checking indicator
      if (errorSpan) {
        errorSpan.textContent = "Checking availability...";
        errorSpan.style.color = "#6b8aff";
        errorSpan.style.display = "block";
      }

      debounceTimer = setTimeout(() => {
        if (!window.db || !window.doc || !window.getDoc) return;
        const usernameLower = val.toLowerCase();
        const myId = localStorage.getItem("profileId") || "";

        window.getDoc(window.doc(window.db, "usernames", usernameLower))
          .then(docSnap => {
            const currentInput = document.getElementById("setup-username-input");
            if (!currentInput || currentInput.value.trim().toLowerCase() !== usernameLower) return;
            const errEl = document.getElementById("setup-username-error");
            if (!errEl) return;

            if (docSnap.exists() && docSnap.data().userId !== myId) {
              errEl.textContent = "❌ Username already taken";
              errEl.style.color = "#ff5555";
              errEl.style.display = "block";
            } else {
              errEl.textContent = "✅ Username is available!";
              errEl.style.color = "#25d366";
              errEl.style.display = "block";
            }
          })
          .catch(() => {
            // Silent fail on check
            const errEl = document.getElementById("setup-username-error");
            if (errEl) errEl.style.display = "none";
          });
      }, 500); // 500ms debounce
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hookInput);
  } else {
    hookInput();
    // Also re-hook when the profile gate opens (it may be injected later)
    const observer = new MutationObserver(() => {
      const input = document.getElementById("setup-username-input");
      if (input && !input.dataset.liveChecked) {
        input.dataset.liveChecked = "1";
        hookInput();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();


// =====================================================================
// SIMILAR PRODUCTS CAROUSEL (populates #similar-carousel-track)
// =====================================================================
(function initSimilarProducts() {
  const SIMILAR_PRODUCTS = [
    {
      title: "Lucky Premium 96X Global Steam Game",
      price: "250$",
      img: "https://www.dropbox.com/scl/fi/27pxn9krdm0mg99egbrf2/ChatGPT-Image-2-juil.-2026-17_25_59.png?rlkey=c70vl6vvit6h71s7ifwextro6&st=zwzs1m7l&dl=1",
      badges: [
        { text: "Global", class: "badge-gold-translucent" },
        { text: "Steam Key", class: "badge-gold-translucent" },
        { text: "13.1% Discount", class: "badge-green" },
        { text: "1 Left", class: "badge-red" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Premium Game 1X Edition",
      price: "3$",
      img: "https://www.dropbox.com/scl/fi/5nbb9o69m77rk5v1q1u2t/ChatGPT-Image-2-juil.-2026-21_58_47.png?rlkey=69amhmy7w6kr1qfrfvp09k4x4&st=pweg7s7t&e=1&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 75", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Premium Game 2X Edition",
      price: "6$",
      img: "https://www.dropbox.com/scl/fi/hq7cbrazuh0z92rm0bvar/ChatGPT-Image-2-juil.-2026-22_01_25.png?rlkey=u7n22rspxw8wzy5qc881cnd1t&st=d36q3tmp&e=1&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 37", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Premium Game 3X Edition",
      price: "9$",
      img: "https://www.dropbox.com/scl/fi/gogkf1r8ob180cymp6qb3/ChatGPT-Image-2-juil.-2026-22_09_13.png?rlkey=wxe0w0d768jifw648zkdctdmm&st=rvcbli3b&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 25", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Premium Game 5X Edition",
      price: "15$",
      img: "https://www.dropbox.com/scl/fi/uxhfltml808wmctoats2d/ChatGPT-Image-2-juil.-2026-22_12_42.png?rlkey=t3xw8z0leqtudviq7t1bxg40b&st=ixin1mmi&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 15", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Premium Game 10X Edition",
      price: "30$",
      img: "https://www.dropbox.com/scl/fi/zneyfj0m59tfn41ma9gvd/ChatGPT-Image-Jul-2-2026-11_35_54-PM.png?rlkey=4yzjodyvavjyesubhr1l3794d&st=yoi1m6f6&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 7", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Raiders Game 1X",
      price: "3$",
      img: "https://www.dropbox.com/scl/fi/rldkidinhmj4dhsgg7pz0/ChatGPT-Image-3-juil.-2026-11_47_31.png?rlkey=enox6cwwyn7m2g6wbvjdcnc0w&st=46c9j8j9&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 2", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Raiders Game 2X",
      price: "6$",
      img: "https://www.dropbox.com/scl/fi/1w8vwqgkptipdzy4x8hfa/ChatGPT-Image-3-juil.-2026-11_50_28.png?rlkey=zo8z67s51333cvj9j9yl4zh31&st=asws56sb&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 1", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Expedition Game 1X",
      price: "3$",
      img: "https://www.dropbox.com/scl/fi/v3o8m8owe9833orjoyhs9/EX-X1.png?rlkey=fs5lqr3431eysn4q1qb5s0b0b&st=sf5wdwzh&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 4", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Expedition Game 2X",
      price: "6$",
      img: "https://www.dropbox.com/scl/fi/c86vmevgk30upcpqe03d3/EX-X2.png?rlkey=65ok6upzyp4rf9gpq8b99so3k&st=7ayfn19m&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 2", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Expedition Game 4X",
      price: "12$",
      img: "https://www.dropbox.com/scl/fi/t5e3uf4nofmz95ad70vvd/ChatGPT-Image-3-juil.-2026-03_34_14.png?rlkey=krywqss94vbugfnb7gnepfpla&st=n7451yck&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 1", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Kingdom Game 1X",
      price: "3$",
      img: "https://www.dropbox.com/scl/fi/lo9btvpa2ibkm3df6oc1e/ChatGPT-Image-3-juil.-2026-11_04_18.png?rlkey=drar8uzbhbw5pnjauf552fn09&st=1p1avtgb&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 15", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Kingdom Game 3X",
      price: "9$",
      img: "https://www.dropbox.com/scl/fi/imldxys8mrea1h8n6hyyp/CRI-3X.png?rlkey=72sv5j0vnf5d8zlhdu7kd0wyx&st=vqvlyna0&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 5", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Kingdom Game 5X",
      price: "15$",
      img: "https://www.dropbox.com/scl/fi/1qh6bos60prtutuj72ox9/CRI-5X.png?rlkey=f042edoqg4rx471rru9psqtm8&st=w8vw2wzn&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 3", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Kingdom Game 10X",
      price: "30$",
      img: "https://www.dropbox.com/scl/fi/nwsgzh9nhu7ri7jmcfdav/CRI-10X.png?rlkey=kf7g5m555d2yqotxic5xby6hf&st=kumdu80u&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 1", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    },
    {
      title: "Lucky Kingdom Game 15X",
      price: "45$",
      img: "https://www.dropbox.com/scl/fi/5zbwtsxnpmjkot4j7me0e/CRI-15X.png?rlkey=jcwpwm8e5yjz2uj42mbxgkp54&st=k3vv3tww&dl=1",
      badges: [
        { text: "Global", class: "badge-blue-translucent" },
        { text: "Steam Key", class: "badge-blue-translucent" },
        { text: "Stock: 1", class: "badge-blue-translucent" }
      ],
      href: "buy.html"
    }
  ];

  window.selectSimilarProduct = function(title) {
    const p = SIMILAR_PRODUCTS.find(item => item.title === title);
    if (!p) return;

    const badgesHTML = p.badges.map(b => `<span class="buy-product-badge ${b.class}">${b.text}</span>`).join("");

    localStorage.setItem("checkout_title", p.title);
    localStorage.setItem("checkout_img", p.img);
    localStorage.setItem("checkout_price", p.price);
    localStorage.setItem("checkout_badges", badgesHTML);

    const params = new URLSearchParams({
      title: p.title,
      img: p.img,
      price: p.price
    });
    window.location.href = `checkout.html?${params.toString()}`;
  };

  let autoScrollFrame = null;
  let isPaused = false;
  let isDragging = false;
  let startX = 0;
  let scrollLeftStart = 0;

  function renderSimilarProducts() {
    const track = document.getElementById("similar-carousel-track");
    if (!track) return;

    // Get current product title to exclude it if needed
    const currentTitle = (localStorage.getItem("checkout_title") || "").toLowerCase();
    const filtered = SIMILAR_PRODUCTS.filter(p => p.title.toLowerCase() !== currentTitle);
    const productList = filtered.length > 0 ? filtered : SIMILAR_PRODUCTS;

    // Duplicate list so infinite loop scrolling has a seamless reset
    const doubleList = [...productList, ...productList];

    track.innerHTML = doubleList.map(p => `
      <div class="similar-glass-card" onclick="window.selectSimilarProduct(\`${p.title.replace(/`/g, "\\`").replace(/'/g, "\\'")}\`)">
        <div class="similar-glass-glow"></div>
        <div class="similar-card-thumb-container">
          <img src="${p.img}" alt="${p.title}" class="similar-card-thumb" referrerpolicy="no-referrer" onerror="this.src='images/product_placeholder.png'">
        </div>
        <div class="similar-card-body">
          <div class="similar-card-title">${p.title}</div>
          <div class="similar-card-badges">
            ${p.badges.map(b => `<span class="buy-product-badge ${b.class}">${b.text}</span>`).join("")}
          </div>
          <div class="similar-card-footer">
            <span class="similar-card-price">${p.price}</span>
            <button class="similar-buy-now-btn">BUY NOW</button>
          </div>
        </div>
      </div>
    `).join("");

    // Continuous smooth auto-scrolling right-to-left
    if (autoScrollFrame) cancelAnimationFrame(autoScrollFrame);

    const speed = 0.8; // px per frame
    function step() {
      if (!isPaused && !isDragging && track) {
        track.scrollLeft += speed;
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0 && track.scrollLeft >= halfWidth) {
          track.scrollLeft -= halfWidth;
        }
      }
      autoScrollFrame = requestAnimationFrame(step);
    }
    autoScrollFrame = requestAnimationFrame(step);

    // Pause on hover
    const container = document.getElementById("similar-products-section") || track;
    container.addEventListener("mouseenter", () => { isPaused = true; });
    container.addEventListener("mouseleave", () => { isPaused = false; });

    // Drag / Touch handlers
    track.addEventListener("mousedown", e => {
      isDragging = true;
      track.classList.add("is-dragging");
      startX = e.pageX - track.offsetLeft;
      scrollLeftStart = track.scrollLeft;
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        track.classList.remove("is-dragging");
      }
    });

    track.addEventListener("mousemove", e => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX);
      track.scrollLeft = scrollLeftStart - walk;
      
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0) {
        if (track.scrollLeft >= halfWidth) track.scrollLeft -= halfWidth;
        if (track.scrollLeft < 0) track.scrollLeft += halfWidth;
      }
    });

    // Touch support for mobile
    track.addEventListener("touchstart", e => {
      isDragging = true;
      startX = e.touches[0].pageX - track.offsetLeft;
      scrollLeftStart = track.scrollLeft;
    }, { passive: true });

    track.addEventListener("touchend", () => {
      isDragging = false;
    });

    track.addEventListener("touchmove", e => {
      if (!isDragging) return;
      const x = e.touches[0].pageX - track.offsetLeft;
      const walk = (x - startX);
      track.scrollLeft = scrollLeftStart - walk;
      
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0) {
        if (track.scrollLeft >= halfWidth) track.scrollLeft -= halfWidth;
        if (track.scrollLeft < 0) track.scrollLeft += halfWidth;
      }
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSimilarProducts);
  } else {
    renderSimilarProducts();
  }
})();


// =====================================================================
// CUSTOMER REVIEWS SYSTEM (submit + display from Firestore)
// =====================================================================
(function initReviewSystem() {
  function setupReviews() {
    const reviewSection = document.getElementById("checkout-reviews-section");
    if (!reviewSection) return;

    const formContent = document.getElementById("review-form-content");
    const loginPrompt = document.getElementById("review-login-prompt");
    const submitBtn = document.getElementById("submit-review-btn");
    const commentInput = document.getElementById("review-comment-input");
    const photoInput = document.getElementById("review-photo-input");
    const photoPreviews = document.getElementById("review-photo-previews");
    const feedContainer = document.getElementById("reviews-feed-container");
    const emptyState = document.getElementById("reviews-empty-state");
    const countBadge = document.getElementById("reviews-count-badge");
    const starBtns = document.querySelectorAll(".star-btn");

    let selectedRating = 5;
    let uploadedPhotos = []; // base64 strings

    // Show form or login prompt based on auth state
    function updateReviewFormVisibility() {
      const isLoggedIn = localStorage.getItem("profileIsLoggedIn") === "true";
      if (formContent) formContent.style.display = isLoggedIn ? "block" : "none";
      if (loginPrompt) loginPrompt.style.display = isLoggedIn ? "none" : "flex";
    }
    updateReviewFormVisibility();

    // Re-check on auth state change
    window.addEventListener("storage", updateReviewFormVisibility);

    // Star rating interaction
    if (starBtns.length) {
      starBtns.forEach(star => {
        star.addEventListener("click", () => {
          const val = parseInt(star.getAttribute("data-value"));
          selectedRating = val;
          starBtns.forEach((s, i) => {
            s.classList.toggle("active", i < val);
          });
        });
        star.addEventListener("mouseover", () => {
          const val = parseInt(star.getAttribute("data-value"));
          starBtns.forEach((s, i) => {
            s.style.color = i < val ? "#fbbf24" : "";
          });
        });
        star.addEventListener("mouseleave", () => {
          starBtns.forEach(s => { s.style.color = ""; });
        });
      });
    }

    // Photo upload (max 2)
    if (photoInput) {
      photoInput.addEventListener("change", e => {
        const files = Array.from(e.target.files).slice(0, 2 - uploadedPhotos.length);
        files.forEach(file => {
          if (!file.type.startsWith("image/")) return;
          const reader = new FileReader();
          reader.onload = ev => {
            if (uploadedPhotos.length >= 2) return;
            uploadedPhotos.push(ev.target.result);
            renderPhotoPreviews();
          };
          reader.readAsDataURL(file);
        });
        e.target.value = "";
      });
    }

    function renderPhotoPreviews() {
      if (!photoPreviews) return;
      photoPreviews.innerHTML = uploadedPhotos.map((src, i) => `
        <div style="position:relative;display:inline-block;margin:4px;">
          <img src="${src}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,0.2);cursor:pointer;" onclick="openPhotoModal(this.src)" title="Click to view photo">
          <button onclick="event.stopPropagation(); window._removeReviewPhoto(${i})" style="position:absolute;top:-6px;right:-6px;background:#ff5555;border:none;border-radius:50%;width:18px;height:18px;color:#fff;font-size:11px;cursor:pointer;line-height:18px;text-align:center;z-index:2;" title="Remove photo">×</button>
        </div>
      `).join("");
    }

    window._removeReviewPhoto = (idx) => {
      uploadedPhotos.splice(idx, 1);
      renderPhotoPreviews();
    };

    window.deleteUserReview = function(reviewId) {
      // 1. Instant Optimistic UI Removal (0ms Lag)
      if (feedContainer) {
        const cardToDelete = feedContainer.querySelector(`.review-card[data-id="${CSS.escape(reviewId)}"]`) || 
                             feedContainer.querySelector(`.review-card[data-id="${reviewId}"]`);
        if (cardToDelete) {
          cardToDelete.style.transition = "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
          cardToDelete.style.opacity = "0";
          cardToDelete.style.transform = "scale(0.95)";
          cardToDelete.style.maxHeight = "0px";
          cardToDelete.style.paddingTop = "0px";
          cardToDelete.style.paddingBottom = "0px";
          cardToDelete.style.marginTop = "0px";
          cardToDelete.style.marginBottom = "0px";
          cardToDelete.style.overflow = "hidden";
          setTimeout(() => {
            cardToDelete.remove();
            const remainingCards = feedContainer.querySelectorAll(".review-card");
            if (countBadge) countBadge.textContent = `(${remainingCards.length})`;
            if (remainingCards.length === 0 && emptyState) {
              emptyState.style.display = "block";
            }
          }, 250);
        }
      }

      // 2. Track deleted review ID locally so background fetch never re-adds it
      try {
        let deletedIds = JSON.parse(localStorage.getItem("deleted_review_ids") || "[]");
        if (!deletedIds.includes(reviewId)) {
          deletedIds.push(reviewId);
          localStorage.setItem("deleted_review_ids", JSON.stringify(deletedIds));
        }
      } catch (e) {}

      // 3. Remove from localStorage user_submitted_reviews
      try {
        let localReviews = JSON.parse(localStorage.getItem("user_submitted_reviews") || "[]");
        localReviews = localReviews.filter(r => (r.id || `${r.username}_${r.timestamp}`) !== reviewId);
        localStorage.setItem("user_submitted_reviews", JSON.stringify(localReviews));
      } catch (e) {
        console.warn("Error removing review from localStorage:", e);
      }

      // 4. Fire async Firestore delete in background without blocking UI
      if (window.db && window.deleteDoc && window.doc) {
        try {
          window.deleteDoc(window.doc(window.db, "reviews", reviewId))
            .catch(err => console.warn("Firestore delete review warning:", err));
        } catch (e) {
          console.warn("Firestore delete exception:", e);
        }
      }
    };

    // Load and display existing reviews from Firestore + LocalStorage fallback
    function loadReviews() {
      const productKey = (localStorage.getItem("checkout_title") || "default").toLowerCase().replace(/\s+/g, "_");

      let localReviews = [];
      try {
        localReviews = JSON.parse(localStorage.getItem("user_submitted_reviews") || "[]");
      } catch (e) {
        localReviews = [];
      }

      let deletedIds = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem("deleted_review_ids") || "[]");
      } catch (e) {
        deletedIds = [];
      }

      const renderCombined = (firestoreReviews = []) => {
        const combined = [...localReviews, ...firestoreReviews];
        const filtered = combined.filter(r => {
          const key = r.id || `${r.username}_${r.timestamp}`;
          if (deletedIds.includes(key)) return false;
          // Hide specific deleted review
          if (key === "Ahmed Taweb_1785894843951" || (r.username === "Ahmed Taweb" && r.comment === "see")) return false;
          return (r.productKey || "default") === productKey || !r.productKey;
        });
        
        // Deduplicate reviews by ID or timestamp
        const unique = [];
        const seen = new Set();
        filtered.forEach(r => {
          const key = r.id || `${r.username}_${r.timestamp}`;
          if (!seen.has(key) && !deletedIds.includes(key)) {
            seen.add(key);
            unique.push(r);
          }
        });

        unique.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (countBadge) countBadge.textContent = `(${unique.length})`;

        if (unique.length === 0) {
          if (emptyState) emptyState.style.display = "block";
          const existingCards = feedContainer ? feedContainer.querySelectorAll(".review-card") : [];
          existingCards.forEach(c => c.remove());
          return;
        }
        if (emptyState) emptyState.style.display = "none";

        // Render reviews
        if (!feedContainer) return;
        const existingCards = feedContainer.querySelectorAll(".review-card");
        existingCards.forEach(c => c.remove());

        const currentProfileName = (localStorage.getItem("profileName") || "").trim().toLowerCase();
        const isLoggedIn = localStorage.getItem("profileIsLoggedIn") === "true";

        unique.forEach(r => {
          const card = document.createElement("div");
          card.className = "review-card";
          const rId = r.id || `${r.username}_${r.timestamp}`;
          card.setAttribute("data-id", rId);

          const stars = "★".repeat(r.rating || 5) + "☆".repeat(5 - (r.rating || 5));
          const date = r.timestamp ? new Date(r.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
          const photosHTML = (r.photos || []).map(src =>
            `<img src="${src}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,0.15);cursor:pointer;" onclick="openPhotoModal(this.src)" title="Click to view photo" referrerpolicy="no-referrer">`
          ).join("");

          const reviewUsername = (r.username || "").trim().toLowerCase();
          const isOwner = isLoggedIn && currentProfileName && currentProfileName === reviewUsername;

          card.innerHTML = `
            <div class="review-card-header">
              <div class="review-avatar-name">
                <div class="review-avatar">${(r.username || "?")[0].toUpperCase()}</div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span class="review-username">${r.username || "Anonymous"}</span>
                  <span class="review-stars" style="color:#fbbf24; font-size:0.95rem; line-height:1;">${stars}</span>
                </div>
              </div>
              <div class="review-date-top" style="color:rgba(255,255,255,0.6); font-family:'League Spartan','Montserrat',sans-serif; font-size:0.85rem; font-weight:700; font-style:italic;">${date}</div>
            </div>
            ${r.comment ? `<div class="review-comment-text">${r.comment}</div>` : ""}
            ${photosHTML ? `<div class="review-photos-row" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">${photosHTML}</div>` : ""}
            ${isOwner ? `
              <div class="review-card-footer" style="display:flex; justify-content:flex-end; margin-top:12px;">
                <button class="delete-review-btn" onclick="window.deleteUserReview('${rId}')">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  DELETE
                </button>
              </div>
            ` : ""}
          `;
          feedContainer.appendChild(card);
        });
      };

      // Render local instant fallback first for 0ms latency
      renderCombined([]);

      // Sync Firestore in background
      if (window.db && window.collection && window.getDocs) {
        window.getDocs(window.collection(window.db, "reviews"))
          .then(snap => {
            const firestoreReviews = [];
            snap.forEach(doc => firestoreReviews.push({ id: doc.id, ...doc.data() }));
            renderCombined(firestoreReviews);
          })
          .catch(err => {
            console.warn("Could not load Firestore reviews, rendering local fallback:", err);
          });
      }
    }
    loadReviews();

    // Submit review
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const isLoggedIn = localStorage.getItem("profileIsLoggedIn") === "true";
        if (!isLoggedIn) {
          alert("Please sign in to submit a review.");
          return;
        }

        const comment = commentInput ? commentInput.value.trim() : "";
        const username = localStorage.getItem("profileName") || "Anonymous";
        const productKey = (localStorage.getItem("checkout_title") || "default").toLowerCase().replace(/\s+/g, "_");

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        const reviewId = `${username}_${Date.now()}`;
        const reviewData = {
          id: reviewId,
          username,
          rating: selectedRating,
          comment,
          photos: uploadedPhotos.slice(0, 2),
          productKey,
          timestamp: Date.now()
        };

        // Always save locally so submission succeeds and displays immediately
        try {
          let localReviews = JSON.parse(localStorage.getItem("user_submitted_reviews") || "[]");
          localReviews.unshift(reviewData);
          localStorage.setItem("user_submitted_reviews", JSON.stringify(localReviews));
        } catch (e) {
          console.warn("Failed to store review in localStorage:", e);
        }

        const handleSuccess = () => {
          if (commentInput) commentInput.value = "";
          uploadedPhotos = [];
          renderPhotoPreviews();
          selectedRating = 5;
          starBtns.forEach((s, i) => s.classList.toggle("active", i < 5));
          submitBtn.textContent = "✅ Review Submitted!";
          setTimeout(() => {
            submitBtn.textContent = "SUBMIT YOUR REVIEW";
            submitBtn.disabled = false;
          }, 2000);
          loadReviews();
        };

        // Try syncing to Firestore
        if (window.db && window.setDoc && window.doc) {
          window.setDoc(window.doc(window.db, "reviews", reviewId), reviewData)
            .then(() => {
              handleSuccess();
            })
            .catch(err => {
              console.warn("Firestore save fallback trigger (permission or offline):", err);
              handleSuccess();
            });
        } else {
          handleSuccess();
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupReviews);
  } else {
    setupReviews();
  }
})();

// =====================================================================
// GLOBAL PHOTO POPUP MODAL (Enlarged photo preview with Red X close button)
// =====================================================================
function openPhotoModal(imageSrc) {
  if (!imageSrc) return;

  let modalBackdrop = document.getElementById("global-photo-modal-backdrop");

  if (!modalBackdrop) {
    modalBackdrop = document.createElement("div");
    modalBackdrop.id = "global-photo-modal-backdrop";
    modalBackdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 20px;
      box-sizing: border-box;
    `;

    modalBackdrop.innerHTML = `
      <div id="global-photo-modal-content" style="
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        background: rgba(18, 20, 32, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 20px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 255, 255, 0.05);
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(0.9);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <button id="global-photo-modal-close" title="Close" style="
          position: absolute;
          top: -14px;
          right: -14px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          color: #ffffff;
          border: 2px solid #ffffff;
          font-size: 18px;
          font-weight: 800;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(220, 38, 38, 0.6);
          z-index: 1000000;
          transition: transform 0.2s ease, background 0.2s ease;
        ">✕</button>
        <img id="global-photo-modal-img" src="" alt="Enlarged review photo" style="
          max-width: 85vw;
          max-height: 80vh;
          object-fit: contain;
          border-radius: 12px;
          display: block;
          user-select: none;
        ">
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const closeBtn = modalBackdrop.querySelector("#global-photo-modal-close");
    const content = modalBackdrop.querySelector("#global-photo-modal-content");

    closeBtn.addEventListener("mouseenter", () => {
      closeBtn.style.transform = "scale(1.12)";
    });
    closeBtn.addEventListener("mouseleave", () => {
      closeBtn.style.transform = "scale(1)";
    });

    const closeModal = () => {
      modalBackdrop.style.opacity = "0";
      if (content) content.style.transform = "scale(0.9)";
      setTimeout(() => {
        modalBackdrop.style.display = "none";
        document.body.style.overflow = "";
      }, 250);
    };

    closeBtn.addEventListener("click", closeModal);

    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalBackdrop.style.display === "flex") {
        closeModal();
      }
    });
  }

  const imgEl = modalBackdrop.querySelector("#global-photo-modal-img");
  const contentEl = modalBackdrop.querySelector("#global-photo-modal-content");

  if (imgEl) imgEl.src = imageSrc;

  modalBackdrop.style.display = "flex";
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    modalBackdrop.style.opacity = "1";
    if (contentEl) contentEl.style.transform = "scale(1)";
  });
}

window.openPhotoModal = openPhotoModal;

/* ==========================================================================
   Order History Header Button Red Notification Dot System
   ========================================================================== */
function initOrderStatusNotification() {
  const checkInterval = setInterval(() => {
    if (window.firebaseAuth) {
      clearInterval(checkInterval);
      
      const auth = window.firebaseAuth;
      window.onAuthStateChanged(auth, async (user) => {
        const redDot = document.getElementById("order-history-red-dot");
        const orderHistoryBtn = document.getElementById("order-history-btn");
        if (orderHistoryBtn && redDot) {
          orderHistoryBtn.onclick = null; // Clear inline onclick to avoid navigation race condition
          if (!orderHistoryBtn.dataset.hasNotificationListener) {
            orderHistoryBtn.dataset.hasNotificationListener = "true";
            orderHistoryBtn.addEventListener("click", () => {
              console.log("[ORDER NOTIFICATION] Order icon clicked");
              if (user && user.email) {
                const emailLower = user.email.toLowerCase();
                localStorage.setItem(`order_dot_cleared_${emailLower}`, "true");
              }
              localStorage.setItem("order_dot_cleared", "true");
              localStorage.setItem("has_new_order_placed", "false");
              redDot.style.display = "none";
              console.log("[ORDER NOTIFICATION] Notification cleared");
              window.location.href = 'history.html';
            });
          }
        }
        const isHistoryPage = window.location.pathname.includes("history.html");
        
        if (isHistoryPage) {
          if (user && user.email) {
            const emailLower = user.email.toLowerCase();
            localStorage.setItem(`order_dot_cleared_${emailLower}`, "true");
          }
          localStorage.setItem("order_dot_cleared", "true");
          localStorage.setItem("has_new_order_placed", "false");
          if (redDot) redDot.style.display = "none";
          return;
        }
        
        if (!user || !user.email) return;
        
        console.log("[ORDER NOTIFICATION] Checking notification");
        const emailLower = user.email.toLowerCase();
        const hasNewOrderLocal = localStorage.getItem("has_new_order_placed") === "true";
        const hasClearedLocal = localStorage.getItem(`order_dot_cleared_${emailLower}`) === "true" || localStorage.getItem("order_dot_cleared") === "true";
        
        if (hasNewOrderLocal && !hasClearedLocal) {
          if (redDot) {
            redDot.style.display = "block";
            console.log("[ORDER NOTIFICATION] Dot displayed");
          }
        }
        
        try {
          const db = window.db;
          const { collection, query, where, getDocs, getDoc, doc } = window;
          
          if (!db || !collection || !query || !where || !getDocs || !getDoc || !doc) return;
          
          const collRef = collection(db, "orders");
          const queries = [
            query(collRef, where("delivered email", "==", emailLower)),
            query(collRef, where("delivered email", "==", user.email.toUpperCase())),
            query(collRef, where("delivered email", "==", user.email)),
            query(collRef, where("email", "==", emailLower)),
            query(collRef, where("email", "==", user.email.toUpperCase())),
            query(collRef, where("email", "==", user.email))
          ];
          
          const ordersMap = new Map();
          for (const q of queries) {
            try {
              const snap = await getDocs(q);
              snap.forEach((doc) => {
                ordersMap.set(doc.id, { id: doc.id, ...doc.data() });
              });
            } catch (e) {}
          }
          
          // Retrieve last history view time from user profile doc in Firestore (which is fully allowed by rules)
          let lastHistoryViewTime = null;
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              lastHistoryViewTime = userDocSnap.data().lastHistoryViewTime || null;
            }
          } catch (err) {
            console.warn("Failed to fetch lastHistoryViewTime from users collection:", err);
          }

          let hasUnseenFirestoreOrder = false;
          ordersMap.forEach((order) => {
            if (lastHistoryViewTime) {
              const orderTime = new Date(order.time || 0).getTime();
              const viewTime = new Date(lastHistoryViewTime).getTime();
              if (orderTime > viewTime) {
                hasUnseenFirestoreOrder = true;
              }
            } else {
              hasUnseenFirestoreOrder = true;
            }
          });

          const showDot = hasUnseenFirestoreOrder || (hasNewOrderLocal && !hasClearedLocal);
          if (redDot) {
            redDot.style.display = showDot ? "block" : "none";
            if (showDot) {
              console.log("[ORDER NOTIFICATION] Dot displayed");
            }
          }
        } catch (err) {
          console.error("Error checking order status notification dot:", err);
        }
      });
    }
  }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
  initOrderStatusNotification();
});


