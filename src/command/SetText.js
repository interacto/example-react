import {UndoableCommand} from 'interacto';

export class SetText extends UndoableCommand {
    constructor(component) {
        super();
        this.memento = "";
        this.component = component;
        this.newText = "";
    }

    createMemento() {
        this.memento = this.component.state.txt;
    }

    execution() {
        this.component.setState({txt: this.newText});
        this.component.setState({textFieldValue: this.newText});
    }

    canExecute() {
        return this.newText !== undefined;
    }

    set text(txt) {
        this.newText = txt;
    }

    undo() {
        this.component.setState({txt: this.memento});
        this.component.setState({textFieldValue: this.memento});
    }

    redo() {
        this.execution();
    }

    getUndoName() {
        return 'Set text';
    }

    getVisualSnapshot() {
      return this.newText;
    }
}
