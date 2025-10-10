/**
 * Role Entity
 * Represents a project role with associated information cards
 */
export class Role {
  constructor({
    id = null,
    name = '',
    cards = [],
    projectId = null,
    createdAt = null,
    updatedAt = null
  } = {}) {
    this.id = id || this.generateId();
    this.name = name;
    this.cards = cards.map(card => new RoleCard(card));
    this.projectId = projectId;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }

  generateId() {
    return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Business logic methods
  addCard(cardData = {}) {
    const newCard = new RoleCard({
      ...cardData,
      roleId: this.id
    });
    this.cards.push(newCard);
    this.updatedAt = new Date();
    return newCard;
  }

  removeCard(cardId) {
    const initialLength = this.cards.length;
    this.cards = this.cards.filter(card => card.id !== cardId);
    
    if (this.cards.length < initialLength) {
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  updateCard(cardId, updates) {
    const card = this.cards.find(c => c.id === cardId);
    if (card) {
      Object.assign(card, updates);
      card.updatedAt = new Date();
      this.updatedAt = new Date();
      return card;
    }
    return null;
  }

  getCardById(cardId) {
    return this.cards.find(card => card.id === cardId);
  }

  hasValidData() {
    return this.name.trim() && 
           this.cards.length > 0 && 
           this.cards.some(card => card.hasValidData());
  }

  validate() {
    const errors = [];
    
    if (!this.name.trim()) {
      errors.push('Role name is required');
    }
    
    if (this.cards.length === 0) {
      errors.push('At least one card is required');
    }
    
    // Validate each card
    this.cards.forEach((card, index) => {
      const cardValidation = card.validate();
      if (!cardValidation.isValid) {
        cardValidation.errors.forEach(error => {
          errors.push(`Card ${index + 1}: ${error}`);
        });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  clone() {
    return new Role({
      id: null, // Generate new ID for clone
      name: this.name,
      cards: this.cards.map(card => card.clone()),
      projectId: this.projectId
    });
  }
}

/**
 * RoleCard Entity
 * Represents an information card within a role
 */
export class RoleCard {
  constructor({
    id = null,
    title = '',
    items = [''],
    roleId = null,
    createdAt = null,
    updatedAt = null
  } = {}) {
    this.id = id || this.generateId();
    this.title = title;
    this.items = Array.isArray(items) ? [...items] : [''];
    this.roleId = roleId;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }

  generateId() {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Business logic methods
  addItem(item = '') {
    this.items.push(item);
    this.updatedAt = new Date();
    return this.items.length - 1; // Return index of new item
  }

  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  updateItem(index, value) {
    if (index >= 0 && index < this.items.length) {
      this.items[index] = value;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  getValidItems() {
    return this.items.filter(item => item.trim());
  }

  hasValidData() {
    return this.title.trim() && this.getValidItems().length > 0;
  }

  validate() {
    const errors = [];
    
    if (!this.title.trim()) {
      errors.push('Card title is required');
    }
    
    if (this.getValidItems().length === 0) {
      errors.push('At least one item with content is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  clone() {
    return new RoleCard({
      id: null, // Generate new ID for clone
      title: this.title,
      items: [...this.items],
      roleId: this.roleId
    });
  }
}