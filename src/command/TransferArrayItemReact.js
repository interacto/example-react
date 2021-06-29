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

export class TransferArrayItemReact extends  UndoableCommand {
    constructor(component, srcArray, tgtArray, srcIndex, tgtIndex, cmdName, fromSrcToTgt) {
        super();
        this._component = component;
        this._srcArray = srcArray;
        this._tgtArray = tgtArray;
        this._srcIndex = srcIndex;
        this._tgtIndex = tgtIndex;
        this.cmdName = cmdName;
        this.fromSrcToTgt = fromSrcToTgt;
    }

    execution() {
        this.redo();
    }

     canExecute() {
        return (this._srcIndex >= 0 && this._srcIndex < this._srcArray.length) &&
            (this._tgtIndex >= 0 && this._tgtIndex <= this._tgtArray.length);
    }

    getUndoName() {
        return this.cmdName;
    }

    redo() {
        const newSrc = this._component.state[this._srcArray].slice();
        const elt = newSrc[this._srcIndex];
        newSrc.splice(this._srcIndex, 1);
        this._component.setState({ [this._srcArray]: newSrc});

        const newTgt = this._component.state[this._tgtArray].slice();
        newTgt.splice(this._tgtIndex, 0, elt);
        this._component.setState({ [this._tgtArray]: newTgt});
    }

    undo() {
        const newTgt = this._component.state[this._tgtArray].slice();
        const elt = newTgt[this._tgtIndex];
        newTgt.splice(this._tgtIndex, 1);
        this._component.setState({ [this._tgtArray]: newTgt});

        const newSrc = this._component.state[this._srcArray].slice();
        newSrc.splice(this._srcIndex, 0, elt);
        this._component.setState({ [this._srcArray]: newSrc});
    }

    get srcArray() {
        return this._srcArray;
    }

    set srcArray(value) {
        this._srcArray = value;
    }

    get tgtArray() {
        return this._tgtArray;
    }

    set tgtArray(value) {
        this._tgtArray = value;
    }

    get srcIndex() {
        return this._srcIndex;
    }

    set srcIndex(value) {
        this._srcIndex = value;
    }

    get tgtIndex() {
        return this._tgtIndex;
    }

    set tgtIndex(value) {
        this._tgtIndex = value;
    }
}
