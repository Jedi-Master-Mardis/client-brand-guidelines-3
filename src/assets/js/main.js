// Main JavaScript file
// Add any custom JavaScript functionality here

document.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation tree persistence
  initNavPersistence();
  // Set selected state for current page
  setSelectedTreeItem();
  // Update selection when clicking on tree items
  setupTreeItemClickHandlers();
});

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

