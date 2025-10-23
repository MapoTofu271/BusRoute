/**
 * Event Manager - Centralized event handling system
 * This provides a clean way to manage multiple events for different components
 */

class EventManager {
    constructor() {
        this.eventListeners = new Map();
        this.delegatedEvents = new Map();
        this.init();
    }

    init() {
        // Set up global event delegation
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('change', this.handleGlobalChange.bind(this));
        document.addEventListener('submit', this.handleGlobalSubmit.bind(this));
    }

    /**
     * Register event handlers for specific selectors
     * @param {string} event - Event type (click, change, etc.)
     * @param {string} selector - CSS selector or data attribute
     * @param {function} handler - Event handler function
     * @param {object} context - Context to bind the handler to
     */
    on(event, selector, handler, context = null) {
        if (!this.delegatedEvents.has(event)) {
            this.delegatedEvents.set(event, new Map());
        }
        
        const boundHandler = context ? handler.bind(context) : handler;
        this.delegatedEvents.get(event).set(selector, boundHandler);
    }

    /**
     * Remove event handler
     */
    off(event, selector) {
        if (this.delegatedEvents.has(event)) {
            this.delegatedEvents.get(event).delete(selector);
        }
    }

    /**
     * Global click handler with event delegation
     */
    handleGlobalClick(event) {
        this.handleDelegatedEvent('click', event);
    }

    /**
     * Global change handler with event delegation
     */
    handleGlobalChange(event) {
        this.handleDelegatedEvent('change', event);
    }

    /**
     * Global submit handler with event delegation
     */
    handleGlobalSubmit(event) {
        this.handleDelegatedEvent('submit', event);
    }

    /**
     * Handle delegated events by matching selectors
     */
    handleDelegatedEvent(eventType, event) {
        if (!this.delegatedEvents.has(eventType)) return;

        const handlers = this.delegatedEvents.get(eventType);
        
        for (const [selector, handler] of handlers) {
            // Check if element matches selector or has data attribute
            if (this.matchesSelector(event.target, selector)) {
                event.preventDefault();
                handler(event, event.target);
                break; // Stop after first match
            }
        }
    }

    /**
     * Enhanced selector matching including data attributes
     */
    matchesSelector(element, selector) {
        // Handle data attributes like [data-action="add-route"]
        if (selector.startsWith('[data-')) {
            const match = selector.match(/\[data-(\w+)(?:="([^"]+)")?\]/);
            if (match) {
                const [, attrName, attrValue] = match;
                const elementValue = element.dataset[attrName];
                return attrValue ? elementValue === attrValue : elementValue !== undefined;
            }
        }
        
        // Handle ID selectors
        if (selector.startsWith('#')) {
            return element.id === selector.slice(1);
        }
        
        // Handle class selectors
        if (selector.startsWith('.')) {
            return element.classList.contains(selector.slice(1));
        }
        
        // Handle tag selectors
        return element.tagName.toLowerCase() === selector.toLowerCase();
    }

    /**
     * Emit custom events
     */
    emit(eventName, data = {}) {
        const customEvent = new CustomEvent(eventName, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(customEvent);
    }

    /**
     * Listen for custom events
     */
    listen(eventName, handler, context = null) {
        const boundHandler = context ? handler.bind(context) : handler;
        document.addEventListener(eventName, boundHandler);
        
        // Store for cleanup
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(boundHandler);
    }

    /**
     * Clean up all event listeners
     */
    destroy() {
        // Remove custom event listeners
        for (const [eventName, handlers] of this.eventListeners) {
            handlers.forEach(handler => {
                document.removeEventListener(eventName, handler);
            });
        }
        
        // Remove global listeners
        document.removeEventListener('click', this.handleGlobalClick);
        document.removeEventListener('change', this.handleGlobalChange);
        document.removeEventListener('submit', this.handleGlobalSubmit);
        
        // Clear maps
        this.eventListeners.clear();
        this.delegatedEvents.clear();
    }
}

// Create singleton instance
const eventManager = new EventManager();

// Export both class and instance
export { EventManager, eventManager };