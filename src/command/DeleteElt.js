import {UndoableCommand} from 'interacto';

export class DeleteElt extends UndoableCommand {

  constructor(svgDoc, svgElt) {
    super();
    this.svgDoc = svgDoc;
    this.svgElt = svgElt;
  }

  execution() {
    this.redo();
  }

  getUndoName() {
    return 'Delete SVG element';
  }

  redo() {
    this.svgDoc.removeChild(this.svgElt);
  }

  undo() {
    this.svgDoc.appendChild(this.svgElt);
  }
}
