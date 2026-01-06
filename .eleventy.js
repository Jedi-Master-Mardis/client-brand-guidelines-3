const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

const markdownItOptions = {
  html: true,
  breaks: true,
  linkify: true
};

// Configure markdown-it with anchor plugin
// Use 11ty's slugify to ensure consistent anchor ID generation
const md = new markdownIt(markdownItOptions).use(markdownItAnchor, {
  level: [2, 3, 4, 5, 6],
  permalink: markdownItAnchor.permalink.ariaHidden({
    class: 'heading-anchor',
    symbol: '#',
    ariaLabel: 'Permalink',
    placement: 'after',
    assistiveText: title => `Permalink to "${title}"`
  }),
  slugify: function(text) {
    // Use the same slugify logic as anchorId filter
    return String(text)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters (including apostrophes)
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
});

module.exports = function(eleventyConfig) {
  // Copy webawesome assets
  eleventyConfig.addPassthroughCopy("webawesome");
  
  // Copy assets from src directory
  eleventyConfig.addPassthroughCopy("src/assets");
  
  // Copy images from src directory
  eleventyConfig.addPassthroughCopy("src/images");
  
  // Add markdown filter
  eleventyConfig.addFilter("markdown", function(value) {
    if (!value) return "";
    return md.render(String(value));
  });
  
  // Add a filter to get current year
  eleventyConfig.addFilter("year", function() {
    return new Date().getFullYear();
  });
  
  // Add a filter to generate anchor IDs from text
  eleventyConfig.addFilter("anchorId", function(text) {
    if (!text) return "";
    return String(text)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  });
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};

