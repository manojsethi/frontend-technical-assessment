export class DragDrop {
    constructor() {
        this.draggedItem = null;
        this.items = [];
        this.dropZones = [];
    }

    init() {
        this.items = Array.from(document.querySelectorAll('.draggable-item'));
        this.dropZones = Array.from(document.querySelectorAll('.drop-zone'));
        
        if (this.items.length === 0 || this.dropZones.length === 0) {
            console.warn('Drag and drop elements not found');
            return;
        }

        this.setupDragEvents();
        this.setupDropEvents();
    }

    setupDragEvents() {
        this.items.forEach(item => {
            item.draggable = true;
            
            item.addEventListener('dragstart', (e) => {
                this.draggedItem = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.outerHTML);
            });

            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                this.draggedItem = null;
                // Remove drag-over class from all drop zones
                this.dropZones.forEach(zone => {
                    zone.classList.remove('drag-over');
                });
            });
        });
    }

    setupDropEvents() {
        this.dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragenter', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                // Only remove drag-over if we're actually leaving the drop zone
                if (!zone.contains(e.relatedTarget)) {
                    zone.classList.remove('drag-over');
                }
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                if (this.draggedItem) {
                    // Clone the dragged item and add it to the drop zone
                    const clonedItem = this.draggedItem.cloneNode(true);
                    clonedItem.classList.remove('dragging');
                    
                    // Remove the original item from its current location
                    this.draggedItem.remove();
                    
                    // Add the cloned item to the drop zone
                    zone.appendChild(clonedItem);
                    
                    // Update the items array to include the new item
                    this.items = Array.from(document.querySelectorAll('.draggable-item'));
                    this.setupDragEvents(); // Re-setup events for the new item
                }
            });
        });
    }
}
