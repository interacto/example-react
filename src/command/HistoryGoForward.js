import {CommandBase} from 'interacto';

export class HistoryGoForward extends CommandBase {

  constructor(index, undoHistory) {
    super();
    this.index = index;
    this.undoHistory = undoHistory;
  }

  execution() {
    const initialIndex = this.undoHistory.getRedo().length;
    while (this.undoHistory.getRedo().length !== initialIndex - this.index - 1) {
      this.undoHistory.redo();
    }
  }
}
