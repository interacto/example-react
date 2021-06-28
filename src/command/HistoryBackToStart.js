import {CommandBase} from 'interacto';

export class HistoryBackToStart extends CommandBase {

  constructor(undoHistory) {
    super();
    this.undoHistory = undoHistory;
  }

  execution() {
    while (this.undoHistory.getUndo().length > 0) {
      this.undoHistory.undo();
    }
  }
}
