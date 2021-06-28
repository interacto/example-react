import {CommandBase} from 'interacto';

export class HistoryGoBack extends CommandBase {

  constructor(index, undoHistory) {
    super();
    this.undoHistory = undoHistory;
    this.index = index;
  }

  execution() {
    while (this.undoHistory.getUndo().length !== this.index + 1) {
      this.undoHistory.undo();
    }
  }
}
