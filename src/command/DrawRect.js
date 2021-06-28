import {UndoableCommand} from 'interacto';

export class DrawRect extends UndoableCommand {
  constructor(svgdoc) {
    super();
    this.svgdoc = svgdoc;
  }

  execution() {
    if (this.rec === undefined) {
      this.rec = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      this.svgdoc.appendChild(this.rec);
    }
    this.rec.setAttribute('x', this.minX.toString());
    this.rec.setAttribute('y', this.minY.toString());
    this.rec.setAttribute('height', (this.maxY - this.minY).toString());
    this.rec.setAttribute('width', (this.maxX - this.minX).toString());
  }

  setCoords(minX, minY, maxX, maxY) {
    this.maxY = maxY;
    this.minY = minY;
    this.maxX = maxX;
    this.minX = minX;
  }

  undo() {
    this.svgdoc.removeChild(this.rec);
  }

  redo() {
    this.svgdoc.appendChild(this.rec);
  }

  getUndoName() {
    return 'Draw Rectangle';
  }

  getVisualSnapshot() {
    const elt = this.rec.cloneNode();
    elt.setAttribute('left', '0');
    elt.setAttribute('x', '0');
    elt.setAttribute('y', '0');
    return elt;
  }
}
