// Theme initialization script to prevent white flash
(function() {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme');
  let theme = 'light';
  
  if (savedTheme === 'dark' || savedTheme === 'light') {
    theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = 'dark';
  }
  
  // Apply theme immediately
  document.documentElement.setAttribute('data-theme', theme);
  
  // Set colors immediately on html element
  if (theme === 'dark') {
    document.documentElement.style.backgroundColor = '#0d1117';
    document.documentElement.style.color = '#f0f6fc';
  } else {
    document.documentElement.style.backgroundColor = '#ffffff';
    document.documentElement.style.color = '#1a1a1a';
  }
  
  // Wait for DOM to be ready before setting body styles
  function setBodyStyles() {
    if (document.body) {
      document.body.style.backgroundColor = theme === 'dark' ? '#0d1117' : '#ffffff';
      document.body.style.color = theme === 'dark' ? '#f0f6fc' : '#1a1a1a';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.fontFamily = 'Inter, sans-serif';
      document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    } else {
      // If body doesn't exist yet, wait a bit and try again
      setTimeout(setBodyStyles, 10);
    }
  }
  
  // Try to set body styles immediately or wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setBodyStyles);
  } else {
    setBodyStyles();
  }
})();
