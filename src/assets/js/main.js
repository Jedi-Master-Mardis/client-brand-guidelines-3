// Main JavaScript file
// Add any custom JavaScript functionality here

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme toggle
  initThemeToggle();
  // Initialize navigation tree persistence
  initNavPersistence();
  // Set selected state for current page
  setSelectedTreeItem();
  // Update selection when clicking on tree items
  setupTreeItemClickHandlers();
  // Setup anchor link animations
  setupAnchorAnimations();
  // Convert heading anchor links to copy buttons
  convertHeadingAnchorsToCopyButtons();
});

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
  const STORAGE_KEY = 'theme-preference';
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const html = document.documentElement;
  
  if (!themeToggle || !themeIcon) return;
  
  // Get saved theme preference or default to light
  const getStoredTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    // Check system preference if no stored preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };
  
  // Apply theme
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      html.classList.add('wa-dark');
      html.classList.remove('wa-light');
      themeIcon.name = 'sun';
      themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      html.classList.add('wa-light');
      html.classList.remove('wa-dark');
      themeIcon.name = 'moon';
      themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  };
  
  // Initialize theme on load
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme);
  
  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    const currentTheme = html.classList.contains('wa-dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
  
  // Listen for system theme changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't set a preference
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

/**
 * Persist navigation tree expanded/collapsed state
 */
function initNavPersistence() {
  const STORAGE_KEY = 'nav-tree-state';
  const tree = document.querySelector('.sidebar-nav wa-tree');
  
  if (!tree) return;
  
  // Wait for Web Awesome components to be defined
  if (customElements.get('wa-tree-item')) {
    setupPersistence();
  } else {
    // Wait for components to load
    window.addEventListener('load', () => {
      setTimeout(setupPersistence, 100);
    });
  }
  
  function setupPersistence() {
    // Get all tree items
    const allTreeItems = tree.querySelectorAll('wa-tree-item');
    const treeItemsWithChildren = [];
    
    // Find tree items that have child tree items
    allTreeItems.forEach(item => {
      const hasChildren = item.querySelector('wa-tree-item') !== null;
      if (hasChildren) {
        treeItemsWithChildren.push(item);
      }
    });
    
    // Restore saved state
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    treeItemsWithChildren.forEach((item) => {
      // Get a unique identifier for this tree item (use the link text or href)
      const link = item.querySelector('a');
      let identifier;
      
      if (link) {
        // Use href as identifier (more reliable than text)
        identifier = link.getAttribute('href') || link.textContent.trim();
      } else {
        // Fallback to text content
        identifier = item.textContent.trim();
      }
      
      // Restore expanded state
      if (savedState[identifier] === true) {
        item.expanded = true;
      }
      
      // Listen for expand/collapse events
      item.addEventListener('wa-expand', () => {
        updateSavedState(identifier, true);
      });
      
      item.addEventListener('wa-collapse', () => {
        updateSavedState(identifier, false);
      });
    });
  }
  
  function updateSavedState(identifier, expanded) {
    const currentState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    currentState[identifier] = expanded;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  }
}

/**
 * Set the selected state on the tree item for the current page
 */
function setSelectedTreeItem() {
  const tree = document.querySelector('.sidebar-nav wa-tree');
  if (!tree) return;
  
  // Wait for Web Awesome components to be defined
  const setupSelection = () => {
    const currentPath = window.location.pathname;
    const allTreeItems = tree.querySelectorAll('wa-tree-item');
    
    // Clear all selections first (following Web Awesome pattern)
    allTreeItems.forEach(item => {
      item.selected = false;
    });
    
    // Find and select the current page's tree item
    // Get the current hash if present
    const currentHash = window.location.hash ? window.location.hash.substring(1) : null;
    const currentPathWithHash = currentPath + (currentHash ? '#' + currentHash : '');
    
    // First, find all matching items and select the most specific one
    const matchingItems = [];
    
    allTreeItems.forEach(item => {
      const link = item.querySelector('a');
      if (link) {
        const linkHref = link.getAttribute('href');
        const linkPath = linkHref.split('#')[0].replace(/\/$/, '') || '/';
        const linkHash = linkHref.includes('#') ? linkHref.split('#')[1] : null;
        const normalizedCurrent = currentPath.replace(/\/$/, '') || '/';
        
        // Priority 3: Exact match including hash (highest priority)
        if (linkPath === normalizedCurrent && linkHash === currentHash && currentHash) {
          matchingItems.push({ item, priority: 3, link: linkHref, hasHash: true });
        }
        // Priority 2: Exact path match without hash (or no hash in URL)
        else if (linkPath === normalizedCurrent && !linkHash && !currentHash) {
          matchingItems.push({ item, priority: 2, link: linkHref, hasHash: false });
        }
        // Priority 1: Parent path match (only if no exact match exists)
        else if (normalizedCurrent.startsWith(linkPath + '/') && !linkHash) {
          matchingItems.push({ item, priority: 1, link: linkHref, hasHash: false });
        }
      }
    });
    
    // Select only the most specific match (highest priority, longest path)
    if (matchingItems.length > 0) {
      // Sort by priority (descending) then by path length (descending)
      matchingItems.sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        // If same priority, prefer items with hash if we have a hash
        if (currentHash && b.hasHash !== a.hasHash) {
          return b.hasHash ? 1 : -1;
        }
        return b.link.length - a.link.length;
      });
      
      // Select only the first (most specific) match
      const selectedItem = matchingItems[0].item;
      selectedItem.selected = true;
      
      // Also expand parent items to show the selected item (but don't select them)
      let parent = selectedItem.parentElement;
      while (parent && parent.tagName === 'WA-TREE-ITEM') {
        parent.expanded = true;
        // Explicitly ensure parent is NOT selected
        parent.selected = false;
        parent = parent.parentElement;
      }
    }
  };
  
  if (customElements.get('wa-tree-item')) {
    setupSelection();
  } else {
    window.addEventListener('load', () => {
      setTimeout(setupSelection, 100);
    });
  }
}

