// Main JavaScript file
// Add any custom JavaScript functionality here

document.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation tree persistence
  initNavPersistence();
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

