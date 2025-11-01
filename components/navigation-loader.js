/**
 * Universal Navigation Loader
 * This script loads the navigation component on all pages
 * Usage: Include this script on every page and call loadNavigation()
 */

// Function to load navigation component
async function loadNavigation() {
  try {
    // Determine the correct path to the navigation component
    let navigationPath = "components/navigation.html";

    // Check if we're in a subdirectory (like story-detail folders)
    // Handle both forward and backward slashes, and all story-detail variants
    const currentPath = window.location.pathname;
    const isInSubfolder =
      currentPath.includes("/story-detail") ||
      currentPath.includes("\\story-detail") ||
      currentPath.includes("story-detail1") ||
      currentPath.includes("story-detail2");

    if (isInSubfolder) {
      navigationPath = "../components/navigation.html";
    }

    console.log("Loading navigation from:", navigationPath);
    console.log("Current path:", currentPath);
    console.log("Is in subfolder:", isInSubfolder);

    const response = await fetch(navigationPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const navigationHTML = await response.text();

    // Find the header element or create one
    let headerElement = document.querySelector(
      "header, .site-header, #masthead"
    );

    if (!headerElement) {
      // If no header found, create one and insert at the beginning of body
      headerElement = document.createElement("header");
      headerElement.id = "masthead";
      headerElement.className = "site-header fusion-header";
      headerElement.setAttribute("role", "banner");
      document.body.insertBefore(headerElement, document.body.firstChild);
    }

    // Insert the navigation HTML
    headerElement.innerHTML = navigationHTML;

    console.log("Navigation loaded successfully");

    // Trigger any custom events for navigation loaded
    document.dispatchEvent(new Event("navigationLoaded"));
  } catch (error) {
    console.error("Error loading navigation:", error);

    // Fallback navigation if component fails to load
    createFallbackNavigation();
  }
}

// Fallback navigation in case the component fails to load
function createFallbackNavigation() {
  let headerElement = document.querySelector("header, .site-header, #masthead");

  if (!headerElement) {
    headerElement = document.createElement("header");
    headerElement.id = "masthead";
    headerElement.className = "site-header fusion-header";
    headerElement.setAttribute("role", "banner");
    document.body.insertBefore(headerElement, document.body.firstChild);
  }

  headerElement.innerHTML = `
        <div class="fusion-tb-header">
            <div class="fusion-fullwidth" style="padding: 30px 40px;">
                <div class="fusion-builder-row fusion-row">
                    <div class="logo">
                        <a href="index.html">Andrea<strong>Aimar</strong></a>
                    </div>
                    <nav class="awb-menu_desktop">
                        <ul class="awb-menu__main-ul">
                            <li><a href="stories.html">STORIES</a></li>
                            <li><a href="stories1.html">STORIES1</a></li>
                            <li><a href="stories2.html">STORIES2</a></li>
                            <li><a href="about.html">ABOUT</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    `;

  console.log("Fallback navigation created");
}

// Auto-load navigation when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Only load if navigation component doesn't already exist
  if (!document.querySelector(".fusion-tb-header")) {
    loadNavigation();
  }
});

// Function to update active menu item
function updateActiveMenuItem() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const menuItems = document.querySelectorAll(".awb-menu__main-a");

  menuItems.forEach((item) => {
    const href = item.getAttribute("href");
    const listItem = item.closest("li");

    // Remove any existing active classes
    listItem.classList.remove("current-menu-item");

    // Add active class to current page
    if (
      href === currentPage ||
      (currentPage === "index.html" && href === "index.html") ||
      (currentPage === "" && href === "index.html")
    ) {
      listItem.classList.add("current-menu-item");
    }
  });
}

// Update active menu item when navigation is loaded
document.addEventListener("navigationLoaded", updateActiveMenuItem);

// Export functions for manual use if needed
window.NavigationLoader = {
  load: loadNavigation,
  updateActive: updateActiveMenuItem,
  createFallback: createFallbackNavigation,
};