/**
 * Setup click handlers to update selection when clicking tree items
 */
function setupTreeItemClickHandlers() {
  const tree = document.querySelector('.sidebar-nav wa-tree');
  if (!tree) return;
  
  const setupClickHandlers = () => {
    // Listen for clicks on tree item links
    tree.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link && link.closest('wa-tree-item')) {
        // Small delay to allow navigation to happen, then update selection
        setTimeout(() => {
          setSelectedTreeItem();
        }, 100);
      }
    });
    
    // Also listen for hash changes (when clicking anchor links)
    window.addEventListener('hashchange', () => {
      setSelectedTreeItem();
    });
  };
  
  if (customElements.get('wa-tree-item')) {
    setupClickHandlers();
  } else {
    window.addEventListener('load', () => {
      setTimeout(setupClickHandlers, 100);
    });
  }
}

/**
 * Setup tada animation for anchor links when navigated to
 */
function setupAnchorAnimations() {
  // Wait for wa-animation component to be available
  const initAnimations = () => {
    // Handle initial hash on page load
    if (window.location.hash) {
      // Wait for page to fully load and scroll to complete
      window.addEventListener('load', () => {
        setTimeout(() => {
          animateTargetHeading(window.location.hash);
        }, 500);
      });
    } else {
      // If no hash, animate the h1 on page load (for page-level nav links)
      window.addEventListener('load', () => {
        setTimeout(() => {
          const h1 = document.querySelector('.page-header h1');
          if (h1 && h1.id) {
            animateTargetHeading('#' + h1.id);
          }
        }, 300);
      });
    }
    
    // Handle hash changes (when clicking anchor links)
    window.addEventListener('hashchange', () => {
      if (window.location.hash) {
        // Wait for smooth scroll to complete
        setTimeout(() => {
          animateTargetHeading(window.location.hash);
        }, 500);
      }
    });
    
    // Handle clicks on anchor links (including nav links)
    document.addEventListener('click', (event) => {
      const anchor = event.target.closest('a');
      if (!anchor) return;
      
      const href = anchor.getAttribute('href');
      if (!href) return;
      
      // Handle page-level nav links (no hash) - animate h1
      if (!href.includes('#') && anchor.closest('.sidebar-nav')) {
        const [path, hashPart] = href.split('#');
        const normalizePath = (p) => {
          if (!p || p === '') return window.location.pathname;
          p = p.replace(/\/$/, '') || '/';
          if (p.startsWith('/')) return p;
          return new URL(p, window.location.href).pathname.replace(/\/$/, '') || '/';
        };
        
        const normalizedHrefPath = normalizePath(path);
        const normalizedCurrentPath = window.location.pathname.replace(/\/$/, '') || '/';
        const isSamePage = normalizedHrefPath === normalizedCurrentPath;
        
        // If it's a same-page link (shouldn't happen, but handle it)
        if (isSamePage) {
          setTimeout(() => {
            const h1 = document.querySelector('.page-header h1');
            if (h1 && h1.id) {
              animateTargetHeading('#' + h1.id);
            }
          }, 300);
        }
        // For different pages, the page will reload and the load event handler will animate h1
        return;
      }
      
      // Check if it's an anchor link (contains #)
      if (href.includes('#') && href !== '#') {
        const [path, hashPart] = href.split('#');
        const hash = '#' + hashPart;
        
        // Normalize paths for comparison (remove trailing slashes, handle relative paths)
        const normalizePath = (p) => {
          if (!p || p === '') return window.location.pathname;
          // Remove trailing slash
          p = p.replace(/\/$/, '') || '/';
          // If it starts with /, it's absolute
          if (p.startsWith('/')) return p;
          // Otherwise, resolve relative to current path
          return new URL(p, window.location.href).pathname.replace(/\/$/, '') || '/';
        };
        
        const normalizedHrefPath = normalizePath(path);
        const normalizedCurrentPath = window.location.pathname.replace(/\/$/, '') || '/';
        const isSamePage = normalizedHrefPath === normalizedCurrentPath;
        
        // If it's a nav link with a hash on the same page, handle scroll manually
        if (anchor.closest('.sidebar-nav') && isSamePage) {
          const id = hashPart;
          const targetElement = document.getElementById(id);
          
          if (targetElement) {
            event.preventDefault();
            
            // Update URL first
            window.history.pushState(null, '', hash);
            
            // Get header heights for calculation
            const waPage = document.querySelector('wa-page');
            const headerHeight = waPage 
              ? parseFloat(getComputedStyle(waPage).getPropertyValue('--header-height')) || 64
              : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 64;
            const subheaderHeight = waPage
              ? parseFloat(getComputedStyle(waPage).getPropertyValue('--subheader-height')) || 0
              : 0;
            const offset = headerHeight + subheaderHeight + 16; // 16px = 1rem
            
            // Calculate the target scroll position
            const rect = targetElement.getBoundingClientRect();
            const absoluteTop = rect.top + window.pageYOffset;
            const targetScroll = absoluteTop - offset;
            
            // Scroll to the calculated position
            window.scrollTo({
              top: Math.max(0, targetScroll),
              behavior: 'smooth'
            });
            
            // Trigger animation after scroll completes
            setTimeout(() => {
              animateTargetHeading(hash);
              // Manually trigger hashchange for other listeners
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }, 600);
          }
        } else if (isSamePage) {
          // For same-page anchor links (not nav), delay to allow smooth scroll to complete first
          setTimeout(() => {
            animateTargetHeading(hash);
          }, 500);
        }
        // If it's a different page, let the browser handle navigation normally
      }
    });
  };
  
  if (customElements.get('wa-animation')) {
    initAnimations();
  } else {
    window.addEventListener('load', () => {
      setTimeout(initAnimations, 100);
    });
  }
}

