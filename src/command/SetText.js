import {UndoableCommand} from 'interacto';

export class SetText extends UndoableCommand {
    constructor(component, txt, textFieldValue) {
        super();
        this.memento = "";
        this.component = component;
        this.newText = "";
        this.txt = txt;
        this.textFieldValue = textFieldValue;
    }

    createMemento() {
        this.memento = this.component.state[this.txt];
    }

    execution() {
        this.component.setState({[this.txt]: this.newText});
        this.component.setState({[this.textFieldValue]: this.newText});
    }

    canExecute() {
        return this.newText !== undefined;
    }

    set text(txt) {
        this.newText = txt;
    }

    undo() {
        this.component.setState({[this.txt]: this.memento});
        this.component.setState({[this.textFieldValue]: this.memento});
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
