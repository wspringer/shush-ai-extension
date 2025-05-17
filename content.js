// Utility function to check if a post contains forbidden words and return match info
function getForbiddenWordContext(text) {
  const regex = /\b(ai|llm)\b/gi;
  let match;
  const contexts = [];
  while ((match = regex.exec(text)) !== null) {
    const start = Math.max(0, match.index - 30);
    const end = Math.min(text.length, match.index + match[0].length + 30);
    const before = text.slice(start, match.index);
    const keyword = `*${match[0].toUpperCase()}*`;
    const after = text.slice(match.index + match[0].length, end);
    let context = `${before}${keyword}${after}`;
    context = context.replace(/[\r\n]+/g, " ");
    contexts.push(context);
  }
  return contexts;
}

// Function to hide posts containing forbidden words
function filterPosts() {
  // LinkedIn feed posts typically have this selector
  const postSelectors = [
    "div.feed-shared-update-v2", // main feed posts
    "div.update-components-actor", // sometimes used for post containers
    "div.feed-shared-actor", // another variant
    "div.scaffold-finite-scroll__content > div", // fallback for feed items
  ];
  postSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((post) => {
      if (!post.hasAttribute("data-ai-llm-filtered")) {
        const text = post.innerText || "";
        const contexts = getForbiddenWordContext(text);
        if (contexts.length > 0) {
          contexts.forEach((context) => {
            console.log("[AI/LLM Filter] Hiding post context:", context);
          });
          post.style.display = "none";
        }
        post.setAttribute("data-ai-llm-filtered", "true");
      }
    });
  });
}

// Initial filter
filterPosts();

// Observe for dynamically loaded posts
const feedContainer =
  document.querySelector("div.scaffold-finite-scroll__content") ||
  document.body;
const observer = new MutationObserver(() => {
  filterPosts();
});
observer.observe(feedContainer, { childList: true, subtree: true });
