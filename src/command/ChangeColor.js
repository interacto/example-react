import {UndoableCommand} from 'interacto';

export class ChangeColor extends UndoableCommand {
  constructor(svgElt) {
    super();
    this.svgElt = svgElt;
  }

  createMemento() {
    this.mementoColor = this.svgElt.getAttribute('fill');
  }

  execution() {
    this.newColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
    this.redo();
  }

  undo() {
    this.svgElt.setAttribute('fill', this.mementoColor);
  }

  redo() {
    this.svgElt.setAttribute('fill', this.newColor);
  }

  getUndoName() {
    return 'Change color';
  }

  /**
   * Returns a copy of the shape with its new color as a snapshot.
   */
  getVisualSnapshot() {
    const elt = this.svgElt.cloneNode();
    elt.setAttribute('fill', this.newColor);
    elt.setAttribute('left', '0');
    elt.setAttribute('x', '0');
    elt.setAttribute('y', '0');
    return elt;
  }
}
