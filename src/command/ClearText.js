import {UndoableCommand} from 'interacto';

export class ClearText extends UndoableCommand {
    constructor(component) {
        super();
        this.memento = "";
        this.component = component;
    }

    createMemento() {
        this.memento = this.component.state.txt;
    }

    execution() {
        this.component.setState({textFieldValue: ''});
        this.component.setState({txt: ''});
    }

    undo() {
        this.component.state.txt = this.memento;
        this.component.state.textFieldValue = this.memento;
    }

    redo() {
        this.execution();
    }

    getUndoName() {
        return 'Clear text';
    }
}
