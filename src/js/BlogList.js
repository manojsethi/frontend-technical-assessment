/**
 * Blog List Component (partial implementation)
 * Candidates must complete: sorting, filtering, search, robust error handling, and caching.
 */
export class BlogList {
  constructor(container) {
    this.container = container;
    this.listContainer = container.querySelector(".blog-list-content");
    this.loadingIndicator = container.querySelector(".loading-indicator");
    this.errorContainer = container.querySelector(".error-container");

    this.sortSelect = container.querySelector(".sort-select");
    this.filterSelect = container.querySelector(".filter-select");
    this.searchInput = container.querySelector(".search-input");

    this.apiUrl = "https://frontend-blog-lyart.vercel.app/blogsData.json";
    this.items = [];
    this.filteredItems = [];
    this.page = 1;
    this.perPage = 10;

    // Bind handlers
    this.onSortChange = this.onSortChange.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.onSearchInput = this.onSearchInput.bind(this);
  }

  async init() {
    try {
      this.showLoading();
      await this.fetchData();
      this.setupEventListeners();
      this.render();
    } catch (err) {
      this.showError(err);
    } finally {
      this.hideLoading();
    }
  }

  async fetchData() {
    // TODO (candidate): add basic caching and retry logic
    const res = await fetch(this.apiUrl);
    if (!res.ok) throw new Error("Failed to fetch blogs");
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Unexpected API response");
    this.items = data;
    this.filteredItems = [...data];
  }

  setupEventListeners() {
    this.sortSelect?.addEventListener("change", this.onSortChange);
    this.filterSelect?.addEventListener("change", this.onFilterChange);
    let t;
    this.searchInput?.addEventListener("input", (e) => {
      clearTimeout(t);
      t = setTimeout(() => this.onSearchInput(e), 250);
    });
  }

  render() {
    // Always show exactly 10 blogs on every render
    const slice = this.filteredItems.slice(0, 10);
    this.listContainer.innerHTML = slice
      .map(
        (item) => `
            <article class=\"blog-item\">\n                <img src=\"${
              item.image
            }\" alt=\"\" class=\"blog-image\" />\n                <div class=\"blog-content\">\n                    <h3 class=\"blog-title\">${
          item.title
        }</h3>\n                    <div class=\"blog-meta\">\n                        <span class=\"blog-author\">${
          item.author
        }</span>\n                        <time class=\"blog-date\">${new Date(
          item.published_date
        ).toLocaleDateString()}</time>\n                        <span class=\"blog-reading-time\">${
          item.reading_time
        }</span>\n                    </div>\n                    <p class=\"blog-excerpt\">${
          item.content
        }</p>\n                    <div class=\"blog-tags\">${(item.tags || [])
          .map((t) => `<span class=\"tag\">${t}</span>`)
          .join("")}</div>\n                </div>\n            </article>
        `
      )
      .join("");

    if (slice.length === 0) {
      this.listContainer.innerHTML = '<p class="no-results">No blogs found</p>';
    }
  }

  // Implement sorting
  onSortChange(e) {
    const by = e.target.value;

    // Start with base items
    let baseItems = [...this.items];

    // Apply current filter if active
    const currentFilter = this.filterSelect?.value;
    if (currentFilter) {
      baseItems = baseItems.filter((item) => {
        return (
          item.category === currentFilter ||
          (item.tags && item.tags.some((tag) => tag === currentFilter))
        );
      });
    }

    // Apply current search if active
    const currentSearch = this.searchInput?.value?.toLowerCase();
    if (currentSearch) {
      baseItems = baseItems.filter((item) => {
        return (
          item.title.toLowerCase().includes(currentSearch) ||
          (item.content && item.content.toLowerCase().includes(currentSearch))
        );
      });
    }

    // Apply sorting
    if (by) {
      baseItems = baseItems.sort((a, b) => {
        switch (by) {
          case "date":
            return new Date(b.published_date) - new Date(a.published_date);
          case "reading_time":
            return parseInt(a.reading_time) - parseInt(b.reading_time);
          case "category":
            return (a.category || "").localeCompare(b.category || "");
          default:
            return 0;
        }
      });
    }

    this.filteredItems = baseItems;
    this.render();
  }

  // Implement filtering
  onFilterChange(e) {
    const val = e.target.value; // Gadgets | Startups | Writing | ''

    // Start with base items
    let baseItems = [...this.items];

    // Apply filter
    if (val) {
      baseItems = baseItems.filter((item) => {
        return (
          item.category === val ||
          (item.tags && item.tags.some((tag) => tag === val))
        );
      });
    }

    // Apply current search if active
    const currentSearch = this.searchInput?.value?.toLowerCase();
    if (currentSearch) {
      baseItems = baseItems.filter((item) => {
        return (
          item.title.toLowerCase().includes(currentSearch) ||
          (item.content && item.content.toLowerCase().includes(currentSearch))
        );
      });
    }

    // Apply current sort if active
    const currentSort = this.sortSelect?.value;
    if (currentSort) {
      baseItems = baseItems.sort((a, b) => {
        switch (currentSort) {
          case "date":
            return new Date(b.published_date) - new Date(a.published_date);
          case "reading_time":
            return parseInt(a.reading_time) - parseInt(b.reading_time);
          case "category":
            return (a.category || "").localeCompare(b.category || "");
          default:
            return 0;
        }
      });
    }

    this.filteredItems = baseItems;
    this.render();
  }

  // Implement search by title
  onSearchInput(e) {
    const q = (e.target.value || "").toLowerCase();

    // Start with base items
    let baseItems = [...this.items];

    // Apply current filter if active
    const currentFilter = this.filterSelect?.value;
    if (currentFilter) {
      baseItems = baseItems.filter((item) => {
        return (
          item.category === currentFilter ||
          (item.tags && item.tags.some((tag) => tag === currentFilter))
        );
      });
    }

    // Apply current sort if active
    const currentSort = this.sortSelect?.value;
    if (currentSort) {
      baseItems = baseItems.sort((a, b) => {
        switch (currentSort) {
          case "date":
            return new Date(b.published_date) - new Date(a.published_date);
          case "reading_time":
            return parseInt(a.reading_time) - parseInt(b.reading_time);
          case "category":
            return (a.category || "").localeCompare(b.category || "");
          default:
            return 0;
        }
      });
    }

    // Apply search if query exists
    if (q) {
      this.filteredItems = baseItems.filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          (item.content && item.content.toLowerCase().includes(q))
        );
      });
    } else {
      // If no search query, use the filtered and sorted items
      this.filteredItems = baseItems;
    }

    // Remove duplicates based on unique identifier (title + author)
    this.filteredItems = this.filteredItems.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.title === item.title && t.author === item.author
        )
    );
    this.render();
  }

  showLoading() {
    this.loadingIndicator?.classList.remove("hidden");
  }
  hideLoading() {
    this.loadingIndicator?.classList.add("hidden");
  }
  showError(err) {
    if (!this.errorContainer) return;
    this.errorContainer.classList.remove("hidden");
    this.errorContainer.textContent = `Error: ${err.message}`;
  }
}
