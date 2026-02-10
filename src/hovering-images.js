// Define the class (safe to parse on server)
class HoveringImages extends HTMLElement {
  static get observedAttributes() {
    return ["images"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._imagesConfig = null;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          perspective: 800px;
          width: 100%;
          height: 100%;
        }

        .container {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .hovering-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          will-change: transform;
          pointer-events: none;
          mix-blend-mode: multiply;
        }

        @keyframes float-anim {
          0% { transform: translate3d(0, 0, var(--z, 0px)); }
          50% { transform: translate3d(var(--float-x, 0px), var(--float-y, -12px), var(--z, 0px)); }
          100% { transform: translate3d(0, 0, var(--z, 0px)); }
        }
      </style>

      <div class="container"></div>
    `;

    this.container = this.shadowRoot.querySelector(".container");
    this.observer = null;
  }

  connectedCallback() {
    this.render();
    this.setupObserver();
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "images" && oldValue !== newValue) {
      this.render();
    }
  }

  // Property setter for programmatic configuration
  set images(config) {
    // Handle both array and JSON string input
    if (typeof config === "string") {
      try {
        this._imagesConfig = JSON.parse(config);
      } catch (e) {
        console.error("Invalid JSON string passed to images property:", e);
        this._imagesConfig = null;
      }
    } else {
      this._imagesConfig = config;
    }
    this.render();
  }

  get images() {
    return this._imagesConfig;
  }

  setupObserver() {
    // Watch for changes to child elements
    this.observer = new MutationObserver(() => this.render());
    this.observer.observe(this, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: [
        "src",
        "data-direction",
        "data-strength",
        "data-z",
        "data-duration",
        "data-delay",
      ],
    });
  }

  render() {
    // Clear existing images
    this.container.innerHTML = "";

    let imagesData = [];

    // Check if images are provided via attribute (JSON string)
    const imagesAttr = this.getAttribute("images");
    if (imagesAttr) {
      try {
        const parsed = JSON.parse(imagesAttr);
        if (Array.isArray(parsed)) {
          imagesData = parsed;
        } else {
          console.error(
            "Images attribute must be an array, got:",
            typeof parsed
          );
          return;
        }
      } catch (e) {
        console.error("Invalid JSON in images attribute:", e);
        return;
      }
    }
    // Check if images are provided via property
    else if (this._imagesConfig) {
      if (Array.isArray(this._imagesConfig)) {
        imagesData = this._imagesConfig;
      } else {
        console.error(
          "Images property must be an array, got:",
          typeof this._imagesConfig
        );
        return;
      }
    }
    // Otherwise, get from child elements
    else {
      const children = Array.from(this.children).filter(
        (child) => child.tagName === "IMG" || child.hasAttribute("data-src")
      );

      if (children.length === 0) return;

      imagesData = children.map((child, index) => ({
        src: child.getAttribute("src") || child.getAttribute("data-src"),
        direction: child.getAttribute("data-direction") || "y",
        strength: Number(child.getAttribute("data-strength") || 12),
        z: Number(child.getAttribute("data-z") || index * 15),
        duration: Number(
          child.getAttribute("data-duration") || 6 + index * 1.5
        ),
        delay: Number(child.getAttribute("data-delay") || -index),
      }));
    }

    // Validate that imagesData is an array (safety check)
    if (!Array.isArray(imagesData)) {
      console.error("imagesData must be an array, got:", typeof imagesData);
      return;
    }

    // Create hovering images from configuration
    imagesData.forEach((config, index) => {
      const img = document.createElement("img");
      img.className = "hovering-img";

      if (config.src) {
        img.src = config.src;
      }

      // Get configuration with defaults
      const direction = config.direction || "y";
      const strength = Number(config.strength ?? 12);
      const z = Number(config.z ?? index * 15);
      const duration = Number(config.duration ?? 6 + index * 1.5);
      const delay = Number(config.delay ?? -index);

      // Calculate float direction
      let x = 0;
      let y = 0;
      switch (direction) {
        case "x":
          x = strength;
          break;
        case "xy":
          x = strength * 0.7;
          y = -strength * 0.7;
          break;
        case "y":
        default:
          y = -strength;
      }

      // Apply individual styles
      img.style.setProperty("--float-x", `${x}px`);
      img.style.setProperty("--float-y", `${y}px`);
      img.style.setProperty("--z", `${z}px`);
      img.style.animation = `float-anim ${duration}s ease-in-out infinite`;
      img.style.animationDelay = `${delay}s`;

      this.container.appendChild(img);
    });
  }
}

// Register the component **only in the browser**
if (typeof window !== "undefined" && !customElements.get("hovering-images")) {
  customElements.define("hovering-images", HoveringImages);
}

// Export the class for optional use (safe in SSR)
export default HoveringImages;
