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

import {UndoableCommand} from "interacto";
import {Component} from 'react';

export class TransferArrayItemReact<T> extends  UndoableCommand {
    private _srcArrayKey: keyof Readonly<{}>;
    private _tgtArrayKey: keyof Readonly<{}>;

    constructor(private component: Component,
                srcArrayKey: string,
                tgtArrayKey: string,
                private _srcIndex: number,
                private _tgtIndex: number,
                private _cmdName: string) {
        super();
        this._srcArrayKey = srcArrayKey as keyof Readonly<{}>;
        this._tgtArrayKey = tgtArrayKey as keyof Readonly<{}>;
    }

    execution() {
        this.redo();
    }

     canExecute() {
        return (this._srcIndex >= 0 && this._srcIndex < (this.component.state[this._srcArrayKey] as Array<T>).length) &&
            (this._tgtIndex >= 0 && this._tgtIndex <= (this.component.state[this._tgtArrayKey] as Array<T>).length);
    }

    getUndoName() {
        return this._cmdName;
    }

    redo() {
        const newSrc = (this.component.state[this._srcArrayKey] as Array<T>).slice();
        const elt = newSrc[this._srcIndex];
        newSrc.splice(this._srcIndex, 1);
        this.component.setState({ [this._srcArrayKey]: newSrc});

        const newTgt = (this.component.state[this._tgtArrayKey] as Array<T>).slice();
        newTgt.splice(this._tgtIndex, 0, elt);
        this.component.setState({ [this._tgtArrayKey]: newTgt});
    }

    undo() {
        const newTgt = (this.component.state[this._tgtArrayKey] as Array<T>).slice();
        const elt = newTgt[this._tgtIndex];
        newTgt.splice(this._tgtIndex, 1);
        this.component.setState({ [this._tgtArrayKey]: newTgt});

        const newSrc = (this.component.state[this._srcArrayKey] as Array<T>).slice();
        newSrc.splice(this._srcIndex, 0, elt);
        this.component.setState({ [this._srcArrayKey]: newSrc});
    }

    get srcArray(): string {
        return this._srcArrayKey;
    }

    set srcArray(value: string) {
        this._srcArrayKey = value as keyof Readonly<{}>;
    }

    get tgtArray(): string {
        return this._tgtArrayKey;
    }

    set tgtArray(value: string) {
        this._tgtArrayKey = value as keyof Readonly<{}>;
    }

    get srcIndex(): number {
        return this._srcIndex;
    }

    set srcIndex(value: number) {
        this._srcIndex = value;
    }

    get tgtIndex(): number {
        return this._tgtIndex;
    }

    set tgtIndex(value: number) {
        this._tgtIndex = value;
    }
}
