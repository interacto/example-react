/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */

import {Subject} from "rxjs";
import {peek, UndoHistory} from "interacto";

export class UndoHistoryReact extends UndoHistory {
    constructor(component) {
        super();
        this.sizeMax = 0;
        this.undos = [];
        this.redos = [];
        this.sizeMax = 20;
        this.undoPublisher = new Subject();
        this.redoPublisher = new Subject();
        this.component = component;
    }

    undosObservable() {
        return this.undoPublisher;
    }

    redosObservable() {
        return this.redoPublisher;
    }

    clear() {
        if (this.undos.length > 0) {
            const newState = Object.assign({}, this.component.state);
            newState.bindings.undoHistory.undos = [];
            this.component.setState(newState);
            this.undoPublisher.next(undefined);
        }
        this.clearRedo();
    }

    clearRedo() {
        if (this.undos.length > 0) {
            const newState = Object.assign({}, this.component.state);
            newState.bindings.undoHistory.redos = [];
            this.component.setState(newState);
            this.redoPublisher.next(undefined);
        }
    }

    add(undoable) {
        if (this.sizeMax > 0) {
            if (this.undos.length === this.sizeMax) {
                const newState = Object.assign({}, this.component.state);
                const newUndos = this.undos.slice();
                newUndos.shift();
                newState.bindings.undoHistory.undos = newUndos;
                this.component.setState(newState);
            }
            const newUndos = this.undos.slice();
            newUndos.push(undoable);

            const newState = Object.assign({}, this.component.state);
            newState.bindings.undoHistory.undos = newUndos;
            newState.bindings.undoHistory.redos = [];
            this.component.setState(newState);

            this.undoPublisher.next(undoable);
            this.clearRedo();
        }
    }

    undo() {
        const newUndos = this.undos.slice();
        const undoable = newUndos.pop();

        if (undoable !== undefined) {
            undoable.undo();

            const newState = Object.assign({}, this.component.state);
            newState.bindings.undoHistory.undos = newUndos;
            const newRedos = this.redos.slice();
            newRedos.push(undoable);
            newState.bindings.undoHistory.redos = newRedos;
            this.component.setState(newState);

            this.undoPublisher.next(this.getLastUndo());
            this.redoPublisher.next(undoable);
        }
    }

    redo() {
        const newRedos = this.redos.slice();
        const undoable = newRedos.pop();

        if (undoable !== undefined) {
            undoable.redo();

            const newState = Object.assign({}, this.component.state);
            newState.bindings.undoHistory.redos = newRedos;
            const newUndos = this.undos.slice();
            newUndos.push(undoable);
            newState.bindings.undoHistory.undos = newUndos;
            this.component.setState(newState);

            this.undoPublisher.next(this.getLastUndo());
            this.redoPublisher.next(undoable);
        }
    }

    getLastUndoMessage() {
        return peek(this.undos)?.getUndoName();
    }

    getLastRedoMessage() {
        return peek(this.redos)?.getUndoName();
    }

    getLastOrEmptyUndoMessage() {
        return this.getLastUndoMessage() ?? "";
    }

    getLastOrEmptyRedoMessage() {
        return this.getLastRedoMessage() ?? "";
    }

    getLastUndo() {
        return peek(this.undos);
    }

    getLastRedo() {
        return peek(this.redos);
    }

    getSizeMax() {
        return this.sizeMax;
    }

    setSizeMax(max) {
        if (max >= 0) {
            const newUndos = this.undos.slice();
            const removed = newUndos.splice(0, this.undos.length - max);
            if (newUndos.length === 0 && removed.length > 0) {
                this.undoPublisher.next(undefined);
            }
            this.sizeMax = max;
            const newState = Object.assign({}, this.component.state);
            newState.bindings.undoHistory.undos = newUndos;
            this.component.setState(newState);
        }
    }

    getUndo() {
        return this.undos;
    }

    getRedo() {
        return this.redos;
    }
}