/**
 * Animate a heading when it's the target of an anchor link
 */
function animateTargetHeading(hash) {
  if (!hash || hash === '#') return;
  
  // Remove # from hash to get the ID
  const id = hash.substring(1);
  const targetElement = document.getElementById(id);
  
  if (!targetElement) return;
  
  // Check if it's a heading element
  const heading = targetElement.tagName.match(/^H[1-6]$/) ? targetElement : null;
  if (!heading) return;
  
  // Get or create animation wrapper for this heading
  let animation = heading.closest('wa-animation');
  
  if (!animation) {
    // Create animation wrapper if it doesn't exist
    const parent = heading.parentNode;
    
    animation = document.createElement('wa-animation');
    animation.name = 'pulse';
    animation.duration = 1000;
    animation.iterations = 1;
    animation.easing = 'ease-in-out';
    
    // Wrap the heading with the animation
    parent.insertBefore(animation, heading);
    animation.appendChild(heading);
  }
  
  // Trigger the animation
  // Reset first to allow restart
  animation.play = false;
  // Force a reflow to ensure reset takes effect
  void animation.offsetHeight;
  // Use requestAnimationFrame to ensure the reset is processed
  requestAnimationFrame(() => {
    animation.play = true;
  });
}

/**
 * Convert heading anchor links to copy buttons
 */
function convertHeadingAnchorsToCopyButtons() {
  // Wait for wa-copy-button component to be available
  const initConversion = () => {
    // Handle h1 copy button (already a copy button, just needs value set)
    const h1CopyButton = document.getElementById('h1-copy-button');
    if (h1CopyButton) {
      const hash = h1CopyButton.getAttribute('data-hash');
      if (hash) {
        const urlToCopy = window.location.origin + window.location.pathname + '#' + hash;
        h1CopyButton.setAttribute('value', urlToCopy);
      }
    }
    
    // Find all heading anchor links (markdown-generated h2-h6)
    const anchorLinks = document.querySelectorAll('a.heading-anchor');
    
    anchorLinks.forEach(anchor => {
      // Skip if already converted
      if (anchor.tagName === 'WA-COPY-BUTTON') return;
      
      // Get the full URL to copy
      const href = anchor.getAttribute('href');
      let urlToCopy;
      
      if (href && href.startsWith('#')) {
        // Relative hash link - construct full URL
        urlToCopy = window.location.origin + window.location.pathname + href;
      } else if (href) {
        // Absolute or relative URL
        urlToCopy = new URL(href, window.location.href).href;
      } else {
        // Fallback to current page URL
        urlToCopy = window.location.href;
      }
      
      // Create copy button
      const copyButton = document.createElement('wa-copy-button');
      copyButton.setAttribute('value', urlToCopy);
      copyButton.setAttribute('size', 'small');
      copyButton.className = 'heading-anchor';
      copyButton.setAttribute('copy-label', 'Copy link');
      copyButton.setAttribute('success-label', 'Copied!');
      
      // Replace the anchor link with the copy button
      anchor.parentNode.replaceChild(copyButton, anchor);
    });
  };
  
  if (customElements.get('wa-copy-button')) {
    initConversion();
  } else {
    // Wait for component to load
    window.addEventListener('load', () => {
      setTimeout(initConversion, 100);
    });
  }
}

