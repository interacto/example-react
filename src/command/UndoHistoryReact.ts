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
import type {Observable} from "rxjs";
import {peek, Undoable, UndoHistory} from 'interacto';
import BindingsProvider from "../components/BindingsProvider";

export class UndoHistoryReact extends UndoHistory {
    private readonly undos: Array<Undoable>;
    private readonly redos: Array<Undoable>;
    private sizeMax: number;
    private readonly undoPublisher: Subject<Undoable | undefined>;
    private readonly redoPublisher: Subject<Undoable | undefined>;

    constructor(private component: BindingsProvider) {
        super();
        this.sizeMax = 0;
        this.undos = [];
        this.redos = [];
        this.sizeMax = 20;
        this.undoPublisher = new Subject();
        this.redoPublisher = new Subject();
        this.component = component;
    }

    public undosObservable(): Observable<Undoable | undefined> {
        return this.undoPublisher;
    }

    public redosObservable(): Observable<Undoable | undefined> {
        return this.redoPublisher;
    }

    public clear(): void {
        if (this.undos.length > 0) {
            const newState = Object.assign({}, this.component.state);
            ((newState.bindings.undoHistory as UndoHistoryReact).undos as Array<Undoable>) = [];
            this.component.setState(newState);
            this.undoPublisher.next(undefined);
        }
        this.clearRedo();
    }

    private clearRedo(): void {
        if (this.redos.length > 0) {
            const newState = Object.assign({}, this.component.state);
            ((newState.bindings.undoHistory as UndoHistoryReact).redos as Array<Undoable>) = [];
            this.component.setState(newState);
            this.redoPublisher.next(undefined);
        }
    }

    public add(undoable: Undoable): void {
        if (this.sizeMax > 0) {
            if (this.undos.length === this.sizeMax) {
                const newState = Object.assign({}, this.component.state);
                const newUndos = this.undos.slice();
                newUndos.shift();
                ((newState.bindings.undoHistory as UndoHistoryReact).undos as Array<Undoable>) = newUndos;
                this.component.setState(newState);
            }
            const newUndos = this.undos.slice();
            newUndos.push(undoable);

            const newState = Object.assign({}, this.component.state);
            ((newState.bindings.undoHistory as UndoHistoryReact).undos as Array<Undoable>) = newUndos;
            ((newState.bindings.undoHistory as UndoHistoryReact).redos as Array<Undoable>) = [];
            this.component.setState(newState);

            this.undoPublisher.next(undoable);
            this.clearRedo();
        }
    }

    public undo(): void {
        const newUndos = this.undos.slice();
        const undoable = newUndos.pop();

        if (undoable !== undefined) {
            undoable.undo();

            const newState = Object.assign({}, this.component.state);
            ((newState.bindings.undoHistory as UndoHistoryReact).undos as Array<Undoable>) = newUndos;
            const newRedos = this.redos.slice();
            newRedos.push(undoable);
            ((newState.bindings.undoHistory as UndoHistoryReact).redos as Array<Undoable>) = newRedos;
            this.component.setState(newState);

            this.undoPublisher.next(this.getLastUndo());
            this.redoPublisher.next(undoable);
        }
    }

    public redo(): void {
        const newRedos = this.redos.slice();
        const undoable = newRedos.pop();

        if (undoable !== undefined) {
            undoable.redo();

            const newState = Object.assign({}, this.component.state);
            ((newState.bindings.undoHistory as UndoHistoryReact).redos as Array<Undoable>) = newRedos;
            const newUndos = this.undos.slice();
            newUndos.push(undoable);
            ((newState.bindings.undoHistory as UndoHistoryReact).undos as Array<Undoable>) = newUndos;
            this.component.setState(newState);

            this.undoPublisher.next(this.getLastUndo());
            this.redoPublisher.next(undoable);
        }
    }

    public getLastUndoMessage(): string | undefined {
        return peek(this.undos)?.getUndoName();
    }

    public getLastRedoMessage(): string | undefined {
        return peek(this.redos)?.getUndoName();
    }

    public getLastOrEmptyUndoMessage(): string {
        return this.getLastUndoMessage() ?? "";
    }

    public getLastOrEmptyRedoMessage(): string {
        return this.getLastRedoMessage() ?? "";
    }

    public getLastUndo(): Undoable | undefined {
        return peek(this.undos);
    }

    public getLastRedo(): Undoable | undefined {
        return peek(this.redos);
    }

    public getSizeMax(): number {
        return this.sizeMax;
    }

    public setSizeMax(max: number): void {
        if (max >= 0) {
            const newUndos = this.undos.slice();
            const removed = newUndos.splice(0, this.undos.length - max);
            if (newUndos.length === 0 && removed.length > 0) {
                this.undoPublisher.next(undefined);
            }
            this.sizeMax = max;
            const newState = Object.assign({}, this.component.state);
            ((newState.bindings.undoHistory as UndoHistoryReact).undos as Array<Undoable>) = newUndos;
            this.component.setState(newState);
        }
    }

    public getUndo(): ReadonlyArray<Undoable> {
        return this.undos;
    }

    public getRedo(): ReadonlyArray<Undoable> {
        return this.redos;
    }
}
