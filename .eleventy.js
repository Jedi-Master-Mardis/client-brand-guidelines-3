module.exports = function(eleventyConfig) {
  // Copy webawesome assets
  eleventyConfig.addPassthroughCopy("webawesome");
  
  // Copy assets from src directory
  eleventyConfig.addPassthroughCopy("src/assets");
  
  // Add a filter to get current year
  eleventyConfig.addFilter("year", function() {
    return new Date().getFullYear();
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

